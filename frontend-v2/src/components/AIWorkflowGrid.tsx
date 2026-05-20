"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, BrainCircuit, ArrowUpRight } from "lucide-react";

export default function AIWorkflowGrid() {
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
      description: "集成6大核心创意管线。支持从参考视频提取首帧封面、AI分镜脚本生成、长攻略转录广告及Web动效物理高帧率录屏。",
      features: ["衍生创意视频", "分镜故事板", "长攻略转信息流", "动效物理渲染"]
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
      description: "依托 Hyper Farm 提效套件。实现素材智能重命名标签化分类归档、工作群日报生成及共享盘美术素材自动巡检。",
      features: ["智能自动重命名", "日报总结与发送", "资源更新自动巡检", "工作群一键推送"]
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
      description: "基于 Google NotebookLM 构建。涵盖海量美术资产语义检索引擎、买量多维 ROI 爆款反馈以及版本配置文件冲突校验。",
      features: ["美术资产语义检索", "高 ROI 剧本大纲", "版本配置逻辑冲突", "实时智能问答终端"]
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
            游戏广告创意生产的 AI 工业化整合，点击下方卡片即可跳转至对应的交互大屏 Tab。
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

                {/* Features list */}
                <div className="border-t border-white/5 pt-6 space-y-2">
                  <div className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase mb-3">Key Pipelines .核心管线</div>
                  <div className="grid grid-cols-2 gap-2">
                    {item.features.map((feat, fIdx) => (
                      <span key={fIdx} className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <a
                href={`/AI-Workflow/index.html?category=${item.category}`}
                className={`mt-8 w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-semibold text-zinc-300 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white ${item.textColor}`}
              >
                探索工作流大屏
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
