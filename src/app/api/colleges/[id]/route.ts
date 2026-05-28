import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/responses";
import { logger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const params = await context.params;
  const collegeId = parseInt(params.id, 10);

  if (isNaN(collegeId)) {
    return errorResponse("Invalid college ID. Must be an integer.", 400);
  }

  try {
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!college) {
      return errorResponse(`College with ID ${collegeId} not found`, 404);
    }

    const duration = Date.now() - startTime;
    logger.request("GET", `/api/colleges/${params.id}`, duration, 200);

    return successResponse(college, "College details retrieved successfully", 200);
  } catch (err: any) {
    const duration = Date.now() - startTime;
    logger.error(`Error in GET college by ID API (${duration}ms)`, err);
    return errorResponse("Internal server error", 500);
  }
}
