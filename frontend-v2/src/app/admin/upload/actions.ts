"use server";

import { revalidatePath } from "next/cache";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://strapi.wcyblog.space";
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
  return data[0];
}

/**
 * 创建 Video 条目（上传 cover 后自动填入 cover 字段）
 */
export async function createVideoEntry(data: {
  title: string;
  videoId: number;
  coverId: number;
}) {
  if (!STRAPI_TOKEN) throw new Error("Missing Strapi Admin Token");

  const payload = {
    data: {
      Title: data.title,
      video: { id: data.videoId },
      cover: { id: data.coverId },
      publishedAt: new Date().toISOString(),
    },
  };

  const response = await fetch(`${STRAPI_URL}/api/videos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Video entry creation failed");
  }

  revalidatePath("/works");
  revalidatePath("/");
  return await response.json();
}

/**
 * 创建 Image 条目
 */
export async function createImageEntry(data: {
  title: string;
  imageId: number;
}) {
  if (!STRAPI_TOKEN) throw new Error("Missing Strapi Admin Token");

  const payload = {
    data: {
      Title: data.title,
      image: { id: data.imageId },
      publishedAt: new Date().toISOString(),
    },
  };

  const response = await fetch(`${STRAPI_URL}/api/images`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Image entry creation failed");
  }

  revalidatePath("/works");
  revalidatePath("/");
  return await response.json();
}
