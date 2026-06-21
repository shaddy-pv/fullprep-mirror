import jwt from "jsonwebtoken";
import User from "../models/User.js";
import SystemSettings from "../models/SystemSettings.js";

export const checkSystemSettings = async (req, res, next) => {
  try {
    const settings = await SystemSettings.getGlobalSettings();

    // Attach settings to req for downstream controllers to use
    req.systemSettings = settings;

    // ── 1. Maintenance Mode ─────────────────────────────────────────────
    if (settings.maintenanceMode) {
      // Always allow these paths so admins can bypass and fix settings
      const allowedPaths = ["/auth/login", "/auth/me", "/settings", "/health"];
      const isAllowedPath = allowedPaths.some(p => req.path.startsWith(p));
      
      // Determine if the requester is an admin
      let isAdmin = false;
      if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
          const token = req.headers.authorization.split(" ")[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id).select("role");
          if (user && user.role === "admin") isAdmin = true;
        } catch (e) {
          // Token missing/invalid — ignore and treat as non-admin
        }
      }

      // Block non-admins trying to access blocked paths
      if (!isAllowedPath && !isAdmin) {
        return res.status(503).json({
          success: false,
          message: "The platform is currently in maintenance mode. Please check back later.",
        });
      }
    }

    next();
  } catch (err) {
    console.error("Settings Middleware Error:", err);
    next(err); // Pass to global error handler
  }
};
