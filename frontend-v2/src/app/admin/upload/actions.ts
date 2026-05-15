"use server";

import { revalidatePath } from "next/cache";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://dazzling-family-6d1f24102d.strapiapp.com";
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN;
const UPLOAD_TIMEOUT_MS = 120_000; // 2 分钟，留给大文件足够时间

/**
 * 将已上传到 R2 的文件 URL 注册到 Strapi 媒体库
 * Strapi 会从 URL 下载文件并入库（服务器间传输，速度快）
 */
export async function registerMediaFromUrl(fileUrl: string) {
  if (!STRAPI_TOKEN) throw new Error("Missing Strapi Admin Token");

  let response: Response;
  try {
    response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({ url: fileUrl }),
      signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new Error("媒体注册超时，请稍后重试");
    }
    throw new Error(`网络连接失败（${(err as Error).message || "未知错误"}）`);
  }

  if (!response.ok) {
    let serverMsg = "服务器错误";
    try {
      const error = await response.json();
      serverMsg = error.error?.message || serverMsg;
    } catch { /* 非 JSON 响应 */ }
    throw new Error(`媒体注册失败 (${response.status})：${serverMsg}`);
  }

  const data = await response.json();
  return data[0]; // 返回注册后的媒体对象
}

/**
 * 上传文件到 Strapi 媒体库（直接传输，适用于小文件）
 */
export async function uploadToStrapi(formData: FormData) {
  if (!STRAPI_TOKEN) throw new Error("Missing Strapi Admin Token");

  let response: Response;
  try {
    response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: formData,
      signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new Error("上传超时：服务器处理文件时间过长，请尝试压缩视频后重试");
    }
    throw new Error(`网络连接失败，请检查网络后重试（${(err as Error).message || "未知错误"}）`);
  }

  if (!response.ok) {
    let serverMsg = "服务器错误";
    try {
      const error = await response.json();
      serverMsg = error.error?.message || serverMsg;
    } catch { /* response body 不是 JSON，用默认消息 */ }
    throw new Error(`上传失败 (${response.status})：${serverMsg}`);
  }

  const data = await response.json();
  return data[0]; // 返回上传后的媒体对象
}

/**
 * 创建 Work 作品条目
 */
export async function createWorkEntry(data: {
  title: string;
  category: string;
  videoId: number;
  thumbnailId: number;
  rank?: number;
}) {
  if (!STRAPI_TOKEN) throw new Error("Missing Strapi Admin Token");

  const payload = {
    data: {
      Title: data.title,
      Category: data.category,
      Video: data.videoId,
      Thumbnail: data.thumbnailId,
      Rank: data.rank || 0,
      publishedAt: new Date().toISOString(), // 立即发布
    },
  };

  let response: Response;
  try {
    response = await fetch(`${STRAPI_URL}/api/works`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err: unknown) {
    throw new Error(`创建作品条目失败：网络异常（${(err as Error).message || "未知错误"}）`);
  }

  if (!response.ok) {
    let serverMsg = "服务器错误";
    try {
      const error = await response.json();
      serverMsg = error.error?.message || serverMsg;
    } catch { /* 非 JSON 响应 */ }
    throw new Error(`创建作品条目失败 (${response.status})：${serverMsg}`);
  }

  revalidatePath("/works");
  revalidatePath("/");
  return await response.json();
}
