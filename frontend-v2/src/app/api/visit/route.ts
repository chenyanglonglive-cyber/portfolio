import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getStrapiUrl() {
  return (
    process.env.STRAPI_URL ||
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    "https://strapi.wcyblog.space"
  ).replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const forwardedFor =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "";

  try {
    const response = await fetch(`${getStrapiUrl()}/api/visit-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": req.headers.get("user-agent") || "",
        "X-Forwarded-For": forwardedFor,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await response.text();
    let data: unknown = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Visit log proxy failed", error: err.message },
      { status: 502 }
    );
  }
}
