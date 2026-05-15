import { getArticles, getArticleBySlug, getStrapiMedia } from "@/lib/strapi";
import { ChevronLeft, Calendar, User, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CustomBlocksRenderer from "@/components/CustomBlocksRenderer";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import TableOfContents from "@/components/TableOfContents";

export async function generateStaticParams() {
  const articles = await getArticles();
  if (!articles) return [];

  return articles.map((article) => ({
    slug: article.Slug,
  }));
}

export default async function ArticleDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Calculate reading time for header
  const calculateReadingTime = (content: any) => {
    let text = "";
    if (typeof content === 'string') text = content;
    else if (Array.isArray(content)) {
      text = content.map((block: any) => 
        block.children?.map((child: any) => child.text).join('')
      ).join(' ');
    }
    return Math.ceil(text.split(/\s+/).length / 200);
  };

  const readingTime = calculateReadingTime(article.Content);

  return (
    <main className="relative">
      <ReadingProgressBar />
      
      <div className="container mx-auto max-w-3xl px-8 py-20">
        <Link href="/blog" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-16 text-xs font-bold tracking-widest uppercase group">
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> BACK TO INSIGHTS
        </Link>

        <article className="space-y-16">
          <header className="space-y-8">
            <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
               <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                 {article.Category || "Insights"}
               </span>
               <span className="flex items-center gap-1.5">
                 <Calendar size={12} /> {new Date(article.publishedAt).toLocaleDateString('zh-CN')}
               </span>
               <span className="flex items-center gap-1.5">
                 <Clock size={12} /> {readingTime} MIN READ
               </span>
               <span className="flex items-center gap-1.5"><User size={12} /> BY RICO</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              {article.Title}
            </h1>

            {article.CoverImage && (
              <div className="aspect-[21/9] w-full overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 shadow-2xl">
                <img 
                  src={getStrapiMedia(article.CoverImage.url)} 
                  alt={article.Title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </header>

          <div className="flex gap-12 relative">
            {/* Table of Contents */}
            <TableOfContents content={article.Content} />

            <div className="prose prose-invert prose-emerald max-w-none prose-lg md:prose-xl prose-headings:italic prose-headings:font-black prose-headings:tracking-tighter prose-p:text-zinc-400 prose-p:leading-relaxed prose-strong:text-white prose-blockquote:border-emerald-400 prose-blockquote:bg-emerald-400/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-code:text-emerald-300 flex-1">
              {Array.isArray(article.Content) ? (
                <CustomBlocksRenderer content={article.Content} />
              ) : (
                <div className="whitespace-pre-wrap text-zinc-400">{article.Content}</div>
              )}
            </div>
          </div>

          <footer className="pt-20 border-t border-white/5 mt-20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-2">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs">Enjoyed this?</h3>
                <p className="text-zinc-500 text-sm">Share your thoughts on social media or reach out via email.</p>
              </div>
              <Link href="/blog" className="flex items-center gap-2 text-white bg-white/5 hover:bg-emerald-400 hover:text-black px-6 py-3 rounded-full text-xs font-bold transition-all duration-300">
                EXPLORE MORE ARTICLES <ArrowRight size={14} />
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </main>
  );
}
