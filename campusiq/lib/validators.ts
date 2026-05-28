import { z } from "zod";

// Authentication Schemas
export const RegisterSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  name: z.string().min(1, { message: "Name is required" }),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// College Query Schema for GET /api/colleges
export const CollegeQuerySchema = z.object({
  search: z.string().optional(),
  state: z.string().optional(),
  maxFees: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().positive().optional()),
  exam: z.string().optional(),
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  sortBy: z.enum(["rating", "fees", "placementAvgSalary"]).default("rating"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// Predict API Schema
export const PredictSchema = z.object({
  exam: z.string().min(1, { message: "Exam name is required (e.g. JEE)" }),
  rank: z.number().int().positive({ message: "Rank must be a positive integer" }),
});

// Compare API Schema (using String collegeIds)
export const CompareSchema = z.object({
  collegeIds: z
    .array(z.string().min(1))
    .min(1, { message: "Provide at least one college ID to compare" }),
});

// Save College Schema (using String collegeId)
export const SaveCollegeSchema = z.object({
  collegeId: z.string().min(1, { message: "College ID must be a non-empty string" }),
});
