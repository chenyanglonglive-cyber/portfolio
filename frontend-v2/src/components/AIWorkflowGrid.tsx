"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, BrainCircuit, ArrowUpRight } from "lucide-react";
export default function AIWorkflowGrid() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'close-workflow') {
        setActiveCategory(null);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (activeCategory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeCategory]);

  const workflows = [
    {
      title: "AI 创意生成",
      englishTitle: "AI GENERATION",
      category: "creative",
      icon: Sparkles,
      color: "from-purple-500/10 to-blue-500/5 hover:border-purple-500/30",
      glowColor: "rgba(168, 85, 247, 0.25)",
      badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      textColor: "hover:text-purple-400",
      iconColor: "text-purple-400",
      description: "使用生成类AI 实现玩法类素材，角色剧情类素材快速复刻，攻略活动类，口播解说类批量生产，使用SKILLS 生产演示动画。"
    },
    {
      title: "AI 自动化提效",
      englishTitle: "AI EFFICIENCY",
      category: "efficiency",
      icon: Zap,
      color: "from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/30",
      glowColor: "rgba(16, 185, 129, 0.25)",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      textColor: "hover:text-emerald-400",
      iconColor: "text-emerald-400",
      description: "基于视频设计师岗位的真实痛点，我用 AI Agent 打造了一套从素材管理、办公流程到资源巡检的全链路自动化工具，把重复低效的工作彻底交给 AI 处理，实现团队效率的系统性提升。"
    },
    {
      title: "AI 知识库构建",
      englishTitle: "AI KNOWLEDGE BASE",
      category: "knowledge",
      icon: BrainCircuit,
      color: "from-amber-500/10 to-orange-500/5 hover:border-amber-500/30",
      glowColor: "rgba(245, 158, 11, 0.25)",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      textColor: "hover:text-amber-400",
      iconColor: "text-amber-400",
      description: "基于 Google NotebookLM 构建。涵盖海量美术资产语义检索引擎、买量多维 ROI 爆款反馈以及版本配置文件冲突校验。"
    }
  ];

  return (
    <section className="mb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
            <Sparkles size={24} className="text-emerald-400" /> AI WORKFLOWS <span className="text-zinc-400 ml-2 font-light">.工作流</span>
          </h2>
          <p className="text-zinc-400 text-sm mt-2 max-w-xl">
            游戏广告创意生产的 AI 工业化整合，点击下方按钮即可开启对应的交互工作流弹窗。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {workflows.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`group relative bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${item.color}`}
              style={{
                boxShadow: `0 4px 30px rgba(0, 0, 0, 0.2)`
              }}
            >
              {/* Background glow on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none filter blur-2xl"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${item.glowColor} 0%, transparent 60%)`
                }}
              />

              <div className="space-y-6 relative z-10">
                {/* Header: Icon & Badge */}
                <div className="flex items-center justify-between">
                  <div className={`p-3 bg-white/5 rounded-2xl border border-white/10 ${item.iconColor}`}>
                    <Icon size={24} />
                  </div>
                  <span className={`text-[10px] font-mono font-bold tracking-widest px-3 py-1 rounded-full border ${item.badgeColor}`}>
                    {item.englishTitle}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2 group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-6 group-hover:text-zinc-300 transition-colors">
                    {item.description}
                  </p>
                </div>

              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setActiveCategory(item.category)}
                className={`mt-8 w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-semibold text-zinc-300 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:text-white cursor-pointer ${item.textColor}`}
              >
                探索工作流
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Flowchart Modal */}
      <AnimatePresence>
        {activeCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <iframe
              src={`/AI-Workflow/index.html?category=${activeCategory}`}
              className="w-full h-full border-none bg-transparent"
              title="AI Workflow"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
