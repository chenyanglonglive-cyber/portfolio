/**
 * Strapi 媒体 URL 处理：支持本地、远程以及 Vercel Proxy 加速
 */
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * 通用 Strapi 获取函数，增加了错误捕获逻辑
 */
export async function queryStrapi(path: string) {
  const url = `${STRAPI_URL}/api/${path}`;
  try {
    const res = await fetch(url, { 
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(15000) // 15秒超时保护
    });

    if (!res.ok) {
      console.error(`Strapi Fetch Error: ${res.status} ${res.statusText}`);
      return null;
    }

    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`Network Error calling Strapi (${url}):`, err);
    return null; // 返回 null 触发前台的兜底逻辑，防止全站崩溃
  }
}

/**
 * 获取媒体文件的完整 URL，支持 Vercel Proxy 加速
 */
export function getStrapiMedia(url: string | undefined) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("//")) {
    // 如果是 Strapi Cloud 的媒体域名，通过 Vercel Proxy 中转以加速并绕过 CORS
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
export async function getWorks() {
  const data = await queryStrapi("works?populate=*&sort=Rank:desc");
  return data || [];
}

/**
 * 获取精选作品 (IsFeatured 为 true)
 */
export async function getFeaturedWorks() {
  // 增加随机数或时间戳避免极其严重的缓存锁死，或者依赖 revalidate
  const data = await queryStrapi("works?filters[IsFeatured][$eq]=true&populate=*&sort=Rank:desc");
  return data || [];
}

/**
 * 获取所有手记，按发布时间倒序排列
 */
export async function getArticles() {
  const data = await queryStrapi("articles?populate=*&sort=publishedAt:desc");
  return data || [];
}

/**
 * 根据 Slug 获取单篇手记
 */
export async function getArticleBySlug(slug: string) {
  const data = await queryStrapi(`articles?filters[Slug][$eq]=${encodeURIComponent(slug)}&populate=*`);
  return Array.isArray(data) ? data[0] || null : null;
}
