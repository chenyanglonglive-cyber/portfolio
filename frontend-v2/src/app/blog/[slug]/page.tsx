import { getArticles, getArticleBySlug } from "@/lib/strapi";
import { ChevronLeft, Calendar, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlocksRenderer } from '@strapi/blocks-react-renderer';

export const dynamicParams = false;

export async function generateStaticParams() {
  console.log("Generating static params for blog...");
  const articles = await getArticles();
  if (!articles) {
    console.log("No articles found for static params");
    return [];
  }
  
  const params = articles.map((article: any) => ({
    slug: article.Slug,
  }));
  console.log("Static params:", params);
  return params;
}

export default async function ArticleDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="container mx-auto max-w-3xl px-8 py-20">
      <Link href="/blog" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 text-sm font-bold tracking-tighter">
        <ChevronLeft size={16} /> BACK TO LIST
      </Link>

      <article className="space-y-12">
        <header className="space-y-6">
          <div className="flex items-center gap-6 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
             <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
               {article.Category || "Insights"}
             </span>
             <span className="flex items-center gap-1">
               <Calendar size={12} /> {new Date(article.publishedAt).toLocaleDateString('zh-CN')}
             </span>
             <span className="flex items-center gap-1"><User size={12} /> BY RICO</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            {article.Title}
          </h1>
        </header>

        <div className="prose prose-invert prose-emerald max-w-none">
          <div className="text-zinc-400 text-lg leading-relaxed">
            {Array.isArray(article.Content) ? (
              <BlocksRenderer content={article.Content} />
            ) : (
              <div className="whitespace-pre-wrap">{article.Content}</div>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}
