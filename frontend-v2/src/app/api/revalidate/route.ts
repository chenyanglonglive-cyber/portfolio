import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

async function handleRevalidate(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const localSecret = process.env.REVALIDATE_SECRET;

  if (!localSecret) {
    return NextResponse.json(
      { message: "Revalidation secret is not configured on server" },
      { status: 500 }
    );
  }

  if (secret !== localSecret) {
    return NextResponse.json({ message: "Invalid secret token" }, { status: 401 });
  }

  try {
    // Revalidate the root layout recursively (which clears the cache for all pages)
    revalidatePath("/", "layout");
    
    console.log("[Revalidate] Successfully triggered revalidation for root layout");
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Revalidation failed", error: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleRevalidate(req);
}

export async function POST(req: NextRequest) {
  return handleRevalidate(req);
}
