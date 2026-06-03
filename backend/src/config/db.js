/**
 * @file db.js
 * @description MongoDB Atlas connection using Mongoose.
 *              Handles connection retries and graceful shutdown.
 */

import mongoose from "mongoose";

/**
 * Connects to MongoDB Atlas.
 * Exits the process if the initial connection fails.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8+ no longer needs useNewUrlParser / useUnifiedTopology
    });

    console.log(`✅  MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌  MongoDB connection error: ${error.message}`);
    process.exit(1); // Crash fast — let the process manager restart the app
  }
};

// ── Mongoose global event listeners ──────────────────────────────────────────

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️   MongoDB disconnected.");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄  MongoDB reconnected.");
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────

const gracefulShutdown = async (signal) => {
  console.log(`\n🛑  ${signal} received — closing MongoDB connection…`);
  await mongoose.connection.close();
  console.log("✅  MongoDB connection closed. Exiting.");
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

export default connectDB;
