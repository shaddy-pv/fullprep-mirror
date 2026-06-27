import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve("backend", ".env") });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));
  
  // Reset all users' AI hint counters (they were test chats)
  const result = await User.updateMany({}, { $set: { aiHintsUsed: 0, aiHintsLastReset: new Date() } });
  console.log(`Reset aiHintsUsed for ${result.modifiedCount} user(s).`);
  process.exit(0);
}
run();
