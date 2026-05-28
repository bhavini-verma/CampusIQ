import { NextRequest } from "next/server";
import { LoginSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/responses";
import { checkRateLimit } from "@/lib/middleware";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate Limiting for Auth APIs
  if (checkRateLimit(ip, 5, 60 * 1000)) {
    logger.warn(`Rate limit exceeded for IP: ${ip} on login`);
    return errorResponse("Too many login attempts. Please try again in a minute.", 429);
  }

  try {
    const body = await req.json();
    const validatedData = LoginSchema.safeParse(body);

    if (!validatedData.success) {
      return errorResponse("Validation error", 400, validatedData.error);
    }

    const { email, password } = validatedData.data;

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    // Create login activity log
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN",
        metadata: { ip },
      },
    });

    logger.success(`User logged in successfully: ${user.email}`);
    const duration = Date.now() - startTime;
    logger.request("POST", "/api/auth/login", duration, 200);

    return successResponse(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      "Login successful",
      200
    );
  } catch (err: any) {
    const duration = Date.now() - startTime;
    logger.error(`Error in login API (${duration}ms)`, err);
    return errorResponse("Internal server error", 500);
  }
}
