"use server";

import { revalidatePath } from "next/cache";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://dazzling-family-6d1f24102d.strapiapp.com";
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

/**
 * 上传文件到 Strapi 媒体库
 */
export async function uploadToStrapi(formData: FormData) {
  if (!STRAPI_TOKEN) throw new Error("Missing Strapi Admin Token");

  const response = await fetch(`${STRAPI_URL}/api/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Upload failed");
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

  const response = await fetch(`${STRAPI_URL}/api/works`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Entry creation failed");
  }

  revalidatePath("/works");
  revalidatePath("/");
  return await response.json();
}
