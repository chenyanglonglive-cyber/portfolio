import { healthCheck } from "@/lib/strapi";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await healthCheck();
  return NextResponse.json(
    { ...result, timestamp: new Date().toISOString() },
    { status: result.ok ? 200 : 503 }
  );
}
