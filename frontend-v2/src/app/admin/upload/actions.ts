"use server";

import { revalidatePath } from "next/cache";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://strapi.wcyblog.space";
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${STRAPI_TOKEN}` };
}

/**
 * Upload a file to Strapi media library (used for thumbnails and images).
 */
export async function uploadToStrapi(formData: FormData) {
  if (!STRAPI_TOKEN) throw new Error("Missing Strapi Admin Token");

  const response = await fetch(`${STRAPI_URL}/api/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Upload failed (${response.status})`);
  }

  const data = await response.json();
  return data[0];
}

/**
 * Upload video to ECS compression endpoint, which runs FFmpeg and
 * returns the Strapi media-library file object for the compressed video.
 *
 * Progress note: this is a single long-running request (upload + compress).
 * The caller should show an "uploading + compressing" stage.
 */
export async function compressAndUploadVideo(formData: FormData): Promise<{
  id: number;
  url: string;
  name: string;
  size: number;
}> {
  if (!STRAPI_TOKEN) throw new Error("Missing Strapi Admin Token");

  const response = await fetch(`${STRAPI_URL}/api/videos/compress`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  if (!response.ok) {
    let msg = `Compression failed (${response.status})`;
    try {
      const err = await response.json();
      msg = err.error?.message || msg;
    } catch { /* ok */ }
    throw new Error(msg);
  }

  const json = await response.json();
  return json.data;
}

/**
 * Create a Video entry in Strapi.
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
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || "Video entry creation failed");
  }

  revalidatePath("/works");
  revalidatePath("/");
  return response.json();
}

/**
 * Create an Image entry in Strapi.
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
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || "Image entry creation failed");
  }

  revalidatePath("/works");
  revalidatePath("/");
  return response.json();
}

/**
 * Fetch the compression API token (so the client can upload directly to ECS
 * and track upload progress via XHR). Only returns the token; the admin page
 * is the only consumer.
 */
export async function getCompressToken(): Promise<string> {
  return STRAPI_TOKEN || "";
}
