import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware";
import { SaveCollegeSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/responses";

// GET /api/saved - Retrieve logged-in user's saved colleges
export const GET = withAuth(async (req: NextRequest, context, user) => {
  try {
    const savedColleges = await prisma.savedCollege.findMany({
      where: { userId: user.id },
      include: {
        college: true,
      },
      orderBy: {
        savedAt: "desc",
      },
    });

    return successResponse(
      savedColleges,
      "Saved colleges retrieved successfully",
      200
    );
  } catch (err: any) {
    return errorResponse("Internal server error", 500);
  }
});

// POST /api/saved - Save college for logged-in user
export const POST = withAuth(async (req: NextRequest, context, user) => {
  try {
    const body = await req.json();
    const validatedData = SaveCollegeSchema.safeParse(body);

    if (!validatedData.success) {
      return errorResponse("Validation error", 400, validatedData.error);
    }

    const { collegeId } = validatedData.data;

    // Verify college exists
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!college) {
      return errorResponse(`College with ID ${collegeId} does not exist`, 404);
    }

    // Verify if already saved
    const existingSaved = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId: user.id,
          collegeId,
        },
      },
    });

    if (existingSaved) {
      return successResponse(
        existingSaved,
        "College is already saved in your shortlist",
        200
      );
    }

    // Save and log activity in database transaction
    const saved = await prisma.$transaction(async (tx) => {
      const savedItem = await tx.savedCollege.create({
        data: {
          userId: user.id,
          collegeId,
        },
      });

      await tx.userActivity.create({
        data: {
          userId: user.id,
          action: "USER_SAVE_COLLEGE",
          metadata: { collegeId, collegeName: college.name },
        },
      });

      return savedItem;
    });

    return successResponse(saved, "College saved successfully", 201);
  } catch (err: any) {
    return errorResponse("Internal server error", 500);
  }
});
