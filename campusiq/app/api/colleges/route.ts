import { NextRequest } from "next/server";
import { CollegeQuerySchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/responses";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(req.url);

  // Convert search params iterator to plain object
  const queryObj: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    queryObj[key] = value;
  });

  try {
    const validatedData = CollegeQuerySchema.safeParse(queryObj);

    if (!validatedData.success) {
      return errorResponse("Invalid query parameters", 400, validatedData.error);
    }

    const { search, state, maxFees, exam, page, limit, sortBy, order } = validatedData.data;

    // Build dynamic Prisma query filter
    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (state) {
      where.state = {
        equals: state,
        mode: "insensitive",
      };
    }

    if (maxFees !== undefined) {
      where.fees = {
        lte: maxFees,
      };
    }

    if (exam) {
      where.entranceExam = {
        equals: exam,
        mode: "insensitive",
      };
    }

    const skip = (page - 1) * limit;

    // Fetch data and count in parallel for performance
    const [colleges, totalCount] = await Promise.all([
      prisma.college.findMany({
        where,
        orderBy: {
          [sortBy]: order,
        },
        skip,
        take: limit,
      }),
      prisma.college.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    logger.info(`Fetched ${colleges.length} colleges for search criteria`);
    const duration = Date.now() - startTime;
    logger.request("GET", `/api/colleges?${searchParams.toString()}`, duration, 200);

    return successResponse(
      {
        colleges,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      "Colleges fetched successfully",
      200
    );
  } catch (err: any) {
    const duration = Date.now() - startTime;
    logger.error(`Error in GET colleges API (${duration}ms)`, err);
    return errorResponse("Internal server error", 500);
  }
}
