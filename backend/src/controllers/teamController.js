import User from "../models/User.js";

// @desc    Get team members
// @route   GET /api/team
// @access  Public
export const getTeam = async (req, res) => {
  try {
    const teamMembers = await User.find({
      $or: [
        { name: { $regex: /khushi/i }, role: "admin" },
        { name: { $regex: /md shadan/i }, role: "admin" },
        { name: { $regex: /shivam kushwaha/i }, role: "admin" }
      ]
    }).select("-password -email");
    
    res.status(200).json(teamMembers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
