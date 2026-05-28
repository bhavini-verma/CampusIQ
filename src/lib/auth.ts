import * as jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "development_jwt_secret_key_college_discovery_platform_2026";

export interface TokenPayload {
  userId: number;
  email: string;
}

/**
 * Generates a JWT token for the user session
 */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verifies a JWT token and returns payload or null if invalid
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "object" && decoded !== null && "userId" in decoded && "email" in decoded) {
      return {
        userId: (decoded as any).userId,
        email: (decoded as any).email,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Extracts and verifies the token from the Authorization header of a NextRequest/Request
 */
export async function getUserFromRequest(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}
