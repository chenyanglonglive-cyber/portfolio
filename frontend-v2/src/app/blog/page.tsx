"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Article } from "@/types/article";
import { Calendar, ArrowRight } from "lucide-react";

const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    documentId: "a1",
    Title: "如何通过 AI 工具流提升游戏广告产出效率？",
    Content: "探讨 Midjourney 与 Stable Diffusion 在买量素材中的落地应用...",
    Slug: "ai-workflow-advertising",
    Category: "AI 数字化",
    publishedAt: "2026-05-10"
  },
  {
    id: 2,
    documentId: "a2",
    Title: "SLG 游戏投放：510万消耗背后的创意策略复盘",
    Content: "复盘《雷霆战机》十周年大促素材，解析高 ROI 的视觉逻辑...",
    Slug: "slg-advertising-case-study",
    Category: "案例复盘",
    publishedAt: "2026-04-25"
  },
  {
    id: 3,
    documentId: "a3",
    Title: "30秒内捕捉用户：短视频广告的黄金剪辑法则",
    Content: "前 3 秒定生死，如何通过节奏控制与视觉冲击力留住玩家...",
    Slug: "short-video-editing-rules",
    Category: "创意方法论",
    publishedAt: "2026-03-15"
  }
];

export default function BlogPage() {
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

      <div className="space-y-12">
        {MOCK_ARTICLES.map((article, i) => (
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
                  <Calendar size={12} /> {article.publishedAt}
                </span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-300 leading-tight">
                {article.Title}
              </h2>
              
              <p className="text-zinc-500 line-clamp-2 leading-relaxed">
                {article.Content}
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
    </main>
  );
}
