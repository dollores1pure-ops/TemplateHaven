import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import Stripe from "stripe";
import { createServer, type Server } from "http";
import { z } from "zod";
import multer from "multer";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import {
  adminStatsSchema,
  insertCartItemSchema,
  insertTemplateSchema,
  templateCategories,
  templateStatuses,
  updateTemplateSchema,
} from "@shared/schema";
import { storage, type TemplateFilters, type TemplateSort } from "./storage";

type CheckoutOrder = Awaited<ReturnType<typeof storage.createOrderFromCart>>;

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeApiVersion: Stripe.LatestApiVersion = "2024-06-20";
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: stripeApiVersion })
  : null;

if (!stripeSecretKey) {
  console.warn("STRIPE_SECRET_KEY is not set. Stripe checkout is disabled.");
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const templateSortValues = [
  "newest",
  "oldest",
  "priceAsc",
  "priceDesc",
  "title",
] as const;

const templateCategoryFilterSchema = z.union([
  z.literal("all"),
  z.enum(templateCategories),
]);

const templateStatusFilterSchema = z.union([
  z.literal("all"),
  z.enum(templateStatuses),
]);

const templateListQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  category: templateCategoryFilterSchema.optional(),
  status: templateStatusFilterSchema.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(templateSortValues).optional(),
});

const createTemplateSchema = insertTemplateSchema.extend({
  price: z.coerce.number().min(0),
});

const updateTemplatePayloadSchema = updateTemplateSchema
  .omit({ id: true })
  .extend({
    price: z.coerce.number().min(0).optional(),
  });

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int(),
});

const checkoutCompletionSchema = z.object({
  sessionId: z.string().trim().min(1, "sessionId is required"),
});

const uploadsDirectory = path.resolve(
  process.cwd(),
  process.env.UPLOADS_DIR ?? "uploads",
);
mkdirSync(uploadsDirectory, { recursive: true });

const maxUploadSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 25);
const uploadFileSizeLimit =
  Number.isFinite(maxUploadSizeMb) && maxUploadSizeMb > 0
    ? maxUploadSizeMb * 1024 * 1024
    : 25 * 1024 * 1024;

const maxUploadFilesEnv = Number(process.env.MAX_UPLOAD_FILES ?? 10);
const uploadFileLimit =
  Number.isFinite(maxUploadFilesEnv) && maxUploadFilesEnv > 0
    ? Math.floor(maxUploadFilesEnv)
    : 10;

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDirectory);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname ?? "").toLowerCase();
    const safeExtension = extension && extension.length <= 10 ? extension : "";
    const uniqueName = `${Date.now()}-${randomUUID()}${safeExtension}`;
    cb(null, uniqueName);
  },
});

const baseUpload = multer({
  storage: uploadStorage,
  limits: {
    fileSize: uploadFileSizeLimit,
    files: uploadFileLimit,
  },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype?.startsWith("image/") ||
      file.mimetype?.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

const mediaUpload = baseUpload.array("files");

const mediaUploadMiddleware: express.RequestHandler = (req, res, next) => {
  mediaUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        const status =
          err.code === "LIMIT_FILE_SIZE" || err.code === "LIMIT_FILE_COUNT"
            ? 413
            : 400;
        return res.status(status).json({ message: err.message });
      }

      if (err instanceof Error) {
        return res.status(400).json({ message: err.message });
      }

      return res.status(400).json({ message: "Upload failed" });
    }

    next();
  });
};

function asyncHandler(
  handler: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void | Response>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

const requireAuth: express.RequestHandler = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};

async function ensureCart(req: Request) {
  const currentCartId = req.session.cartId;
  const cart = await storage.getOrCreateCart(currentCartId);
  if (!currentCartId || cart.id !== currentCartId) {
    req.session.cartId = cart.id;
  }
  return cart;
}

function getRequestBaseUrl(req: Request): string {
  const configured = process.env.CHECKOUT_BASE_URL;
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto?.split(",")[0] ?? req.protocol;

  const forwardedHost = req.headers["x-forwarded-host"];
  const host = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost ?? req.get("host");

  if (!host) {
    throw new Error("Unable to determine host for checkout session");
  }

  return `${protocol}://${host}`;
}

function handleZodError(res: Response, error: z.ZodError) {
  const issues = error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
  res.status(400).json({ message: "Invalid request", issues });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  app.use(
    "/uploads",
    express.static(uploadsDirectory, { maxAge: "7d", immutable: true }),
  );

  apiRouter.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  apiRouter.post(
    "/auth/login",
    asyncHandler(async (req, res) => {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return handleZodError(res, parsed.error);
      }

      const user = await storage.verifyUserCredentials(
        parsed.data.username,
        parsed.data.password,
      );

      if (!user) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      req.session.userId = user.id;
      res.json({ id: user.id, username: user.username });
    }),
  );

  apiRouter.post(
    "/auth/logout",
    asyncHandler(async (req, res) => {
      const destroySession = () =>
        new Promise<void>((resolve, reject) => {
          req.session.destroy((err) => {
            if (err) {
              reject(err);
            } else {
              res.clearCookie("templhub.sid");
              resolve();
            }
          });
        });

      await destroySession();
      res.status(204).send();
    }),
  );

  apiRouter.get(
    "/auth/me",
    asyncHandler(async (req, res) => {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "Unauthenticated" });
      }

      res.json({ id: user.id, username: user.username });
    }),
  );

  apiRouter.get(
    "/templates",
    asyncHandler(async (req, res) => {
      const parsed = templateListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return handleZodError(res, parsed.error);
      }

      const { minPrice, maxPrice } = parsed.data;
      if (
        minPrice !== undefined &&
        maxPrice !== undefined &&
        minPrice > maxPrice
      ) {
        return res.status(400).json({
          message: "minPrice cannot be greater than maxPrice",
        });
      }

      const filters: TemplateFilters = {
        search: parsed.data.search,
        category:
          parsed.data.category && parsed.data.category !== "all"
            ? parsed.data.category
            : undefined,
        status:
          parsed.data.status && parsed.data.status !== "all"
            ? parsed.data.status
            : undefined,
        minPrice: parsed.data.minPrice,
        maxPrice: parsed.data.maxPrice,
        sort: parsed.data.sort,
      };

      const templates = await storage.listTemplates(filters);
      res.json({ data: templates, meta: { total: templates.length } });
    }),
  );

    apiRouter.get(
      "/templates/:idOrSlug",
      asyncHandler(async (req, res) => {
        const { idOrSlug } = req.params;
        const lookupValue = idOrSlug.trim();
        const template = UUID_REGEX.test(lookupValue)
          ? await storage.getTemplate(lookupValue)
          : await storage.getTemplateBySlug(lookupValue.toLowerCase());

        if (!template) {
          return res.status(404).json({ message: "Template not found" });
        }

        res.json(template);
      }),
    );

    apiRouter.post(
      "/templates",
      requireAuth,
      asyncHandler(async (req, res) => {
        const parsed = createTemplateSchema.safeParse(req.body);
        if (!parsed.success) {
          return handleZodError(res, parsed.error);
        }

        const template = await storage.createTemplate(parsed.data);
        res.status(201).json(template);
      }),
    );

    apiRouter.post(
      "/uploads",
      requireAuth,
      mediaUploadMiddleware,
      (req, res) => {
        const files = (req.files as Express.Multer.File[] | undefined) ?? [];

        if (!files.length) {
          return res.status(400).json({ message: "No files uploaded" });
        }

        const uploads = files.map((file) => ({
          url: `/uploads/${file.filename}`,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          type: file.mimetype.startsWith("image/")
            ? "image"
            : file.mimetype.startsWith("video/")
              ? "video"
              : "other",
        }));

        res.status(201).json({ files: uploads });
      },
    );

    apiRouter.put(
    "/templates/:idOrSlug",
    requireAuth,
    asyncHandler(async (req, res) => {
      const { idOrSlug } = req.params;
      const parsed = updateTemplatePayloadSchema.safeParse(req.body);
      if (!parsed.success) {
        return handleZodError(res, parsed.error);
      }

      const existing = UUID_REGEX.test(idOrSlug)
        ? await storage.getTemplate(idOrSlug)
        : await storage.getTemplateBySlug(idOrSlug.toLowerCase());

      if (!existing) {
        return res.status(404).json({ message: "Template not found" });
      }

      const updated = await storage.updateTemplate(existing.id, {
        ...parsed.data,
        id: existing.id,
      });

      res.json(updated);
    }),
  );

  apiRouter.delete(
    "/templates/:idOrSlug",
    requireAuth,
    asyncHandler(async (req, res) => {
      const { idOrSlug } = req.params;
      const existing = UUID_REGEX.test(idOrSlug)
        ? await storage.getTemplate(idOrSlug)
        : await storage.getTemplateBySlug(idOrSlug.toLowerCase());

      if (!existing) {
        return res.status(404).json({ message: "Template not found" });
      }

      await storage.deleteTemplate(existing.id);
      res.status(204).send();
    }),
  );

  apiRouter.get(
    "/cart",
    asyncHandler(async (req, res) => {
      const cart = await ensureCart(req);
      res.json(cart);
    }),
  );

  apiRouter.post(
    "/cart/items",
    asyncHandler(async (req, res) => {
      const cart = await ensureCart(req);
      const parsed = insertCartItemSchema.safeParse(req.body);
      if (!parsed.success) {
        return handleZodError(res, parsed.error);
      }

      try {
        const updatedCart = await storage.addCartItem(cart.id, parsed.data);
        res.status(201).json(updatedCart);
      } catch (error) {
        if (error instanceof Error && error.message.includes("Template")) {
          return res.status(404).json({ message: error.message });
        }
        throw error;
      }
    }),
  );

  apiRouter.patch(
    "/cart/items/:itemId",
    asyncHandler(async (req, res) => {
      const cart = await ensureCart(req);
      const parsed = updateCartItemSchema.safeParse(req.body);
      if (!parsed.success) {
        return handleZodError(res, parsed.error);
      }

      try {
        const updatedCart = await storage.updateCartItem(
          cart.id,
          req.params.itemId,
          parsed.data.quantity,
        );

        res.json(updatedCart);
      } catch (error) {
        if (error instanceof Error && error.message.includes("not found")) {
          return res.status(404).json({ message: error.message });
        }
        throw error;
      }
    }),
  );

    apiRouter.delete(
      "/cart/items/:itemId",
      asyncHandler(async (req, res) => {
        const cart = await ensureCart(req);
        const updatedCart = await storage.removeCartItem(
          cart.id,
          req.params.itemId,
        );
        res.json(updatedCart);
      }),
    );

    apiRouter.post(
      "/cart/checkout",
      asyncHandler(async (req, res) => {
        if (!stripe) {
          return res
            .status(503)
            .json({ message: "Stripe is not configured" });
        }

        const cart = await ensureCart(req);
        if (cart.items.length === 0) {
          return res.status(400).json({ message: "Cart is empty" });
        }

        const baseUrl = getRequestBaseUrl(req);
        const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${baseUrl}/checkout/cancel`;
        const currency = (process.env.STRIPE_CURRENCY ?? "usd").toLowerCase();

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
          cart.items.map((item) => ({
            quantity: item.quantity,
            price_data: {
              currency,
              unit_amount: Math.round(item.unitPrice * 100),
              product_data: {
                name: item.template.title,
                images: item.template.heroImage
                  ? [item.template.heroImage]
                  : undefined,
              },
            },
          }));

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: lineItems,
          success_url: successUrl,
          cancel_url: cancelUrl,
          allow_promotion_codes: true,
          metadata: {
            cartId: cart.id,
          },
          automatic_tax: { enabled: false },
        });

        if (!session.url) {
          return res
            .status(500)
            .json({ message: "Failed to create Stripe checkout session" });
        }

        res.status(201).json({ url: session.url, sessionId: session.id });
      }),
    );

    apiRouter.post(
      "/cart/checkout/complete",
      asyncHandler(async (req, res) => {
        if (!stripe) {
          return res
            .status(503)
            .json({ message: "Stripe is not configured" });
        }

        const parsed = checkoutCompletionSchema.safeParse(req.body);
        if (!parsed.success) {
          return handleZodError(res, parsed.error);
        }

        const { sessionId } = parsed.data;
        const checkoutSession = await stripe.checkout.sessions.retrieve(
          sessionId,
        );

        if (
          checkoutSession.payment_status !== "paid" &&
          checkoutSession.status !== "complete"
        ) {
          return res
            .status(400)
            .json({ message: "Checkout session is not paid" });
        }

        const cartId = checkoutSession.metadata?.cartId as string | undefined;
        if (!cartId) {
          return res
            .status(400)
            .json({ message: "Checkout session missing cart information" });
        }

        const completedSessions =
          req.session.completedCheckoutSessionIds ?? [];
        let order: CheckoutOrder | undefined;

        if (!completedSessions.includes(sessionId)) {
          try {
            order = await storage.createOrderFromCart(cartId);
            req.session.completedCheckoutSessionIds = [
              ...completedSessions,
              sessionId,
            ];
          } catch (error) {
            if (
              error instanceof Error &&
              error.message.toLowerCase().includes("cart is empty")
            ) {
              const orders = await storage.listOrders();
              order = orders.find((existing) => existing.cartId === cartId);
            } else {
              throw error;
            }
          }
        } else {
          const orders = await storage.listOrders();
          order = orders.find((existing) => existing.cartId === cartId);
        }

        if (!order) {
          const orders = await storage.listOrders();
          order = orders.find((existing) => existing.cartId === cartId);
        }

        if (!order) {
          return res
            .status(404)
            .json({ message: "No order found for this checkout session" });
        }

        const cart = await storage.getOrCreateCart(cartId);
        res.json({ order, cart });
      }),
    );

  apiRouter.get(
    "/admin/stats",
    requireAuth,
    asyncHandler(async (_req, res) => {
      const stats = await storage.getAdminStats();
      // ensure schema shape
      const parsed = adminStatsSchema.parse(stats);
      res.json(parsed);
    }),
  );

  apiRouter.get(
    "/admin/orders",
    requireAuth,
    asyncHandler(async (_req, res) => {
      const orders = await storage.listOrders();
      res.json({ data: orders, meta: { total: orders.length } });
    }),
  );

  apiRouter.use((req, res) => {
    res.status(404).json({ message: `No route for ${req.path}` });
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
