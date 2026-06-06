import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";
import Problem from "./src/models/Problem.js";
import * as codnite from "./src/utils/codniteService.js";

const codniteToSchema = (raw) => ({
  externalId:          raw.id,
  serialNo:            raw.serial_no || 0,
  name:                raw.name,
  description:         raw.description || "",
  descriptionPreview:  raw.description_preview || (raw.description || "").slice(0, 300),
  source:              raw.source || "CODEFORCES",
  difficulty:          raw.difficulty || "UNKNOWN",
  cfRating:            raw.cf_rating || 0,
  cfTags:              raw.cf_tags || [],
  timeLimitSeconds:    raw.time_limit_seconds || 2,
  memoryLimitMb:       raw.memory_limit_mb || 256,
  publicTests:         raw.public_tests || [],
  privateTests:        raw.private_tests || [],
  generatedTests:      raw.generated_tests || [],
  solutions:           raw.solutions || [],
  incorrectSolutions:  raw.incorrect_solutions || [],
  stats: {
    totalPublicTests:        raw.stats?.total_public_tests       || (raw.public_tests?.length    || 0),
    totalPrivateTests:       raw.stats?.total_private_tests      || (raw.private_tests?.length   || 0),
    totalGeneratedTests:     raw.stats?.total_generated_tests    || (raw.generated_tests?.length || 0),
    totalSolutions:          raw.stats?.total_solutions          || (raw.solutions?.length       || 0),
    totalIncorrectSolutions: raw.stats?.total_incorrect_solutions|| (raw.incorrect_solutions?.length || 0),
  },
  lastSyncedAt: new Date(),
});

const seed = async () => {
  await connectDB();
  console.log("Fetching problems from Codnite API...");
  try {
    const data = await codnite.fetchProblems({ page: 1, limit: 30 });
    console.log(`Found ${data.problems.length} problems on page 1. Syncing full details...`);
    for (const indexEntry of data.problems) {
      try {
        console.log(`Syncing problem details for: ${indexEntry.name} (${indexEntry.id})...`);
        const raw = await codnite.fetchProblemById(indexEntry.id);
        await Problem.findOneAndUpdate(
          { externalId: indexEntry.id },
          { $set: codniteToSchema(raw) },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error(`Failed to sync problem ${indexEntry.id}:`, err.message);
      }
    }
    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Seeding failed:", err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
