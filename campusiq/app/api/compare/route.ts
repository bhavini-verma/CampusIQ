import { NextRequest } from "next/server";
import { CompareSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/responses";
import { getUserFromRequest } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const validatedData = CompareSchema.safeParse(body);

    if (!validatedData.success) {
      return errorResponse("Validation error", 400, validatedData.error);
    }

    const { collegeIds } = validatedData.data;

    // Fetch the colleges to compare
    const colleges = await prisma.college.findMany({
      where: {
        id: {
          in: collegeIds,
        },
      },
    });

    if (colleges.length === 0) {
      return errorResponse("No colleges found for the provided IDs", 404);
    }

    const comparisonResults: any = {
      colleges: colleges.map((c) => ({
        id: c.id,
        name: c.name,
        location: c.location,
        state: c.state,
        fees: c.fees,
        rating: c.rating,
        placementAvgSalary: c.placementAvgSalary,
        placementHighestSalary: c.placementHighestSalary,
        cutoffRank: c.cutoffRank,
        established: c.established,
        type: c.type,
      })),
      diff: {},
      verdict: "",
    };

    // If comparing 2 or more colleges, calculate the differences
    if (colleges.length >= 2) {
      // 1. FEES (Lower is better)
      const sortedFees = [...colleges].sort((a, b) => a.fees - b.fees);
      const feesWinner = sortedFees[0];
      const feesRunnerUp = sortedFees[1];
      const feesSavedPercent = Math.round(
        ((feesRunnerUp.fees - feesWinner.fees) / feesRunnerUp.fees) * 100
      );

      comparisonResults.diff.fees = {
        winner: feesWinner.name,
        by: feesSavedPercent > 0 ? `${feesSavedPercent}% cheaper` : "Identical fees",
      };

      // 2. PLACEMENT AVERAGE SALARY (Higher is better)
      const sortedPlacements = [...colleges].sort(
        (a, b) => b.placementAvgSalary - a.placementAvgSalary
      );
      const placementWinner = sortedPlacements[0];
      const placementRunnerUp = sortedPlacements[1];
      const placementDiff = placementWinner.placementAvgSalary - placementRunnerUp.placementAvgSalary;
      const placementDiffLakhs = (placementDiff / 100000).toFixed(1);

      comparisonResults.diff.placement = {
        winner: placementWinner.name,
        by:
          placementDiff > 0
            ? `₹${placementDiffLakhs}L higher avg`
            : "Identical avg package",
      };

      // 3. RATING (Higher is better)
      const sortedRatings = [...colleges].sort((a, b) => b.rating - a.rating);
      const ratingWinner = sortedRatings[0];
      const ratingRunnerUp = sortedRatings[1];
      const ratingDiffVal = (ratingWinner.rating - ratingRunnerUp.rating).toFixed(1);

      comparisonResults.diff.rating = {
        winner: ratingWinner.name,
        by:
          parseFloat(ratingDiffVal) > 0
            ? `${ratingDiffVal} stars higher`
            : "Identical student rating",
      };

      // 4. CUTOFF RANK (Lower is better - more selective)
      const sortedCutoffs = [...colleges].sort((a, b) => a.cutoffRank - b.cutoffRank);
      const cutoffWinner = sortedCutoffs[0];
      const cutoffRunnerUp = sortedCutoffs[1];
      const cutoffDiffVal = cutoffRunnerUp.cutoffRank - cutoffWinner.cutoffRank;

      comparisonResults.diff.cutoffRank = {
        winner: cutoffWinner.name,
        by:
          cutoffDiffVal > 0
            ? `${cutoffDiffVal} ranks more competitive`
            : "Identical selectivity",
      };

      // 5. Intelligent Verdict Engine (weighted scoring)
      const scores = new Map<string, number>();
      colleges.forEach((c) => scores.set(c.id, 0));

      scores.set(feesWinner.id, (scores.get(feesWinner.id) || 0) + 1.0);
      scores.set(placementWinner.id, (scores.get(placementWinner.id) || 0) + 1.5);
      scores.set(ratingWinner.id, (scores.get(ratingWinner.id) || 0) + 1.0);
      scores.set(cutoffWinner.id, (scores.get(cutoffWinner.id) || 0) + 1.2);

      let topCollegeId = colleges[0].id;
      let maxScore = -1;
      scores.forEach((score, id) => {
        if (score > maxScore) {
          maxScore = score;
          topCollegeId = id;
        }
      });

      const overallWinner = colleges.find((c) => c.id === topCollegeId)!;

      // Dynamic verdict reasoning
      let verdictReasoning = "";
      if (overallWinner.id === placementWinner.id && overallWinner.id === ratingWinner.id) {
        verdictReasoning = `${overallWinner.name} offers the best overall value, leading both in premium placements (avg ₹${(overallWinner.placementAvgSalary / 100000).toFixed(1)}L) and superb student ratings (${overallWinner.rating} stars).`;
      } else if (overallWinner.id === feesWinner.id) {
        verdictReasoning = `${overallWinner.name} is the most economical selection, delivering quality engineering tracks at a highly accessible fee of ₹${overallWinner.fees.toLocaleString()}/yr.`;
      } else {
        verdictReasoning = `${overallWinner.name} stands out as the highly recommended institution, boasting excellent balance across academic reputation, salary packages, and entrance competitiveness.`;
      }

      comparisonResults.verdict = verdictReasoning;
    } else {
      comparisonResults.verdict = "Add at least one more college to perform comparison analysis.";
    }

    // Optional: Log comparison under user account
    const user = await getUserFromRequest(req);
    if (user) {
      await prisma.userActivity.create({
        data: {
          userId: user.id,
          action: "COLLEGE_COMPARISON",
          metadata: { collegeIds, collegeCount: colleges.length },
        },
      });
    }

    const duration = Date.now() - startTime;
    logger.request("POST", "/api/compare", duration, 200);

    return successResponse(comparisonResults, "College comparison compiled successfully", 200);
  } catch (err: any) {
    const duration = Date.now() - startTime;
    logger.error(`Error in Compare API (${duration}ms)`, err);
    return errorResponse("Internal server error", 500);
  }
}
