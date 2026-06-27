import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import LearningPath from "./src/models/LearningPath.js";
import Problem from "./src/models/Problem.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    await LearningPath.deleteMany({});
    console.log("Cleared existing learning paths.");

    // Fetch some problems to populate the paths
    const allProblems = await Problem.find({}).limit(500).select("externalId difficulty cfTags");
    
    if (allProblems.length === 0) {
      console.log("No problems found in DB. Please sync problems first.");
      process.exit(1);
    }

    const easyProblems = allProblems.filter(p => p.difficulty === "EASY");
    const mediumProblems = allProblems.filter(p => p.difficulty === "MEDIUM");
    const hardProblems = allProblems.filter(p => p.difficulty === "HARD");

    // Helper function to extract problems by tags
    const getByTags = (pool, tags, limit) => {
      const filtered = pool.filter(p => p.cfTags && p.cfTags.some(tag => tags.includes(tag.toLowerCase())));
      return filtered.slice(0, limit).map(p => p.externalId);
    };

    const paths = [
      {
        id: "top-75-interview-questions",
        title: "Top 75 Interview Questions",
        description: "The most important 75 questions to crack any coding interview. Essential patterns and concepts.",
        level: "Beginner",
        estimatedTime: "50h",
        color: "#10b981", // Green
        icon: "Code2",
        popularity: 99,
        isPro: false,
        modules: [
          {
            title: "Arrays & Hashing",
            description: "Fundamental data structures.",
            problems: getByTags(easyProblems, ["implementation", "math", "brute force", "sortings"], 10).concat(getByTags(mediumProblems, ["implementation", "math", "brute force", "sortings"], 5)), // 15
          },
          {
            title: "Two Pointers & Sliding Window",
            description: "Techniques to optimize traversals.",
            problems: getByTags(easyProblems, ["two pointers", "string", "greedy"], 8).concat(getByTags(mediumProblems, ["two pointers", "string", "greedy"], 7)), // 15
          },
          {
            title: "Stack & Binary Search",
            description: "Advanced searching and LIFO structures.",
            problems: getByTags(easyProblems, ["binary search", "data structures"], 5).concat(getByTags(mediumProblems, ["binary search", "data structures"], 10)), // 15
          },
          {
            title: "Linked List & Trees",
            description: "Pointer-based and hierarchical structures.",
            problems: getByTags(easyProblems, ["trees", "graphs", "dfs and similar"], 5).concat(getByTags(mediumProblems, ["trees", "graphs", "dfs and similar"], 10)), // 15
          },
          {
            title: "Graphs & Dynamic Programming",
            description: "Network traversal and subproblem optimization.",
            problems: getByTags(easyProblems, ["dp", "graphs", "shortest paths"], 5).concat(getByTags(mediumProblems, ["dp", "graphs", "shortest paths"], 8), getByTags(hardProblems, ["dp", "graphs", "shortest paths"], 2)), // 15
          }
        ]
      },
      {
        id: "dynamic-programming-mastery",
        title: "Dynamic Programming Mastery",
        description: "Master DP concepts with patterns and practice. Guaranteed to improve your problem solving.",
        level: "Advanced",
        estimatedTime: "32h",
        color: "#8b5cf6", // Purple
        icon: "Cpu",
        popularity: 92,
        isPro: true, // Paid path
        modules: [
          {
            title: "1D DP",
            description: "Introduction to memoization and tabulation.",
            problems: mediumProblems.slice(6, 10),
          },
          {
            title: "2D DP",
            description: "Grid paths and matrix chains.",
            problems: hardProblems.slice(0, 4),
          }
        ]
      },
      {
        id: "system-design-notes",
        title: "System Design Notes",
        description: "Design scalable systems and prepare for high-level rounds. (Theory heavy)",
        level: "Advanced",
        estimatedTime: "26h",
        color: "#f43f5e", // Rose
        icon: "Layers",
        popularity: 96,
        isPro: true,
        modules: [
          {
            title: "Load Balancing",
            description: "Distribute traffic across multiple servers.",
            problems: [], // Notes paths might not have coding problems
          },
          {
            title: "Database Scaling",
            description: "Sharding, replication, and caching.",
            problems: [],
          }
        ]
      }
    ];

    for (const path of paths) {
      await LearningPath.create(path);
      console.log(`Created path: ${path.title}`);
    }

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding learning paths:", error);
    process.exit(1);
  }
}

seed();
