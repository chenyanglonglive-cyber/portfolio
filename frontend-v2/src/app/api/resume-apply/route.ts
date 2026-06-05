import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * 代理路由：浏览器 → Vercel（HTTPS）→ Strapi（HTTP）
 * 解决 Mixed Content 问题：浏览器无法从 HTTPS 页面直接请求 HTTP 地址
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const strapiRes = await fetch(`${STRAPI_URL}/api/resume-requests/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await strapiRes.json();

    return NextResponse.json(data, { status: strapiRes.status });
  } catch (err: any) {
    console.error('[Resume Proxy Error]', err);
    return NextResponse.json(
      { error: 'Proxy request failed', message: err.message },
      { status: 500 }
    );
  }
}
