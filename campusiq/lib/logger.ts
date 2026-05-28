export const logger = {
  info: (message: string) => {
    console.log(`\x1b[36m[INFO]\x1b[0m [${new Date().toISOString()}] ${message}`);
  },
  success: (message: string) => {
    console.log(`\x1b[32m[SUCCESS]\x1b[0m [${new Date().toISOString()}] ${message}`);
  },
  warn: (message: string) => {
    console.log(`\x1b[33m[WARN]\x1b[0m [${new Date().toISOString()}] ${message}`);
  },
  error: (message: string, error?: unknown) => {
    let errorStr = "";
    if (error) {
      if (error instanceof Error) {
        errorStr = error.stack || error.message;
      } else {
        errorStr = typeof error === "object" ? JSON.stringify(error, null, 2) : String(error);
      }
    }
    console.error(
      `\x1b[31m[ERROR]\x1b[0m [${new Date().toISOString()}] ${message}`,
      errorStr
    );
  },
  request: (method: string, url: string, durationMs?: number, status?: number) => {
    const durationStr = durationMs !== undefined ? ` - \x1b[33m${durationMs.toFixed(2)}ms\x1b[0m` : "";
    const statusStr = status !== undefined ? ` - \x1b[32mstatus:${status}\x1b[0m` : "";
    console.log(
      `\x1b[35m[API REQUEST]\x1b[0m [${new Date().toISOString()}] \x1b[1m${method}\x1b[0m ${url}${durationStr}${statusStr}`
    );
  },
};
