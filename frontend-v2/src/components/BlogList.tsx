"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Article } from "@/types/article";
import { Calendar, ArrowRight } from "lucide-react";

interface BlogListProps {
  articles: Article[];
}

export default function BlogList({ articles }: BlogListProps) {
  return (
    <div className="space-y-12">
      {articles.map((article, i) => (
        <motion.article
          key={article.documentId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="group relative"
        >
          <Link href={`/blog/${article.Slug}`} className="block space-y-4">
            <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase">
              <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                {article.Category}
              </span>
              <span className="text-zinc-600 flex items-center gap-1">
                <Calendar size={12} /> {new Date(article.publishedAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-300 leading-tight">
              {article.Title}
            </h2>
            
            <p className="text-zinc-500 line-clamp-2 leading-relaxed">
              {(() => {
                if (typeof article.Content === 'string') {
                  return article.Content.replace(/[#*`]/g, '').substring(0, 150);
                } else if (Array.isArray(article.Content)) {
                  // 从 Strapi Blocks 结构中提取文本
                  return article.Content
                    .map((block: any) => 
                      block.children?.map((child: any) => child.text).join('')
                    )
                    .join(' ')
                    .substring(0, 150);
                }
                return "点击阅读更多内容...";
              })()}
            </p>

            <div className="flex items-center gap-2 text-zinc-400 group-hover:text-white text-xs font-bold transition-colors">
              READ MORE <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          
          {/* Divider */}
          <div className="absolute -bottom-6 left-0 right-0 h-px bg-white/5 group-hover:bg-emerald-400/20 transition-colors" />
        </motion.article>
      ))}
    </div>
  );
}
