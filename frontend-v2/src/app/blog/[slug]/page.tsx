"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Calendar, User } from "lucide-react";

export default function ArticleDetail({ params }: { params: { slug: string } }) {
  // Mock fetching logic
  const article = {
    title: "如何通过 AI 工具流提升游戏广告产出效率？",
    date: "2026-05-10",
    category: "AI 数字化",
    content: `
      游戏广告行业正处于一个前所未有的变革期。随着 AI 技术的爆发，传统的制作流程正在被重塑。
      
      作为设计师，我们不再仅仅是“绘图员”，而是“创意导演”。在实际的项目中，我通过 Stable Diffusion 进行基础资产的快速生成，配合 ControlNet 实现精准的视觉控制，极大地缩短了从概念到成品的路径。
      
      本篇文章将深入探讨如何将 AI 深度整合进现有的广告制作管线...
    `
  };

  return (
    <main className="container mx-auto max-w-3xl px-8 py-20">
      <Link href="/blog" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 text-sm font-bold tracking-tighter">
        <ChevronLeft size={16} /> BACK TO LIST
      </Link>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <header className="space-y-6">
          <div className="flex items-center gap-6 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
             <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">{article.category}</span>
             <span className="flex items-center gap-1"><Calendar size={12} /> {article.date}</span>
             <span className="flex items-center gap-1"><User size={12} /> BY RICO</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            {article.title}
          </h1>
        </header>

        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-zinc-400 text-lg leading-relaxed whitespace-pre-wrap">
            {article.content}
          </p>
        </div>
      </motion.article>
    </main>
  );
}
