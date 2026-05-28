import { NextRequest } from "next/server";
import { RegisterSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { successResponse, errorResponse } from "@/lib/responses";
import { checkRateLimit } from "@/lib/middleware";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate Limiting
  if (checkRateLimit(ip, 5, 60 * 1000)) {
    logger.warn(`Rate limit exceeded for IP: ${ip} on register`);
    return errorResponse("Too many registration requests. Please try again in a minute.", 429);
  }

  try {
    const body = await req.json();
    const validatedData = RegisterSchema.safeParse(body);

    if (!validatedData.success) {
      return errorResponse("Validation error", 400, validatedData.error);
    }

    const { email, password } = validatedData.data;

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return errorResponse("A user with this email already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user & activity in a database transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
        },
      });

      await tx.userActivity.create({
        data: {
          userId: user.id,
          action: "USER_REGISTER",
          metadata: { email: user.email },
        },
      });

      return user;
    });

    logger.success(`User registered successfully: ${newUser.email}`);
    const duration = Date.now() - startTime;
    logger.request("POST", "/api/auth/register", duration, 201);

    return successResponse(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
      },
      "User registered successfully",
      201
    );
  } catch (err: any) {
    const duration = Date.now() - startTime;
    logger.error(`Error in registration API (${duration}ms)`, err);
    return errorResponse("Internal server error", 500);
  }
}
