import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "./auth";
import { errorResponse } from "./responses";
import { logger } from "./logger";

export type AuthenticatedUser = {
  id: string;
  email: string;
  createdAt: Date;
};

export type AuthenticatedRouteHandler = (
  req: NextRequest,
  context: { params: any },
  user: AuthenticatedUser
) => Promise<NextResponse | Response>;

/**
 * Higher-order function to protect Next.js App Router API endpoints with JWT.
 * It resolves the user from the database and passes it to the handler.
 */
export function withAuth(handler: AuthenticatedRouteHandler) {
  return async (req: NextRequest, context: any) => {
    const startTime = Date.now();
    const method = req.method;
    const url = req.nextUrl.pathname + req.nextUrl.search;

    const user = await getUserFromRequest(req);
    if (!user) {
      logger.warn(`Unauthorized access attempt: ${method} ${url}`);
      return errorResponse("Unauthorized: Missing, expired, or invalid token", 401);
    }

    try {
      const response = await handler(req, context, user as AuthenticatedUser);
      const duration = Date.now() - startTime;
      logger.request(method, url, duration, response.status);
      return response;
    } catch (err: any) {
      const duration = Date.now() - startTime;
      logger.error(`Error in authenticated route: ${method} ${url} (${duration}ms)`, err);
      return errorResponse("Internal server error", 500);
    }
  };
}

// Simple in-memory rate-limiter store for Auth APIs
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Checks if a given IP exceeds the limit within the time window.
 * Default: 10 requests per 1 minute per IP.
 */
export function checkRateLimit(ip: string, limit = 10, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const client = rateLimitStore.get(ip);

  if (!client) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (now > client.resetTime) {
    // Reset window
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  client.count += 1;
  if (client.count > limit) {
    return true;
  }

  return false;
}

/**
 * CORS options wrapper
 */
export function applyCorsHeaders(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}
