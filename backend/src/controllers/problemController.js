/**
 * @file problemController.js
 * @description Handles all problem-related API requests.
 *
 *  Strategy (Option A — MongoDB caching):
 *    1. Check if problem exists in MongoDB and cache is fresh (< 24h).
 *    2. If fresh → return from cache.
 *    3. If stale / missing → fetch from Codnite API → upsert in MongoDB → return.
 *
 *  Admin endpoints:
 *    - syncProblems   → bulk import all 282 problems from Codnite
 *    - createProblem  → manually create a custom problem
 *    - updateProblem  → update problem fields
 *    - deleteProblem  → soft-delete (set isActive: false)
 */

import Problem from "../models/Problem.js";
import SyncJob from "../models/SyncJob.js";
import User from "../models/User.js";
import * as codnite from "../utils/codniteService.js";
import { cacheManager } from "../utils/cacheManager.js";

// ── Cache TTL ─────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── Internal: Transform Codnite → Problem schema ──────────────────────────────

/**
 * Maps a raw Codnite API problem object to our Mongoose schema fields.
 * @param {object} raw - Raw Codnite problem JSON
 * @param {string|null} adminUserId - User ID of the importing admin (optional)
 * @returns {object} Fields ready for Problem.findOneAndUpdate()
 */
const codniteToSchema = (raw, adminUserId = null) => ({
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
  ...(adminUserId && { createdBy: adminUserId }),
});

// ── Internal: Check if cache is stale ────────────────────────────────────────

const isCacheStale = (problem) => {
  if (!problem?.lastSyncedAt) return true;
  return Date.now() - problem.lastSyncedAt.getTime() > CACHE_TTL_MS;
};

// ── @desc    Get paginated, filtered list of problems
// ── @route   GET /api/problems
// ── @access  Public
export const listProblems = async (req, res) => {
  const {
    page       = 1,
    limit      = 20,
    difficulty,
    tag,
    source,
    minRating,
    maxRating,
    sortBy     = "serialNo",
    sortOrder  = "asc",
    search,
  } = req.query;

  // Check cache first
  const cacheParams = { page, limit, difficulty, tag, source, minRating, maxRating, sortBy, sortOrder, search };
  const cacheKey = `prob_list:${JSON.stringify(cacheParams)}`;
  const cachedData = await cacheManager.get(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  const pageNum  = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(1000, Math.max(1, parseInt(limit, 10)));
  const skip     = (pageNum - 1) * limitNum;

  // ── Build MongoDB filter ─────────────────────────────────
  const filter = { isActive: true };

  if (difficulty)          filter.difficulty = difficulty.toUpperCase();
  if (source)              filter.source     = source.toUpperCase();
  if (tag)                 filter.cfTags     = { $in: [tag.toLowerCase()] };
  if (minRating !== undefined) filter.cfRating = { ...filter.cfRating, $gte: Number(minRating) };
  if (maxRating !== undefined) filter.cfRating = { ...filter.cfRating, $lte: Number(maxRating) };
  if (search)              filter.$text      = { $search: search };

  // ── Sort ─────────────────────────────────────────────────
  const sortField = sortBy === "rating" ? "cfRating" : sortBy === "name" ? "name" : "serialNo";
  const sort = { [sortField]: sortOrder === "desc" ? -1 : 1 };

  const [problems, total] = await Promise.all([
    Problem.find(filter)
      .select("-description -publicTests -privateTests -generatedTests -solutions -incorrectSolutions")
      .sort(sort)
      .allowDiskUse(true)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Problem.countDocuments(filter),
  ]);

  // ── If MongoDB has no problems yet, fetch from Codnite ───
  if (total === 0) {
    const codniteLimit = Math.min(limitNum, 100);
    const codniteData = await codnite.fetchProblems({
      page: pageNum,
      limit: codniteLimit,
      difficulty,
      tag,
      source,
      minRating: minRating ? Number(minRating) : undefined,
      maxRating: maxRating ? Number(maxRating) : undefined,
      sortBy:    sortBy === "rating" ? "cf_rating" : sortBy,
      sortOrder,
    });

    const codniteResponse = {
      success:    true,
      message:    "Problems fetched from Codnite API (cache empty).",
      source:     "codnite",
      pagination: {
        page:       codniteData.page,
        limit:      codniteData.limit,
        total:      codniteData.total,
        totalPages: codniteData.total_pages,
        hasNext:    codniteData.has_next,
        hasPrev:    codniteData.has_prev,
      },
      data: codniteData.problems,
    };

    return res.status(200).json(codniteResponse);
  }

  const responseData = {
    success:    true,
    message:    "Problems fetched successfully.",
    source:     "cache",
    pagination: {
      page:       pageNum,
      limit:      limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasNext:    pageNum < Math.ceil(total / limitNum),
      hasPrev:    pageNum > 1,
    },
    data: problems,
  };

  // Cache list response
  await cacheManager.set(cacheKey, responseData, 30); // 30 seconds TTL

  res.status(200).json(responseData);
};

// ── @desc    Get full problem detail by ID (with MongoDB caching)
// ── @route   GET /api/problems/:id
// ── @access  Public
export const getProblem = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `prob_single:${id}`;

  const cachedData = await cacheManager.get(cacheKey);
  if (cachedData) {
    return res.status(200).json({
      success: true,
      message: "Problem fetched successfully (cached).",
      source:  "cache",
      data:    cachedData,
    });
  }

  // ── 1. Check database ───────────────────────────────────────
  let problem = await Problem.findOne({
    $or: [{ externalId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    isActive: true 
  }).select(
    "+privateTests +generatedTests +solutions +incorrectSolutions"
  );

  // ── 2. Fetch from Codnite only if missing in database ────
  if (!problem) {
    let rawProblem;
    try {
      rawProblem = await codnite.fetchProblemById(id);
    } catch (err) {
      throw err; // Let global error handler deal with it
    }

    // ── 3. Upsert into MongoDB ───────────────────────────────
    problem = await Problem.findOneAndUpdate(
      { externalId: id },
      { $set: codniteToSchema(rawProblem) },
      { upsert: true, new: true, runValidators: true }
    );
  }

  const publicData = problem.toPublicJSON();

  // Cache single problem
  await cacheManager.set(cacheKey, publicData, 30); // 30 seconds TTL

  res.status(200).json({
    success: true,
    message: "Problem fetched successfully.",
    source:  "cache",
    data:    publicData,
  });
};

// ── @desc    Get public test cases for a problem
// ── @route   GET /api/problems/:id/tests
// ── @access  Public
export const getProblemTests = async (req, res) => {
  const { id }        = req.params;
  const { test_type } = req.query;

  // Determine access level once — used in both the cache and Codnite branches
  const isAdmin = req.user?.role === "admin";

  // ── 1. Try cache first ───────────────────────────────────
  const problem = await Problem.findOne({ externalId: id, isActive: true });

  if (problem) {
    const result = {
      problemId:   id,
      problemName: problem.name,
      publicTests: problem.publicTests,
    };

    if (isAdmin && test_type !== "public") {
      const fullProblem = await Problem.findOne({ externalId: id })
        .select("+privateTests +generatedTests");
      result.privateTests   = fullProblem?.privateTests   || [];
      result.generatedTests = fullProblem?.generatedTests || [];
    }

    return res.status(200).json({
      success: true,
      message: "Tests fetched successfully.",
      source:  "cache",
      data:    result,
    });
  }

  // ── 2. Fetch from Codnite ────────────────────────────────
  const testType   = isAdmin ? (test_type || "all") : "public";
  const codniteData = await codnite.fetchProblemTests(id, testType);

  // Return only public tests to regular users
  const data = isAdmin ? codniteData : {
    problemId:   codniteData.problem_id,
    problemName: codniteData.problem_name,
    publicTests: codniteData.tests || codniteData.public_tests || [],
  };

  res.status(200).json({
    success: true,
    message: "Tests fetched successfully.",
    source:  "codnite",
    data,
  });
};

// ── @desc    Search problems by name / description / tags
// ── @route   GET /api/problems/search?q=...
// ── @access  Public
export const searchProblems = async (req, res) => {
  const { q, limit = 20 } = req.query;

  if (!q || String(q).trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Search query 'q' is required.",
    });
  }

  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

  // ── 1. Try MongoDB text search first (if cache populated) ────
  const mongoCount = await Problem.countDocuments({ isActive: true });
  if (mongoCount > 0) {
    const results = await Problem.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: "textScore" } }
    )
      .select("-description -publicTests")
      .sort({ score: { $meta: "textScore" } })
      .limit(limitNum)
      .lean();

    if (results.length > 0) {
      return res.status(200).json({
        success: true,
        message: `Found ${results.length} problems matching "${q}".`,
        source:  "cache",
        data: {
          query:        q,
          totalResults: results.length,
          results,
        },
      });
    }
  }

  // ── 2. Fall back to Codnite search ──────────────────────────
  const codniteData = await codnite.fetchSearch(q, limitNum);

  res.status(200).json({
    success: true,
    message: `Found ${codniteData.total_results} problems matching "${q}".`,
    source:  "codnite",
    data: {
      query:        codniteData.query,
      totalResults: codniteData.total_results,
      results:      codniteData.results,
    },
  });
};

// ── @desc    Get a random problem (optionally filtered)
// ── @route   GET /api/problems/random
// ── @access  Public
export const getRandomProblem = async (req, res) => {
  const { difficulty, tag, source } = req.query;

  // ── 1. Try MongoDB if cache is populated ─────────────────
  const filter = { isActive: true };
  if (difficulty) filter.difficulty = difficulty.toUpperCase();
  if (source)     filter.source     = source.toUpperCase();
  if (tag)        filter.cfTags     = { $in: [tag.toLowerCase()] };

  const mongoCount = await Problem.countDocuments(filter);

  if (mongoCount > 0) {
    const skip   = Math.floor(Math.random() * mongoCount);
    const problem = await Problem.findOne(filter).skip(skip).lean();

    return res.status(200).json({
      success: true,
      message: "Random problem fetched successfully.",
      source:  "cache",
      data:    problem,
    });
  }

  // ── 2. Fall back to Codnite ──────────────────────────────
  const raw = await codnite.fetchRandomProblem({ difficulty, tag, source });

  res.status(200).json({
    success: true,
    message: "Random problem fetched successfully.",
    source:  "codnite",
    data:    raw,
  });
};

// ── @desc    Get all available tags with problem counts
// ── @route   GET /api/problems/tags
// ── @access  Public
export const getTags = async (req, res) => {
  // ── 1. Aggregate from MongoDB if populated ───────────────
  const mongoCount = await Problem.countDocuments({ isActive: true });

  if (mongoCount > 0) {
    const tags = await Problem.aggregate([
      { $match: { isActive: true } },
      { $unwind: "$cfTags" },
      { $group:  { _id: "$cfTags", count: { $sum: 1 } } },
      { $sort:   { count: -1 } },
      { $project: { _id: 0, name: "$_id", count: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      message: "Tags fetched successfully.",
      source:  "cache",
      data: {
        totalTags: tags.length,
        tags,
      },
    });
  }

  // ── 2. Fall back to Codnite ──────────────────────────────
  const codniteData = await codnite.fetchTags();

  res.status(200).json({
    success: true,
    message: "Tags fetched successfully.",
    source:  "codnite",
    data: {
      totalTags: codniteData.total_tags,
      tags:      codniteData.tags,
    },
  });
};

// ── @desc    Get problem database statistics
// ── @route   GET /api/problems/stats
// ── @access  Public
export const getStats = async (req, res) => {
  // ── 1. Compute from MongoDB if populated ─────────────────
  const mongoCount = await Problem.countDocuments({ isActive: true });

  if (mongoCount > 0) {
    const [byDifficulty, bySource, topTags] = await Promise.all([
      Problem.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$difficulty", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Problem.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$source", count: { $sum: 1 } } },
      ]),
      Problem.aggregate([
        { $match: { isActive: true } },
        { $unwind: "$cfTags" },
        { $group: { _id: "$cfTags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      message: "Stats fetched successfully.",
      source:  "cache",
      data: {
        totalProblems: mongoCount,
        byDifficulty:  Object.fromEntries(byDifficulty.map((d) => [d._id, d.count])),
        bySource:      Object.fromEntries(bySource.map((s) => [s._id, s.count])),
        topTags:       Object.fromEntries(topTags.map((t) => [t._id, t.count])),
        lastSynced:    new Date().toISOString(),
      },
    });
  }

  // ── 2. Fall back to Codnite ──────────────────────────────
  const codniteData = await codnite.fetchStats();

  res.status(200).json({
    success: true,
    message: "Stats fetched from Codnite API.",
    source:  "codnite",
    data:    codniteData,
  });
};

// ── @desc    Bulk sync all problems from Codnite into MongoDB (Admin only)
// ── @route   POST /api/problems/sync
// ── @access  Private / Admin
export const syncProblems = async (req, res) => {
  const { mode = "ALL" } = req.body;
  const adminId = req.user?._id || null;

  // 1. Check if a job is already running
  const runningJob = await SyncJob.findOne({ status: "RUNNING" });
  if (runningJob) {
    return res.status(400).json({
      success: false,
      message: "A sync job is already running.",
      data: runningJob,
    });
  }

  // 2. Create the SyncJob in DB
  const job = await SyncJob.create({
    mode,
    status: "RUNNING",
    triggeredBy: adminId,
  });

  // 3. Return immediately (Background Processing)
  res.status(202).json({
    success: true,
    message: "Sync job started in the background.",
    data: job,
  });

  // 4. Run the actual sync in the background
  (async () => {
    const startTime = Date.now();
    try {
      await cacheManager.clear();
      job.logs.push(`[System] Initializing sync in ${mode} mode...`);
      await job.save();

      // Fetch index
      const PAGE_SIZE = 100;
      let allProblems = [];
      let page = 1;
      let hasNext = true;

      while (hasNext) {
        const data = await codnite.fetchProblems({ page, limit: PAGE_SIZE });
        allProblems = allProblems.concat(data.problems || []);
        hasNext = data.has_next;
        page++;
      }

      job.totalToSync = allProblems.length;
      job.logs.push(`[System] Found ${allProblems.length} problems in upstream catalog.`);
      await job.save();

      // Fetch all existing problems in bulk to prevent N+1 query loop
      const existingProblems = await Problem.find({
        externalId: { $in: allProblems.map((p) => p.id) },
      })
        .select("externalId lastSyncedAt")
        .lean();

      // Create a map for O(1) in-memory lookups
      const existingMap = new Map();
      existingProblems.forEach((p) => {
        existingMap.set(p.externalId, p);
      });

      // Upsert
      for (const indexEntry of allProblems) {
        try {
          const existing = existingMap.get(indexEntry.id);
          const stale = isCacheStale(existing);

          if (mode === "MISSING" && existing) {
            job.skippedCount++;
            continue;
          }

          if (mode === "STALE" && existing && !stale) {
            job.skippedCount++;
            continue;
          }

          const raw = await codnite.fetchProblemById(indexEntry.id);
          await Problem.findOneAndUpdate(
            { externalId: indexEntry.id },
            {
              $set: {
                ...codniteToSchema(raw, adminId),
                isActive: true,
              },
            },
            { upsert: true, new: true, runValidators: true }
          );

          job.syncedCount++;
          // Only push log occasionally to avoid massive DB writes, or just let frontend rely on counts
          if (job.syncedCount % 10 === 0) {
            job.logs.push(`[Progress] Synced ${job.syncedCount} / ${job.totalToSync}`);
            await job.save();
          }
        } catch (err) {
          job.failedCount++;
          job.errors.push({ id: indexEntry.id, error: err.message });
          job.logs.push(`[Error] Failed on ${indexEntry.id}: ${err.message}`);
        }
      }

      await cacheManager.clear();
      job.status = "COMPLETED";
      job.durationMs = Date.now() - startTime;
      job.logs.push(`[System] Sync completed successfully in ${job.durationMs}ms.`);
      await job.save();
    } catch (error) {
      job.status = "FAILED";
      job.durationMs = Date.now() - startTime;
      job.logs.push(`[Fatal] Entire sync process crashed: ${error.message}`);
      await job.save();
    }
  })();
};

// ── @desc    Get the current active sync job status
// ── @route   GET /api/problems/sync/status
// ── @access  Private / Admin
export const getSyncStatus = async (req, res) => {
  // Return the latest job regardless of status
  const job = await SyncJob.findOne().sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    data: job || null,
  });
};

// ── @desc    Get paginated sync history
// ── @route   GET /api/problems/sync/history
// ── @access  Private / Admin
export const getSyncHistory = async (req, res) => {
  const history = await SyncJob.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("triggeredBy", "name email");

  res.status(200).json({
    success: true,
    data: history,
  });
};

// ── @desc    Manually create a custom problem (Admin only)
// ── @route   POST /api/problems
// ── @access  Private / Admin
export const createProblem = async (req, res) => {
  const {
    name, description, difficulty, cfRating, cfTags,
    timeLimitSeconds, memoryLimitMb, publicTests, privateTests, source,
    inputFormat, outputFormat, constraints, notes, examples, hints,
    starterCodeTemplates, editorial, judgeConfig, problemCode,
    problemSlug, originalProblemLink
  } = req.body;

  if (!name || !description) {
    return res.status(400).json({
      success: false,
      message: "Name and description are required.",
    });
  }

  // Generate a unique externalId for custom problems
  const externalId = `custom_${Date.now()}_${name.toLowerCase().replace(/\s+/g, "_").slice(0, 30)}`;

  const problem = await Problem.create({
    externalId,
    name:              name.trim(),
    description:       description.trim(),
    difficulty:        difficulty?.toUpperCase()  || "UNKNOWN",
    source:            source?.toUpperCase()       || "CODEFORCES",
    cfRating:          Number(cfRating)            || 0,
    cfTags:            Array.isArray(cfTags) ? cfTags : [],
    timeLimitSeconds:  Number(timeLimitSeconds)    || 2,
    memoryLimitMb:     Number(memoryLimitMb)       || 256,
    publicTests:       Array.isArray(publicTests) ? publicTests : [],
    privateTests:      Array.isArray(privateTests) ? privateTests : [],
    inputFormat:       inputFormat || "",
    outputFormat:      outputFormat || "",
    constraints:       Array.isArray(constraints) ? constraints : [],
    notes:             notes || "",
    examples:          Array.isArray(examples) ? examples : [],
    hints:             Array.isArray(hints) ? hints : [],
    starterCodeTemplates: Array.isArray(starterCodeTemplates) ? starterCodeTemplates : [],
    editorial:         editorial || null,
    judgeConfig:       judgeConfig || {},
    problemCode:       problemCode || "",
    problemSlug:       problemSlug || "",
    originalProblemLink: originalProblemLink || "",
    createdBy:         req.user._id,
    lastSyncedAt:      new Date(),
  });

  await cacheManager.clear();
  res.status(201).json({
    success: true,
    message: "Problem created successfully.",
    data:    problem.toPublicJSON(),
  });
};

// ── @desc    Update a problem (Admin only)
// ── @route   PATCH /api/problems/:id
// ── @access  Private / Admin
export const updateProblem = async (req, res) => {
  const { id } = req.params;

  // Whitelist updatable fields
  const allowedFields = [
    "name", "description", "difficulty", "cfRating", "cfTags",
    "timeLimitSeconds", "memoryLimitMb", "publicTests", "privateTests", "isActive",
    "source", "inputFormat", "outputFormat", "constraints", "notes",
    "examples", "hints", "starterCodeTemplates", "editorial", "judgeConfig",
    "problemCode", "problemSlug", "originalProblemLink"
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid fields provided for update.",
    });
  }

  // Try to find by MongoDB _id or externalId
  const problem = await Problem.findOneAndUpdate(
    { $or: [{ externalId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!problem) {
    return res.status(404).json({
      success: false,
      message: `Problem "${id}" not found.`,
    });
  }

  await cacheManager.clear();
  res.status(200).json({
    success: true,
    message: "Problem updated successfully.",
    data:    problem.toPublicJSON(),
  });
};

// ── @desc    Soft-delete a problem (Admin only)
// ── @route   DELETE /api/problems/:id
// ── @access  Private / Admin
export const deleteProblem = async (req, res) => {
  const { id } = req.params;

  const problem = await Problem.findOneAndUpdate(
    { $or: [{ externalId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
    { $set: { isActive: false } },
    { new: true }
  );

  if (!problem) {
    return res.status(404).json({
      success: false,
      message: `Problem "${id}" not found.`,
    });
  }

  await cacheManager.clear();
  res.status(200).json({
    success: true,
    message: `Problem "${problem.name}" has been deactivated.`,
    data:    { id: problem.externalId, isActive: false },
  });
};

// ── @desc    Toggle problem bookmark for current user
// ── @route   POST /api/problems/:id/bookmark
// ── @access  Private
export const toggleBookmark = async (req, res) => {
  const { id } = req.params;

  const problem = await Problem.findOne({ externalId: id, isActive: true });
  if (!problem) {
    return res.status(404).json({
      success: false,
      message: `Problem "${id}" not found.`,
    });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  if (!user.bookmarks) {
    user.bookmarks = [];
  }

  const isBookmarked = user.bookmarks.includes(problem.externalId);
  if (isBookmarked) {
    user.bookmarks = user.bookmarks.filter((b) => b !== problem.externalId);
  } else {
    user.bookmarks.push(problem.externalId);
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: isBookmarked ? "Bookmark removed." : "Problem bookmarked.",
    isBookmarked: !isBookmarked,
    bookmarks: user.bookmarks,
  });
};

// ── @desc    Get user's bookmarked problems
// ── @route   GET /api/problems/bookmarks
// ── @access  Private
export const getBookmarkedProblems = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  const bookmarkIds = user.bookmarks || [];
  const problems = await Problem.find({
    externalId: { $in: bookmarkIds },
    isActive: true,
  }).select("-description -publicTests -privateTests -generatedTests -solutions -incorrectSolutions");

  res.status(200).json({
    success: true,
    message: "Bookmarked problems fetched successfully.",
    data: problems,
  });
};
