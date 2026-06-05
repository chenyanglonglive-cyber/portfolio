import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * 飞书卡片回调代理路由：飞书（HTTPS）→ Vercel（HTTPS）→ ECS 机器公网 IP（HTTP）
 * 绕过阿里云国内 ECS 对未备案域名的 443/80 端口封锁
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 转发请求给 ECS 上的 Strapi
    const strapiRes = await fetch(`${STRAPI_URL}/api/feishu/card-callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await strapiRes.json();
    return NextResponse.json(data, { status: strapiRes.status });
  } catch (err: any) {
    console.error('[Feishu Callback Proxy Error]', err);
    return NextResponse.json(
      { error: 'Proxy request failed', message: err.message },
      { status: 500 }
    );
  }
}
