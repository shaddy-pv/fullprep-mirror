import SystemSettings from "../models/SystemSettings.js";

// ── @desc    Get platform global settings
// ── @route   GET /api/settings
// ── @access  Private / Admin
export const getSettings = async (req, res) => {
  const settings = await SystemSettings.getGlobalSettings();

  res.status(200).json({
    success: true,
    data: settings,
  });
};

// ── @desc    Update platform global settings
// ── @route   PUT /api/settings
// ── @access  Private / Admin
export const updateSettings = async (req, res) => {
  let settings = await SystemSettings.getGlobalSettings();
  
  // Update fields that were provided
  Object.keys(req.body).forEach(key => {
    if (settings[key] !== undefined) {
      settings[key] = req.body[key];
    }
  });

  await settings.save();

  res.status(200).json({
    success: true,
    data: settings,
    message: "Settings updated successfully",
  });
};
