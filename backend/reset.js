import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
  
  // Reset rating to 0 if it is exactly 1200
  const res = await User.updateMany({ contestRating: 1200 }, { $set: { contestRating: 0 } });
  console.log("Users updated to 0 rating:", res.modifiedCount);
  
  // Set highestRank if it's currently missing or 0 for users who have points
  // We can calculate ranks later, but let's just reset the ratings first
  
  process.exit(0);
}

run().catch(console.error);
