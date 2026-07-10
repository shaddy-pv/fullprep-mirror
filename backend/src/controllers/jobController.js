import Job from "../models/Job.js";

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Admin)
export const createJob = async (req, res) => {
  try {
    const { title, role, country, description, isActive } = req.body;
    const newJob = await Job.create({
      title,
      role,
      country,
      description,
      isActive,
    });
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
