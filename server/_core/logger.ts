/**
 * Centralized logger for the application
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  error?: Error;
  timestamp: Date;
}

class Logger {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  /**
   * Log a debug message
   */
  debug(message: string, context?: string) {
    this.log("debug", message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: string) {
    this.log("info", message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: string) {
    this.log("warn", message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, context?: string) {
    this.log("error", message, context, error);
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: string, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      context,
      error,
      timestamp: new Date(),
    };

    this.logs.push(entry);

    // Keep logs bounded
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (process.env.NODE_ENV === "development") {
      const prefix = context ? `[${context}]` : "";
      const timestamp = entry.timestamp.toISOString();

      switch (level) {
        case "debug":
          console.debug(`${timestamp} ${prefix}`, message);
          break;
        case "info":
          console.info(`${timestamp} ${prefix}`, message);
          break;
        case "warn":
          console.warn(`${timestamp} ${prefix}`, message);
          break;
        case "error":
          console.error(`${timestamp} ${prefix}`, message, error);
          break;
      }
    }
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  clear() {
    this.logs = [];
  }
}

export const logger = new Logger();
