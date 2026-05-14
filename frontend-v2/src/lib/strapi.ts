const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * 通用 Strapi 获取函数
 */
export async function queryStrapi(path: string) {
  const url = `${STRAPI_URL}/api/${path}`;
  const res = await fetch(url, {
    next: { revalidate: 60 }, // 默认 60 秒缓存
  });

  if (!res.ok) {
    console.error(`Fetch error: ${res.status} ${res.statusText} for ${url}`);
    return null;
  }

  const json = await res.json();
  return json.data;
}

/**
 * 转换媒体 URL (处理相对路径)
 */
export function getStrapiMedia(url: string | undefined) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("//")) {
    // 如果是 Strapi Cloud 的媒体域名，通过 Vercel Proxy 中转以加速
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
  return queryStrapi("works?populate=*&sort=Rank:desc");
}

/**
 * 获取精选作品 (IsFeatured = true)
 */
export async function getFeaturedWorks() {
  return queryStrapi("works?filters[IsFeatured][$eq]=true&populate=*&sort=Rank:desc");
}

/**
 * 获取所有手记，按发布时间降序排列
 */
export async function getArticles() {
  return queryStrapi("articles?populate=*&sort=publishedAt:desc");
}

/**
 * 根据 Slug 获取手记详情
 */
export async function getArticleBySlug(slug: string) {
  const data = await queryStrapi(`articles?filters[Slug][$eq]=${slug}&populate=*`);
  return data?.[0] || null;
}
