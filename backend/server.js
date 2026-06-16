/**
 * @file server.js
 * @description Application entry point.
 *              Loads environment variables, connects to MongoDB,
 *              and starts the HTTP server.
 */

import "dotenv/config"; // Must be the very first import
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

// ── Bootstrap ─────────────────────────────────────────────────────────────────

const startServer = async () => {
  try {
    // 1. Connect to MongoDB Atlas before accepting any traffic
    await connectDB();

    // 2. Start HTTP server
    const server = app.listen(PORT, () => {
      console.log("");
      console.log("╔══════════════════════════════════════════════╗");
      console.log("║         🚀  FullPrep API is running           ║");
      console.log("╠══════════════════════════════════════════════╣");
      console.log(`║  Port        : ${PORT}                           `);
      console.log(`║  Environment : ${process.env.NODE_ENV || "development"}              `);
      console.log(`║  Health      : http://localhost:${PORT}/health    `);
      console.log("╚══════════════════════════════════════════════╝");
      console.log("");
    });

    // ── Unhandled Promise Rejections ──────────────────────────
    process.on("unhandledRejection", (reason) => {
      console.error("💥  Unhandled Promise Rejection:", reason);
      // Give the server time to finish in-flight requests, then exit
      server.close(() => {
        console.error("🛑  Server closed due to unhandled rejection.");
        process.exit(1);
      });
    });

    // ── Uncaught Exceptions ───────────────────────────────────
    process.on("uncaughtException", (err) => {
      console.error("💥  Uncaught Exception:", err);
      server.close(() => {
        console.error("🛑  Server closed due to uncaught exception.");
        process.exit(1);
      });
    });
  } catch (err) {
    console.error("❌  Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
// triggered restart
