import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema(
  {
    // Platform
    platformName: { type: String, default: "FullPrep" },
    platformDescription: { type: String, default: "Competitive Programming Platform" },
    maintenanceMode: { type: Boolean, default: false },
    registrationEnabled: { type: Boolean, default: true },
    emailVerificationRequired: { type: Boolean, default: false },
    defaultUserRole: { type: String, default: "user" },
    defaultUserLevel: { type: Number, default: 1 },
    xpPerProblem: { type: Number, default: 10 },
    streakBonus: { type: Number, default: 5 },

    // Judge
    judgeProvider: { type: String, default: "judge0" },
    executionTimeoutMs: { type: Number, default: 5000 },
    memoryLimitMb: { type: Number, default: 256 },
    outputComparison: { type: String, default: "strict" },
    queueLimit: { type: Number, default: 100 },
    rejudgeEnabled: { type: Boolean, default: true },
    sandboxEnabled: { type: Boolean, default: true },
    supportedLanguages: { type: [String], default: ["python", "cpp", "java", "javascript"] },

    // Problem Management
    defaultTimeLimit: { type: Number, default: 2000 },
    defaultMemoryLimit: { type: Number, default: 256 },
    autoSyncEnabled: { type: Boolean, default: false },
    problemApprovalRequired: { type: Boolean, default: false },
    problemVisibilityDefault: { type: String, default: "public" },

    // Users
    usernameRegex: { type: String, default: "^[a-zA-Z0-9_]{3,20}$" },
    passwordMinLength: { type: Number, default: 8 },
    suspensionEnabled: { type: Boolean, default: true },
    deletionEnabled: { type: Boolean, default: false },

    // API & Integrations
    backendUrl: { type: String, default: "http://localhost:5000" },
    judge0Endpoint: { type: String, default: "https://judge0.fullprep.test" },
    codniteEndpoint: { type: String, default: "https://api.codnite.io/v1" },
    smtpHost: { type: String, default: "smtp.mailtrap.io" },
    webhookUrl: { type: String, default: "" },

    // Security
    rateLimitingEnabled: { type: Boolean, default: true },
    maxRequestsPerMinute: { type: Number, default: 100 },
    failedLoginLockout: { type: Number, default: 5 },

    // Notifications
    emailNotifications: { type: Boolean, default: true },
    systemAlerts: { type: Boolean, default: true },
    errorAlerts: { type: Boolean, default: true },

    // Backups
    autoBackupEnabled: { type: Boolean, default: true },
    backupSchedule: { type: String, default: "0 0 * * 0" }, // Weekly
  },
  { timestamps: true }
);

const SystemSettings = mongoose.model("SystemSettings", systemSettingsSchema);

// Singleton helper
SystemSettings.getGlobalSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default SystemSettings;
