import BlogList from "@/components/BlogList";
import { getArticles } from "@/lib/strapi";
import { Article } from "@/types/article";

export default async function BlogPage() {
  const articles: Article[] = await getArticles() || [];

  return (
    <main className="container mx-auto max-w-4xl px-8 py-20">
      <div className="mb-20 space-y-4">
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
          Insights <span className="text-emerald-400 not-italic ml-2">.手记</span>
        </h1>
        <p className="text-zinc-500 text-lg max-w-2xl">
          分享关于游戏广告创意、AI 提效管线以及投放数据背后的设计思考。
        </p>
      </div>

      <BlogList articles={articles} />
    </main>
  );
}
