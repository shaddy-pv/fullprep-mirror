/**
 * @file server.js
 * @description Application entry point.
 *              Loads environment variables, connects to MongoDB,
 *              and starts the HTTP server.
 */

process.env.UV_THREADPOOL_SIZE = 128;
import "dotenv/config"; // Must be the very first import
import mongoose from "mongoose";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { startSubmissionWorker } from "./src/workers/submissionWorker.js";
import { logger } from "./src/utils/logger.js";

const PORT = process.env.PORT || 5000;

// ── Bootstrap ─────────────────────────────────────────────────────────────────

const startServer = async () => {
  try {
    // 1. Connect to MongoDB Atlas before accepting any traffic
    await connectDB();

    // 1.5 Start Background Workers
    startSubmissionWorker();

    // 2. Start HTTP server
    const server = app.listen(PORT, "0.0.0.0", 4096, () => {
      logger.info(`FullPrep API is running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
    });

    // ── Graceful Shutdown ─────────────────────────────────────
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        logger.info("HTTP server closed.");
        try {
          await mongoose.connection.close();
          logger.info("MongoDB connection closed.");
          process.exit(0);
        } catch (err) {
          logger.error("Error closing MongoDB connection", { error: err.message });
          process.exit(1);
        }
      });

      // Force close after 10 seconds if graceful shutdown hangs
      setTimeout(() => {
        logger.error("Graceful shutdown timed out. Forcefully exiting.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // ── Unhandled Promise Rejections ──────────────────────────
    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled Promise Rejection occurred", {
        reason: reason instanceof Error ? reason.message : reason,
        stack: reason instanceof Error ? reason.stack : undefined,
      });
      server.close(() => {
        logger.error("Server closed due to unhandled rejection.");
        process.exit(1);
      });
    });

    // ── Uncaught Exceptions ───────────────────────────────────
    process.on("uncaughtException", (err) => {
      logger.error("Uncaught Exception occurred", {
        error: err.message,
        stack: err.stack,
      });
      server.close(() => {
        logger.error("Server closed due to uncaught exception.");
        process.exit(1);
      });
    });
  } catch (err) {
    logger.error("Failed to start server", { error: err.message });
    process.exit(1);
  }
};

startServer();