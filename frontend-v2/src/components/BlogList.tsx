"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Article } from "@/types/article";
import { Calendar, ArrowRight, Clock, Tag } from "lucide-react";
import { useState, useMemo } from "react";
import { getStrapiMedia } from "@/lib/strapi";

interface BlogListProps {
  articles: Article[];
}

export default function BlogList({ articles }: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const cats = ["All", ...new Set(articles.map(a => a.Category).filter(Boolean) as string[])];
    return cats;
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return selectedCategory === "All" 
      ? articles 
      : articles.filter(a => a.Category === selectedCategory);
  }, [articles, selectedCategory]);

  const featuredArticle = useMemo(() => {
    return articles.find(a => a.IsFeatured) || articles[0];
  }, [articles]);

  const calculateReadingTime = (content: any) => {
    let text = "";
    if (typeof content === 'string') {
      text = content;
    } else if (Array.isArray(content)) {
      text = content.map((block: any) => 
        block.children?.map((child: any) => child.text).join('')
      ).join(' ');
    }
    const wordsPerMinute = 200;
    const noOfWords = text.split(/\s+/).length;
    const minutes = Math.ceil(noOfWords / wordsPerMinute);
    return minutes;
  };

  return (
    <div className="space-y-16">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
              selectedCategory === cat 
                ? "bg-emerald-400 text-black shadow-[0_0_15px_rgba(52,211,153,0.3)]" 
                : "bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        <AnimatePresence mode="popLayout">
          {filteredArticles.map((article, i) => {
            const isFeatured = article.documentId === featuredArticle?.documentId && selectedCategory === "All";
            const readingTime = calculateReadingTime(article.Content);

            return (
              <motion.article
                key={article.documentId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`group relative ${isFeatured ? "pb-12 border-b border-white/10" : ""}`}
              >
                <Link href={`/blog/${article.Slug}`} className="block space-y-6">
                  {isFeatured && article.CoverImage && (
                    <div className="aspect-[21/9] w-full overflow-hidden rounded-2xl mb-8 bg-zinc-900 border border-white/5">
                      <img 
                        src={getStrapiMedia(article.CoverImage.url)} 
                        alt={article.Title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase">
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <Tag size={10} /> {article.Category || "INSIGHTS"}
                      </span>
                      <span className="text-zinc-600 flex items-center gap-1.5">
                        <Calendar size={10} /> {new Date(article.publishedAt).toLocaleDateString('zh-CN')}
                      </span>
                      <span className="text-zinc-600 flex items-center gap-1.5">
                        <Clock size={10} /> {readingTime} MIN READ
                      </span>
                    </div>
                    
                    <h2 className={`${isFeatured ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"} font-bold text-white group-hover:text-emerald-400 transition-colors duration-300 leading-tight`}>
                      {article.Title}
                    </h2>
                    
                    <p className="text-zinc-500 line-clamp-2 leading-relaxed text-base md:text-lg max-w-3xl">
                      {(() => {
                        if (typeof article.Content === 'string') {
                          return article.Content.replace(/[#*`]/g, '').substring(0, 160);
                        } else if (Array.isArray(article.Content)) {
                          return article.Content
                            .map((block: any) => 
                              block.children?.map((child: any) => child.text).join('')
                            )
                            .join(' ')
                            .substring(0, 160);
                        }
                        return "点击阅读更多内容...";
                      })()}...
                    </p>

                    <div className="flex items-center gap-2 text-emerald-400/50 group-hover:text-emerald-400 text-xs font-bold transition-colors">
                      READ FULL ARTICLE <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
                
                {!isFeatured && (
                  <div className="absolute -bottom-6 left-0 right-0 h-px bg-white/5 group-hover:bg-emerald-400/20 transition-colors" />
                )}
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
      
      {filteredArticles.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-zinc-600 italic">No articles found in this category.</p>
        </div>
      )}
    </div>
  );
}
