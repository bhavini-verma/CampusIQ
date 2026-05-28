import { NextRequest } from "next/server";
import { PredictSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/responses";
import { getUserFromRequest } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const validatedData = PredictSchema.safeParse(body);

    if (!validatedData.success) {
      return errorResponse("Validation error", 400, validatedData.error);
    }

    const { exam, rank } = validatedData.data;

    // Fetch colleges accepting this exam
    const colleges = await prisma.college.findMany({
      where: {
        entranceExam: {
          equals: exam,
          mode: "insensitive",
        },
      },
    });

    if (colleges.length === 0) {
      return successResponse(
        { predictions: [] },
        `No colleges found accepting exam: ${exam}`,
        200
      );
    }

    // Predict probability based on cutoff ranks
    const predictions = colleges.map((college) => {
      let probability = 10;
      const cutoff = college.cutoffRank;

      if (rank < cutoff * 0.8) {
        probability = 90;
      } else if (rank < cutoff) {
        probability = 65;
      } else if (rank < cutoff * 1.2) {
        probability = 35;
      }

      return {
        collegeId: college.id,
        college: college.name,
        location: college.location,
        state: college.state,
        fees: college.fees,
        rating: college.rating,
        cutoffRank: cutoff,
        probability,
      };
    });

    // Sort predictions by probability (descending) and cutoffRank (ascending for prestigious)
    predictions.sort((a, b) => {
      if (b.probability !== a.probability) {
        return b.probability - a.probability;
      }
      return a.cutoffRank - b.cutoffRank;
    });

    // Optional: Log user activity if they are authenticated
    const user = await getUserFromRequest(req);
    if (user) {
      await prisma.userActivity.create({
        data: {
          userId: user.id,
          action: "COLLEGE_PREDICTION",
          metadata: { exam, rank, resultsCount: predictions.length },
        },
      });
    }

    const duration = Date.now() - startTime;
    logger.request("POST", "/api/predict", duration, 200);

    return successResponse(
      { predictions },
      "College predictions generated successfully",
      200
    );
  } catch (err: any) {
    const duration = Date.now() - startTime;
    logger.error(`Error in Predict API (${duration}ms)`, err);
    return errorResponse("Internal server error", 500);
  }
}
