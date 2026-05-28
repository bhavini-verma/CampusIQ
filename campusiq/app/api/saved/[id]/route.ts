import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/responses";

export const DELETE = withAuth(
  async (
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
    user
  ) => {
    const params = await context.params;
    const targetId = params.id;

    if (!targetId) {
      return errorResponse("Invalid ID.", 400);
    }

    try {
      // Try to find the record by collegeId first
      let savedRecord = await prisma.savedCollege.findFirst({
        where: {
          userId: user.id,
          collegeId: targetId,
        },
      });

      // If not found, try by SavedCollege record ID
      if (!savedRecord) {
        savedRecord = await prisma.savedCollege.findFirst({
          where: {
            id: targetId,
            userId: user.id,
          },
        });
      }

      if (!savedRecord) {
        return errorResponse(
          `No saved college found for ID ${targetId}`,
          404
        );
      }

      // Delete the record and log activity in a single transaction
      await prisma.$transaction(async (tx) => {
        await tx.savedCollege.delete({
          where: { id: savedRecord.id },
        });

        await tx.userActivity.create({
          data: {
            userId: user.id,
            action: "USER_UNSAVE_COLLEGE",
            metadata: {
              collegeId: savedRecord.collegeId,
              savedRecordId: savedRecord.id,
            },
          },
        });
      });

      return successResponse(
        {
          deletedSavedId: savedRecord.id,
          collegeId: savedRecord.collegeId,
        },
        "Saved college removed successfully",
        200
      );
    } catch (err: any) {
      return errorResponse("Internal server error", 500);
    }
  }
);
