import { AsyncLocalStorage } from "async_hooks";

export const logStore = new AsyncLocalStorage();

const formatLog = (level, message, meta = {}) => {
  const context = logStore.getStore() || {};
  const logRecord = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
    ...meta,
  };

  if (process.env.NODE_ENV === "production") {
    return JSON.stringify(logRecord);
  } else {
    // Pretty print in development
    const color = level === "ERROR" ? "\x1b[31m" : level === "WARN" ? "\x1b[33m" : level === "AUDIT" ? "\x1b[36m" : "\x1b[32m";
    const reset = "\x1b[0m";
    const reqIdStr = context.reqId ? ` [reqId:${context.reqId}]` : "";
    const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : "";
    return `${logRecord.timestamp} ${color}[${level}]${reset}${reqIdStr} ${message}${metaStr}`;
  }
};

export const logger = {
  info: (msg, meta) => console.log(formatLog("INFO", msg, meta)),
  warn: (msg, meta) => console.warn(formatLog("WARN", msg, meta)),
  error: (msg, meta) => console.error(formatLog("ERROR", msg, meta)),
  debug: (msg, meta) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(formatLog("DEBUG", msg, meta));
    }
  },
  audit: (msg, meta) => console.log(formatLog("AUDIT", msg, meta)),
};

export default { logStore, logger };
