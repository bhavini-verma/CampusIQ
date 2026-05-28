import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "./lib/logger";

export function middleware(request: NextRequest) {
  const method = request.method;
  const url = request.nextUrl.pathname + request.nextUrl.search;

  // Handle CORS Preflight immediately
  if (method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return response;
  }

  // Log incoming requests
  logger.info(`Incoming ${method} to ${url}`);

  const response = NextResponse.next();

  // Add standard CORS headers for other responses
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return response;
}

// Apply middleware to all api routes
export const config = {
  matcher: "/api/:path*",
};
