import https from "node:https";
import type { Work } from "@/types/work";
import type { Article } from "@/types/article";
import type { About } from "@/types/about";
import { normalizeWork } from "@/types/work";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

const ipv4Agent =
  typeof https.Agent === "function"
    ? new https.Agent({ family: 4, keepAlive: true })
    : null;

const FETCH_TIMEOUT = 30_000;

async function strapiFetch(url: string, revalidate: number): Promise<Response> {
  const opts: Record<string, unknown> = {
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
    next: { revalidate },
  };
  // Force IPv4 — Strapi Cloud's Cloudflare CDN uses IPv6-only DNS, and
  // IPv6 paths from Vercel's Asia-Pacific edge can suffer 15s+ timeouts.
  if (url.startsWith("https://") && ipv4Agent) {
    opts.agent = ipv4Agent;
  }

  try {
    return await fetch(url, opts as unknown as RequestInit);
  } catch (firstErr) {
    const msg =
      firstErr instanceof Error ? firstErr.message : String(firstErr);
    const isNetwork =
      msg.includes("timed out") ||
      msg.includes("AbortError") ||
      msg.includes("ENOTFOUND") ||
      msg.includes("ETIMEDOUT") ||
      msg.includes("ECONNRESET") ||
      msg.includes("ECONNREFUSED") ||
      msg.includes("fetch failed");

    if (!isNetwork) throw firstErr;

    console.warn(
      `[Strapi] First attempt failed (${msg.slice(0, 80)}), retrying…`
    );
    await new Promise((r) => setTimeout(r, 1_500));
    return await fetch(url, opts as unknown as RequestInit);
  }
}

/**
 * 通用 Strapi 获取函数
 * @param revalidate ISR 缓存时间（秒），默认 3600（1 小时）
 */
export async function queryStrapi<T = unknown>(
  path: string,
  revalidate: number = 3600
): Promise<T> {
  const url = `${STRAPI_URL}/api/${path}`;
  const res = await strapiFetch(url, revalidate);

  if (!res.ok) {
    throw new Error(`Strapi 响应异常 (${res.status})`);
  }

  const json = await res.json();
  return json.data as T;
}

/**
 * 诊断各 Strapi endpoint 连通性
 */
export async function healthCheck(): Promise<{
  ok: boolean;
  videos: boolean;
  images: boolean;
  articles: boolean;
  error?: string;
}> {
  try {
    const [videos, images, articles] = await Promise.all([
      queryStrapi("videos?pagination[limit]=1", 60).catch(() => null),
      queryStrapi("images?pagination[limit]=1", 60).catch(() => null),
      queryStrapi("articles?pagination[limit]=1", 60).catch(() => null),
    ]);
    return {
      ok: videos !== null || images !== null || articles !== null,
      videos: videos !== null,
      images: images !== null,
      articles: articles !== null,
      error:
        videos === null && images === null && articles === null
          ? "All endpoints unreachable"
          : undefined,
    };
  } catch {
    return {
      ok: false,
      videos: false,
      images: false,
      articles: false,
      error: "Health check failed",
    };
  }
}

const STRAPI_MEDIA_HOST = 'https://strapi.wcyblog.space';

/** Convert a Strapi media URL to the public CDN URL
 *  (Cloudflare-proxied strapi.wcyblog.space) */
export function getStrapiProxyUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('//')) {
    const urlObj = new URL(url);
    return `${STRAPI_MEDIA_HOST}${urlObj.pathname}`;
  }
  return `${STRAPI_MEDIA_HOST}${url}`;
}

export function getStrapiMedia(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('//')) {
    if (
      url.includes('strapiapp.com') ||
      url.includes('strapi.wcyblog.space') ||
      url.includes('47.95.242.40')
    ) {
      const urlObj = new URL(url);
      return `${STRAPI_MEDIA_HOST}${urlObj.pathname}`;
    }
    if (url.includes('r2.dev') || url.includes('cloudflarestorage.com')) {
      const urlObj = new URL(url);
      return `/r2-assets${urlObj.pathname}`;
    }
    return url;
  }
  return `${STRAPI_MEDIA_HOST}${url}`;
}

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
      queryStrapi<Work[]>(
        `videos?filters[IsFeatured][$eq]=true&${videoFields}`
      ),
      queryStrapi<Work[]>(
        `images?filters[IsFeatured][$eq]=true&${imageFields}`
      ),
    ]);
    const allFeatured = [...(videos || []), ...(images || [])];
    return allFeatured.map(normalizeWork).sort((a, b) => b.Rank - a.Rank);
  } catch {
    return [];
  }
}

export async function getArticles(): Promise<Article[]> {
  try {
    const data = await queryStrapi<Article[]>(
      "articles?populate=*&sort=publishedAt:desc"
    );
    return data || [];
  } catch {
    return [];
  }
}

export async function getAbout(): Promise<About | null> {
  try {
    const data = await queryStrapi<About[]>(
      "abouts?populate=*&sort=publishedAt:desc"
    );
    return Array.isArray(data) ? data[0] || null : null;
  } catch {
    return null;
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const data = await queryStrapi<Article[]>(
      `articles?filters[Slug][$eq]=${encodeURIComponent(slug)}&populate=*`
    );
    return Array.isArray(data) ? data[0] || null : null;
  } catch {
    return null;
  }
}
