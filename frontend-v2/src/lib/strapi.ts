import type { Work } from "@/types/work";
import type { Article } from "@/types/article";
import type { About } from "@/types/about";
import { normalizeWork } from "@/types/work";

/**
 * Strapi 媒体 URL 处理：支持本地、远程以及 Vercel Proxy 加速
 */
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * 通用 Strapi 获取函数，增加了错误捕获逻辑
 * @param revalidate ISR 缓存时间（秒），默认 3600（1 小时）。作品列表变化不频繁，长缓存减少 Strapi Cloud 跨区域延迟
 */
export async function queryStrapi<T = unknown>(
  path: string,
  revalidate: number = 3600
): Promise<T> {
  const url = `${STRAPI_URL}/api/${path}`;
  const res = await fetch(url, {
    next: { revalidate },
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    throw new Error(`Strapi 响应异常 (${res.status})`);
  }

  const json = await res.json();
  return json.data as T;
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
    return url;
  }
  return `${STRAPI_URL}${url}`;
}

/**
 * 获取所有作品，按权重 (Rank) 降序排列
 */
export async function getWorks(): Promise<Work[]> {
  const videoFields = [
    "populate[video][fields][0]=url",
    "populate[cover][fields][0]=url",
    "fields[0]=Title",
    "fields[1]=IsFeatured",
    "fields[2]=Rank",
    "fields[3]=Spend",
    "fields[4]=ROI_7D",
    "fields[5]=CTR",
    "fields[6]=Story",
    "fields[7]=LaunchDate",
    "pagination[pageSize]=50",
  ].join("&");

  const imageFields = [
    "populate[image][fields][0]=url",
    "fields[0]=Title",
    "fields[1]=IsFeatured",
    "fields[2]=Rank",
    "fields[3]=Spend",
    "fields[4]=ROI_7D",
    "fields[5]=CTR",
    "fields[6]=Story",
    "fields[7]=LaunchDate",
    "pagination[pageSize]=50",
  ].join("&");

  try {
    const [videos, images] = await Promise.all([
      queryStrapi<Work[]>(`videos?${videoFields}`),
      queryStrapi<Work[]>(`images?${imageFields}`),
    ]);
    const allWorks = [...(videos || []), ...(images || [])];
    return allWorks.map(normalizeWork).sort((a, b) => b.Rank - a.Rank);
  } catch {
    return [];
  }
}

/**
 * 获取精选作品 (IsFeatured 为 true)
 */
export async function getFeaturedWorks(): Promise<Work[]> {
  const videoFields = [
    "populate[video][fields][0]=url",
    "populate[cover][fields][0]=url",
    "fields[0]=Title",
    "fields[1]=IsFeatured",
    "fields[2]=Rank",
    "fields[3]=Spend",
    "fields[4]=ROI_7D",
    "fields[5]=CTR",
    "fields[6]=Story",
    "fields[7]=LaunchDate",
    "pagination[pageSize]=50",
  ].join("&");
  const imageFields = [
    "populate[image][fields][0]=url",
    "fields[0]=Title",
    "fields[1]=IsFeatured",
    "fields[2]=Rank",
    "fields[3]=Spend",
    "fields[4]=ROI_7D",
    "fields[5]=CTR",
    "fields[6]=Story",
    "fields[7]=LaunchDate",
    "pagination[pageSize]=50",
  ].join("&");

  try {
    const [videos, images] = await Promise.all([
      queryStrapi<Work[]>(`videos?filters[IsFeatured][$eq]=true&${videoFields}`),
      queryStrapi<Work[]>(`images?filters[IsFeatured][$eq]=true&${imageFields}`),
    ]);
    const allFeatured = [...(videos || []), ...(images || [])];
    return allFeatured.map(normalizeWork).sort((a, b) => b.Rank - a.Rank);
  } catch {
    return [];
  }
}

/**
 * 获取所有手记，按发布时间倒序排列
 */
export async function getArticles(): Promise<Article[]> {
  try {
    const data = await queryStrapi<Article[]>("articles?populate=*&sort=publishedAt:desc");
    return data || [];
  } catch {
    return [];
  }
}

/**
 * 获取 About 个人简介（取第一条发布的记录）
 */
export async function getAbout(): Promise<About | null> {
  try {
    const data = await queryStrapi<About[]>("abouts?populate=*&sort=publishedAt:desc");
    return Array.isArray(data) ? data[0] || null : null;
  } catch {
    return null;
  }
}

/**
 * 根据 Slug 获取单篇手记
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const data = await queryStrapi<Article[]>(`articles?filters[Slug][$eq]=${encodeURIComponent(slug)}&populate=*`);
    return Array.isArray(data) ? data[0] || null : null;
  } catch {
    return null;
  }
}
