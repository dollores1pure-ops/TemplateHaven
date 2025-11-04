import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import {
  adminStatsSchema,
  insertCartItemSchema,
  insertTemplateSchema,
  templateCategories,
  templateStatuses,
  updateTemplateSchema,
} from "@shared/schema";
import { storage, type TemplateFilters, type TemplateSort } from "./storage";

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

function handleZodError(res: Response, error: z.ZodError) {
  const issues = error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
  res.status(400).json({ message: "Invalid request", issues });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

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
      const cart = await ensureCart(req);
      if (cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const order = await storage.createOrderFromCart(cart.id);
      const freshCart = await storage.getOrCreateCart(cart.id);
      res.status(201).json({ order, cart: freshCart });
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
