/**
 * @file app.js
 * @description Express application setup.
 *              Configures middleware stack, routes, and error handlers.
 *              Kept separate from server.js so the app can be imported
 *              into tests without binding to a port.
 */

import "express-async-errors"; // Patches async route handlers — must be first
import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import compression from "compression";

import authRoutes       from "./routes/authRoutes.js";
import healthRoutes    from "./routes/healthRoutes.js";
import problemRoutes   from "./routes/problemRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import userRoutes         from "./routes/userRoutes.js";
import settingsRoutes     from "./routes/settingsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { requestTracker } from "./middleware/requestTracker.js";
import { logger }         from "./utils/logger.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

// Trust all reverse proxies (Render often uses multiple hops)
app.set("trust proxy", true);

// Sentry request handler must be the first middleware
Sentry.setupExpressErrorHandler(app);

// Request tracking middleware must be applied early to trace execution duration
app.use(requestTracker);

// ── Security Headers ──────────────────────────────────────────────────────────

app.use(compression());
app.use(helmet()); // Sets secure HTTP response headers

// ── CORS ──────────────────────────────────────────────────────────────────────

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, curl, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin "${origin}" is not allowed.`));
      }
    },
    credentials: true, // Allow cookies to be sent cross-origin
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// Skip rate limiting in development — hot reloads burn through limits fast.
// Only enforce in production where real abuse is possible.

const isDev = process.env.NODE_ENV !== "production";

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 min
  max: 5000,                                             // Bump limit extremely high
  skip: () => true,    // DISABLED FOR NOW TO UNBLOCK PRODUCTION
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});

// Apply rate limit to all /api routes
app.use("/api", limiter);

// Stricter limit on auth endpoints to mitigate brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000,
  skip: () => true,    // DISABLED FOR NOW
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

// ── Request Parsing ───────────────────────────────────────────────────────────

app.use(express.json({ limit: "10mb" }));          // JSON body, max 10 MB
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());                           // Parse signed cookies

// ── HTTP Request Logging ──────────────────────────────────────────────────────

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ── Health Check ──────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    service: "FullPrep API",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

import { checkSystemSettings } from "./middleware/settingsMiddleware.js";

// ── API Routes ────────────────────────────────────────────────────────────────

// Enforce System Settings globally (e.g. Maintenance Mode)
app.use("/api", checkSystemSettings);

app.use("/api",          healthRoutes);
app.use("/api/auth",     authRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/settings",      settingsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────────

// Sentry error handler
app.use(Sentry.expressErrorHandler());

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log error using structured logger
  logger.error(err.message || "Internal Server Error", {
    name: err.name,
    stack: err.stack,
    statusCode: err.statusCode || 500,
  });

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(". "),
    });
  }

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `An account with this ${field} already exists.`,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid value for field: ${err.path}`,
    });
  }

  // CORS error
  if (err.message?.startsWith("CORS policy")) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  // Default internal server error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error. Please try again later.",
  });
});

export default app;
