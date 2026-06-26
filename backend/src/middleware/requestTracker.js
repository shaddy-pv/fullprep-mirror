import crypto from "crypto";
import { logStore, logger } from "../utils/logger.js";

export const requestTracker = (req, res, next) => {
  const reqId = req.headers["x-request-id"] || crypto.randomUUID();
  req.id = reqId;
  res.setHeader("X-Request-Id", reqId);

  const context = {
    reqId,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress || "unknown",
  };

  logStore.run(context, () => {
    const startTime = Date.now();

    // Log request start
    logger.debug(`Incoming request ${req.method} ${context.url}`);

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const meta = {
        statusCode: res.statusCode,
        durationMs: duration,
      };

      if (req.user) {
        meta.userId = req.user._id.toString();
      }

      if (res.statusCode >= 500) {
        logger.error(`Request failed with status ${res.statusCode}`, meta);
      } else if (res.statusCode >= 400) {
        logger.warn(`Request completed with client error ${res.statusCode}`, meta);
      } else {
        logger.info(`Request completed successfully`, meta);
      }
    });

    next();
  });
};

export default requestTracker;
