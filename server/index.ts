import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectSession from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
if (app.get("env") === "production") {
  app.set("trust proxy", 1);
}
const MemoryStore = connectSession(session);

declare module "express-session" {
  interface SessionData {
    userId?: string;
    cartId?: string;
  }
}

// Extinderea tipurilor pentru rawBody
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Middleware JSON + rawBody
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

const sessionSecret = process.env.SESSION_SECRET || "templatehub-dev-secret";

if (!process.env.SESSION_SECRET) {
  log("SESSION_SECRET not set, falling back to development secret", "config");
}

app.use(
  session({
    name: "templhub.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 1000 * 60 * 60 * 24, // prune expired sessions daily
    }),
    cookie: {
      httpOnly: true,
      secure: app.get("env") === "production",
      sameSite: app.get("env") === "production" ? "lax" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  }),
);

// Middleware logging pentru API
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  // Înregistrare rute
  const server = await registerRoutes(app);

  // Middleware error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite doar în development
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Port și host compatibil Windows/Linux
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.platform === "win32" ? "127.0.0.1" : "0.0.0.0";

  server.listen(
    {
      port,
      host,
      ...(process.platform !== "win32" ? { reusePort: true } : {}),
    },
    () => {
      log(`Server running on ${host}:${port}`);
    },
  );
})();
