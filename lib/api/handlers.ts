// Small helpers shared by API route handlers.

import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function handleUnknown(err: unknown) {
  if (err instanceof ZodError) {
    return jsonError("Validation failed", 400, err.flatten());
  }
  if (err instanceof Response) {
    return err;
  }
  const message = err instanceof Error ? err.message : "Unexpected error";
  return jsonError(message, 500);
}
