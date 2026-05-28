import { NextResponse } from "next/server";

export function successResponse<T>(data: T, message = "Success", status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(message: string, status = 500, details?: unknown) {
  let formattedMessage = message;
  if (details && typeof details === "object" && "issues" in details) {
    const zodIssues = (details as { issues: Array<{ path: Array<string | number>; message: string }> }).issues;
    const errors = zodIssues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");
    formattedMessage = `${message} Details: ${errors}`;
  }

  return NextResponse.json(
    {
      success: false,
      message: formattedMessage,
    },
    { status }
  );
}
