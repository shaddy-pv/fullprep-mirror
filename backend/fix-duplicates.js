import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve("backend", ".env") });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Problem = mongoose.model("Problem", new mongoose.Schema({}, { strict: false }));
  
  // Find all problems named "Two Sum"
  const twoSums = await Problem.find({ name: "Two Sum" }).sort({ createdAt: 1 });
  console.log(`Found ${twoSums.length} "Two Sum" problems`);
  
  if (twoSums.length > 1) {
    // Keep the first one, delete the rest
    const toDelete = twoSums.slice(1).map(p => p._id);
    const result = await Problem.deleteMany({ _id: { $in: toDelete } });
    console.log(`Deleted ${result.deletedCount} duplicate(s). Kept: ${twoSums[0]._id}`);
  } else {
    console.log("No duplicates found.");
  }
  
  process.exit(0);
}
run();
