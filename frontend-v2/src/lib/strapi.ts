import type { Work } from "@/types/work";
import type { Article } from "@/types/article";
import { normalizeWork } from "@/types/work";

/**
 * Strapi 媒体 URL 处理：支持本地、远程以及 Vercel Proxy 加速
 */
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * 通用 Strapi 获取函数，增加了错误捕获逻辑
 */
export async function queryStrapi<T = unknown>(path: string): Promise<T | null> {
  const url = `${STRAPI_URL}/api/${path}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(15000)
    });

    if (!res.ok) {
      console.error(`Strapi Fetch Error: ${res.status} ${res.statusText}`);
      return null;
    }

    const json = await res.json();
    return json.data as T;
  } catch (err) {
    console.error(`Network Error calling Strapi (${url}):`, err);
    return null;
  }
}

/**
 * 获取媒体文件的完整 URL，支持 Vercel Proxy 加速
 */
export function getStrapiMedia(url: string | undefined): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("//")) {
    // Strapi Cloud 媒体文件 → Vercel Proxy
    if (url.includes("strapiapp.com")) {
      const path = url.split("strapiapp.com")[1];
      return `/strapi-media${path}`;
    }
    // R2 直链 → Vercel Proxy（解决 CORS + 边缘缓存）
    if (url.includes("r2.dev") || url.includes("cloudflarestorage.com")) {
      const urlObj = new URL(url);
      return `/r2-assets${urlObj.pathname}`;
    }
    return url;
  }
  return `${STRAPI_URL}${url}`;
}

/**
 * 获取所有作品，按权重 (Rank) 降序排列
 */
export async function getWorks(): Promise<Work[]> {
  const data = await queryStrapi<Work[]>("works?populate=*&sort=Rank:desc");
  return (data || []).map(normalizeWork);
}

/**
 * 获取精选作品 (IsFeatured 为 true)
 */
export async function getFeaturedWorks(): Promise<Work[]> {
  const data = await queryStrapi<Work[]>("works?filters[IsFeatured][$eq]=true&populate=*&sort=Rank:desc");
  return (data || []).map(normalizeWork);
}

/**
 * 获取所有手记，按发布时间倒序排列
 */
export async function getArticles(): Promise<Article[]> {
  const data = await queryStrapi<Article[]>("articles?populate=*&sort=publishedAt:desc");
  return data || [];
}

/**
 * 根据 Slug 获取单篇手记
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const data = await queryStrapi<Article[]>(`articles?filters[Slug][$eq]=${encodeURIComponent(slug)}&populate=*`);
  return Array.isArray(data) ? data[0] || null : null;
}
