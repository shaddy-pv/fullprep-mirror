import LearningPath from "../models/LearningPath.js";
import User from "../models/User.js";
import Problem from "../models/Problem.js";

/**
 * @desc    Get all learning paths with user progress (if authenticated)
 * @route   GET /api/learning-paths
 * @access  Public (Progress calculation requires auth, handled by middleware)
 */
export const getLearningPaths = async (req, res) => {
  try {
    const { category, sort, search } = req.query;

    let filter = {};
    if (category && category !== "All") {
      filter.level = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    let sortOptions = { popularity: -1 };
    if (sort === "recent") sortOptions = { updatedAt: -1 };
    // "recommended" could just be popularity or a specific flag, we'll use popularity for now

    const paths = await LearningPath.find(filter).sort(sortOptions);

    let result = paths.map(p => p.toObject({ virtuals: true }));

    // If user is logged in, attach their progress
    if (req.user) {
      const user = await User.findById(req.user._id).select("solvedProblems enrolledPaths");
      const solvedSet = new Set(user.solvedProblems || []);
      
      result = result.map(path => {
        let totalProblems = path.problemsCount;
        let solvedCount = 0;
        
        path.modules.forEach(mod => {
          mod.problems.forEach(probId => {
            if (solvedSet.has(probId)) {
              solvedCount++;
            }
          });
        });
        
        const progress = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;
        const isEnrolled = user.enrolledPaths.some(id => id.toString() === path._id.toString());
        
        return { ...path, progress, isEnrolled, solvedCount };
      });
    } else {
      // Unauthenticated users just see 0 progress
      result = result.map(path => ({ ...path, progress: 0, isEnrolled: false, solvedCount: 0 }));
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in getLearningPaths:", error);
    res.status(500).json({ success: false, message: "Server error fetching learning paths" });
  }
};

/**
 * @desc    Get a single learning path by ID (slug), including populated problems
 * @route   GET /api/learning-paths/:id
 * @access  Public (Progress calculation requires auth)
 */
export const getLearningPathById = async (req, res) => {
  try {
    const path = await LearningPath.findOne({ id: req.params.id });
    if (!path) {
      return res.status(404).json({ success: false, message: "Learning path not found" });
    }

    const pathObj = path.toObject({ virtuals: true });

    // Populate the problems within the modules manually (since they are externalIds)
    // First, collect all unique externalIds
    const allExternalIds = new Set();
    pathObj.modules.forEach(mod => {
      mod.problems.forEach(id => allExternalIds.add(id));
    });

    // Fetch problem details from the DB
    const problems = await Problem.find({ externalId: { $in: Array.from(allExternalIds) } })
      .select("externalId name difficulty acceptanceRate tags");
    
    const problemMap = {};
    problems.forEach(p => { problemMap[p.externalId] = p; });

    let solvedSet = new Set();
    let isEnrolled = false;
    if (req.user) {
      const user = await User.findById(req.user._id).select("solvedProblems enrolledPaths");
      solvedSet = new Set(user.solvedProblems || []);
      isEnrolled = user.enrolledPaths.some(id => id.toString() === path._id.toString());
    }

    let totalSolved = 0;

    // Replace string IDs with problem objects, adding status
    pathObj.modules = pathObj.modules.map(mod => {
      const populatedProblems = mod.problems.map(probId => {
        const pInfo = problemMap[probId];
        const status = solvedSet.has(probId) ? "SOLVED" : "UNSOLVED";
        if (status === "SOLVED") totalSolved++;

        return {
          externalId: probId,
          title: pInfo ? pInfo.name : "Unknown Problem",
          difficulty: pInfo ? pInfo.difficulty : "Unknown",
          acceptanceRate: pInfo ? pInfo.acceptanceRate : 0,
          tags: pInfo ? pInfo.tags : [],
          status
        };
      });
      return { ...mod, problems: populatedProblems };
    });

    pathObj.progress = pathObj.problemsCount > 0 ? Math.round((totalSolved / pathObj.problemsCount) * 100) : 0;
    pathObj.isEnrolled = isEnrolled;
    pathObj.solvedCount = totalSolved;

    res.status(200).json({
      success: true,
      data: pathObj,
    });
  } catch (error) {
    console.error("Error in getLearningPathById:", error);
    res.status(500).json({ success: false, message: "Server error fetching learning path details" });
  }
};

/**
 * @desc    Enroll in a learning path
 * @route   POST /api/learning-paths/:id/enroll
 * @access  Private
 */
export const enrollInLearningPath = async (req, res) => {
  try {
    const path = await LearningPath.findOne({ id: req.params.id });
    if (!path) {
      return res.status(404).json({ success: false, message: "Learning path not found" });
    }

    const user = await User.findById(req.user._id);
    const alreadyEnrolled = user.enrolledPaths.some(id => id.equals(path._id) || id.toString() === path._id.toString());
    if (!alreadyEnrolled) {
      user.enrolledPaths.push(path._id);
      await user.save();
    }

    res.status(200).json({ success: true, message: "Successfully enrolled in learning path" });
  } catch (error) {
    console.error("Error in enrollInLearningPath:", error);
    res.status(500).json({ success: false, message: "Server error enrolling in learning path" });
  }
};

/**
 * @desc    Create a new learning path (Admin)
 * @route   POST /api/learning-paths
 * @access  Private/Admin
 */
export const createLearningPath = async (req, res) => {
  try {
    const { id, title, description, level, estimatedTime, color, icon, isPro, contentType, content, modules } = req.body;

    const existingPath = await LearningPath.findOne({ id });
    if (existingPath) {
      return res.status(400).json({ success: false, message: "Learning path with this ID already exists" });
    }

    const newPath = new LearningPath({
      id,
      title,
      description,
      level,
      estimatedTime,
      color,
      icon,
      isPro: !!isPro,
      contentType: contentType || "problems",
      content: content || "",
      modules: modules || [],
    });

    await newPath.save();
    res.status(201).json({ success: true, data: newPath });
  } catch (error) {
    console.error("Error creating learning path:", error);
    res.status(500).json({ success: false, message: "Server error creating learning path" });
  }
};

/**
 * @desc    Update a learning path (Admin)
 * @route   PUT /api/learning-paths/:id
 * @access  Private/Admin
 */
export const updateLearningPath = async (req, res) => {
  try {
    const { title, description, level, estimatedTime, color, icon, isPro, contentType, content, modules } = req.body;

    const path = await LearningPath.findOne({ id: req.params.id });
    if (!path) {
      return res.status(404).json({ success: false, message: "Learning path not found" });
    }

    if (title !== undefined) path.title = title;
    if (description !== undefined) path.description = description;
    if (level !== undefined) path.level = level;
    if (estimatedTime !== undefined) path.estimatedTime = estimatedTime;
    if (color !== undefined) path.color = color;
    if (icon !== undefined) path.icon = icon;
    if (isPro !== undefined) path.isPro = isPro;
    if (contentType !== undefined) path.contentType = contentType;
    if (content !== undefined) path.content = content;
    if (modules !== undefined) path.modules = modules;

    await path.save();
    res.status(200).json({ success: true, data: path });
  } catch (error) {
    console.error("Error updating learning path:", error);
    res.status(500).json({ success: false, message: "Server error updating learning path" });
  }
};

/**
 * @desc    Delete a learning path (Admin)
 * @route   DELETE /api/learning-paths/:id
 * @access  Private/Admin
 */
export const deleteLearningPath = async (req, res) => {
  try {
    const path = await LearningPath.findOneAndDelete({ id: req.params.id });
    if (!path) {
      return res.status(404).json({ success: false, message: "Learning path not found" });
    }

    // Optional: Could remove this path from users' enrolledPaths here
    await User.updateMany(
      { enrolledPaths: path._id },
      { $pull: { enrolledPaths: path._id } }
    );

    res.status(200).json({ success: true, message: "Learning path deleted successfully" });
  } catch (error) {
    console.error("Error deleting learning path:", error);
    res.status(500).json({ success: false, message: "Server error deleting learning path" });
  }
};
