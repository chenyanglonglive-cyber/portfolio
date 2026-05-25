"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Wrench, Award, Download, Rocket, Video, Zap, Cpu, Users, GraduationCap, FolderKanban, X } from "lucide-react";
import type { About } from "@/types/about";
import CustomBlocksRenderer from "@/components/CustomBlocksRenderer";

const SKILLS = [
  { name: "创意能力", icon: <Rocket size={20} />, desc: "9年买量广告创意背景，擅长将 IP 沉淀与现代买量策略结合，创造行业标杆素材。" },
  { name: "视频制作", icon: <Video size={20} />, desc: "精通合成制作与剪辑，具备从脚本策划、视觉表现到后期包装的全链路能力。" },
  { name: "效率提升", icon: <Zap size={20} />, desc: "主导企业级 AI 工作流搭建，优化制作管线，显著提升团队生产与创意迭代效率。" },
  { name: "AI工作流", icon: <Cpu size={20} />, desc: "深度钻研 AI 在视频流中的落地应用，负责公司级 AI 提效体系的设计与全员赋能。" },
  { name: "团队管理", icon: <Users size={20} />, desc: "作为 AI 发展负责人，具备从项目操盘到跨部门团队管理的综合领导能力。" },
];

const TOOLS = [
  {
    name: "Photoshop",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="24" height="24" rx="4" fill="#001C3A" stroke="#00C8FF" strokeWidth="1.5" />
        <path d="M7.5 16V8.5H10.5C11.5 8.5 12.2 9 12.2 10.2C12.2 11.4 11.5 11.9 10.5 11.9H9V16H7.5ZM9 10.7H10.4C10.9 10.7 11.1 10.6 11.1 10.2C11.1 9.8 10.9 9.7 10.4 9.7H9V10.7Z" fill="#00C8FF" />
        <path d="M13.2 14.5C13.2 13.5 14 13.1 15.2 12.9C16.2 12.7 16.5 12.5 16.5 12.1C16.5 11.6 16.1 11.4 15.3 11.4C14.5 11.4 14 11.7 13.8 12.1H13.1C13.3 11.2 14.2 10.7 15.4 10.7C16.6 10.7 17.3 11.2 17.3 12.1V16H16.6V15.1C16.3 15.7 15.5 16.2 14.5 16.2C13.7 16.2 13.2 15.4 13.2 14.5ZM16.6 13.7V13.4C16 13.6 15.3 13.8 14.7 14C14.2 14.2 13.9 14.4 13.9 14.7C13.9 15.1 14.2 15.3 14.7 15.3C15.7 15.3 16.6 14.6 16.6 13.7Z" fill="#00C8FF" />
      </svg>
    )
  },
  {
    name: "After Effects",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="24" height="24" rx="4" fill="#1C0A35" stroke="#D199FF" strokeWidth="1.5" />
        <path d="M8.2 16L7.2 13.5H9.8L8.8 16H8.2ZM7.5 12.7L8.5 10L9.5 12.7H7.5Z" fill="#D199FF" />
        <path d="M12.2 13.5C12.2 11.8 13.3 10.7 15 10.7C16.7 10.7 17.8 11.8 17.8 13.5V13.9H13.2C13.3 15.1 14.1 15.7 15.1 15.7C15.8 15.7 16.4 15.4 16.7 15H17.4C17.1 15.7 16.2 16.2 15.1 16.2C13.3 16.2 12.2 15.2 12.2 13.5ZM16.8 13.1C16.8 12.1 16.1 11.5 15.1 11.5C14.1 11.5 13.4 12.1 13.3 13.1H16.8Z" fill="#D199FF" />
      </svg>
    )
  },
  {
    name: "Jianying",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#capcut-bg-grad)"/>
        <path d="M7 11C7 8.79086 8.79086 7 11 7H13V9H11C9.89543 9 9 9.89543 9 11V13H7V11Z" fill="#FFFFFF"/>
        <path d="M17 13C17 15.2091 15.2091 17 13 17H11V15H13C14.1046 15 15 14.1046 15 13V11H17V13Z" fill="#FFFFFF"/>
        <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" fill="#FFFFFF" transform="rotate(45 12 12)"/>
        <defs>
          <linearGradient id="capcut-bg-grad" x1="2" y1="2" x2="22" y2="22">
            <stop offset="0%" stop-color="#00F2FE"/>
            <stop offset="100%" stop-color="#FF2E93"/>
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    name: "Maya",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="24" height="24" rx="4" fill="#00181A" stroke="#33E6E6" strokeWidth="1.5" />
        <path d="M6 17V7.5L12 12.5L18 7.5V17" stroke="#33E6E6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12.5V17" stroke="#33E6E6" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    name: "Spine",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="24" height="24" rx="4" fill="#141414" stroke="#FF5300" strokeWidth="1.5" />
        <path d="M7 17C8.5 17 9 15.5 9 14.5C9 13 8 12.5 8 11.5C8 10 10.5 8.5 12 7C13.5 8.5 16 10 16 11.5C16 12.5 15 13 15 14.5C15 15.5 15.5 17 17 17" stroke="#FF5300" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="6" r="1.5" fill="#FF5300" />
      </svg>
    )
  },
  {
    name: "Claude Code",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="24" height="24" rx="4" fill="#1B120C" stroke="#D97706" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="6" stroke="#D97706" strokeWidth="1.5" />
        <path d="M12 8.5V15.5M8.5 12H15.5M9.5 9.5L14.5 14.5M9.5 14.5L14.5 9.5" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    name: "Codex",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="24" height="24" rx="4" fill="#0A0F1A" stroke="#5A9EFC" strokeWidth="1.5" />
        <path d="M8 9L5 12L8 15" stroke="#5A9EFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 9L19 12L16 15" stroke="#5A9EFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.5 7L10.5 17" stroke="#5A9EFC" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    name: "Chat GPT",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="24" height="24" rx="4" fill="#0E1E1C" stroke="#10A37F" strokeWidth="1.5" />
        <g transform="translate(2, 2)">
          <path d="M11.248 18.25q-.825 0-1.568-.314a4.3 4.3 0 0 1-1.32-.874 4 4 0 0 1-1.304.214 4 4 0 0 1-2.046-.544 4.27 4.27 0 0 1-1.518-1.485 4 4 0 0 1-.56-2.095q0-.48.131-1.04A4.4 4.4 0 0 1 2.04 10.71a4.07 4.07 0 0 1 .017-3.4 4.2 4.2 0 0 1 1.056-1.418 3.8 3.8 0 0 1 1.6-.842 3.9 3.9 0 0 1 .76-1.683q.593-.759 1.451-1.188a4.04 4.04 0 0 1 1.832-.429q.825 0 1.567.313.742.314 1.32.875a4 4 0 0 1 1.304-.215q1.106 0 2.046.545a4.14 4.14 0 0 1 1.501 1.485q.578.941.578 2.095 0 .48-.132 1.04.66.61 1.023 1.419.363.792.363 1.666 0 .892-.38 1.717a4.3 4.3 0 0 1-1.072 1.435 3.8 3.8 0 0 1-1.584.825 3.8 3.8 0 0 1-.775 1.683 4.06 4.06 0 0 1-1.436 1.188 4.04 4.04 0 0 1-1.832.429m-4.076-2.062q.825 0 1.435-.347l3.103-1.782a.36.36 0 0 0 .164-.313v-1.42L7.881 14.62a.67.67 0 0 1-.726 0l-3.118-1.798a.5.5 0 0 1-.017.115v.198q0 .841.396 1.551.413.693 1.139 1.089a3.2 3.2 0 0 0 1.617.412m.165-2.69a.4.4 0 0 0 .181.05q.083 0 .165-.05l1.238-.71-3.977-2.31a.7.7 0 0 1-.363-.643v-3.58q-.825.362-1.32 1.122a2.9 2.9 0 0 0-.495 1.65q0 .809.413 1.55.412.743 1.072 1.123zm3.91 3.663q.875 0 1.585-.396a2.96 2.96 0 0 0 1.534-2.64v-3.564a.32.32 0 0 0-.165-.297l-1.254-.726v4.604a.7.7 0 0 1-.363.643l-3.119 1.799a3 3 0 0 0 1.783.577m.627-6.039V8.878L10.01 7.822 8.129 8.878v2.244l1.881 1.056zM7.057 5.859a.7.7 0 0 1 .363-.644l3.119-1.798a3 3 0 0 0-1.782-.578q-.874 0-1.584.396A2.96 2.96 0 0 0 6.05 4.324a3.07 3.07 0 0 0-.396 1.551v3.547q0 .199.165.314l1.237.726zm8.383 7.887q.825-.364 1.303-1.123.495-.758.495-1.65a3.15 3.15 0 0 0-.412-1.55q-.413-.743-1.073-1.123l-3.086-1.782q-.099-.065-.181-.049a.3.3 0 0 0-.165.05l-1.238.692 3.993 2.327a.6.6 0 0 1 .264.264.64.64 0 0 1 .1.363zm-3.317-8.382a.63.63 0 0 1 .726 0l3.135 1.831v-.297q0-.792-.396-1.501a2.86 2.86 0 0 0-1.105-1.155q-.71-.43-1.65-.43-.825 0-1.436.347L8.294 5.941a.36.36 0 0 0-.165.314v1.418z" fill="#10A37F"/>
        </g>
      </svg>
    )
  },
  {
    name: "Gemini",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M12 2C12 2 12.5 7.5 14 9C15.5 10.5 21 11 21 11C21 11 15.5 11.5 14 13C12.5 14.5 12 20 12 20C12 20 11.5 14.5 10 13C8.5 11.5 3 11 3 11C3 11 8.5 10.5 10 9C11.5 7.5 12 2 12 2Z" fill="url(#gem_grad_tools)"/>
        <defs>
          <linearGradient id="gem_grad_tools" x1="3" y1="2" x2="21" y2="20">
            <stop offset="0%" stop-color="#9B59B6"/>
            <stop offset="50%" stop-color="#4285F4"/>
            <stop offset="100%" stop-color="#00F2FE"/>
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    name: "Seedance",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="24" height="24" rx="4" fill="url(#seedance-grad)" />
        <path d="M12 5C10.5 8 7 9.5 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.5 13.5 8 12 5Z" fill="#FFFFFF" />
        <path d="M11 10.5L14.5 12L11 13.5V10.5Z" fill="#8E2DE2" />
        <defs>
          <linearGradient id="seedance-grad" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stop-color="#8E2DE2"/>
            <stop offset="100%" stop-color="#4A00E0"/>
          </linearGradient>
        </defs>
      </svg>
    )
  }
];

const PROJECTS = [
  {
    name: "《雷霆战机》10周年品牌焕新买量",
    role: "项目负责人 / 核心创意",
    desc: "主导「情怀向」策略，抖音消耗 510万+，单月最高 240万+。首日 ROI 20%，7天回本，产出十余条 10W+ 爆款素材。"
  },
  {
    name: "公司级 AI 提效体系搭建",
    role: "AI 发展负责人",
    desc: "设计视频制作全流程 AI 工作流并输出培训文档。推动 AI 在创意、美术及后期环节落地，大幅提升团队生产力。"
  },
  {
    name: "海外益智问答系列 (Trivia Bible)",
    role: "独立设计师",
    desc: "独立负责北美及巴西市场美术与广告制作，通过 MJ 生成高质量资产，月收入达 3万美元。"
  },
  {
    name: "微信小游戏《无敌冲冲冲》",
    role: "核心动画 / 买量管理",
    desc: "负责角色技能动画与公共素材输出，管理买量广告制作，协助实现 50万级规模的日消耗覆盖。"
  }
];

const WORK_EXPERIENCES = [
  {
    period: "2023.09 - 2026.06",
    company: "北京爱乐游",
    role: "买量视频创意 / AI 发展负责人",
    desc: "负责买量视频创意与制作，主导公司 AI 发展。参与多款国内外核心项目，具备全流程项目操盘与团队 AI 赋能能力。"
  },
  {
    period: "2021.07 - 2023.05",
    company: "某知名买量代理公司",
    role: "广告视频设计师",
    desc: "负责快手、抖音、广点通多平台信息流视频制作。单条素材创造 300万+ 利润，连获季度最佳项目奖。"
  }
];

const EDUCATION = [
  {
    school: "成都大学",
    degree: "动画 · 本科",
    period: "2011.09 - 2015.06",
    honor: "2次三好学生"
  }
];

interface ResumeContentProps {
  about: About | null;
}

export default function ResumeContent({ about }: ResumeContentProps) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [identity, setIdentity] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <main className="container mx-auto max-w-4xl px-8 py-20 pb-40">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-32"
      >
        {/* Header Section */}
        <motion.section variants={itemVariants} className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 pr-4">
              Resume <span className="text-emerald-400 ml-2">.王晨阳</span>
            </h1>
            <div className="text-xl text-zinc-100 leading-relaxed">
              {about?.content ? (
                <CustomBlocksRenderer content={about.content} />
              ) : (
                <p><span className="text-white font-bold">资深广告创意设计师 / AI 工作流负责人</span>。9年深耕广告设计，以数据驱动创意，用 AI 重塑增长，专注百万级消耗高 ROI 爆款素材。</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold text-sm hover:bg-emerald-400 transition-colors"
          >
            <Download size={18} /> 下载简历
          </button>
        </motion.section>

        {/* Skills Section */}
        <motion.section variants={itemVariants} className="space-y-12">
          <h2 className="text-2xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 pb-1">
            <Award className="text-emerald-400 shrink-0" size={24} /> 技能展示
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SKILLS.map((skill, i) => (
              <div key={i} className="glass p-8 rounded-3xl border border-white/5 space-y-4 hover:border-emerald-400/20 transition-colors">
                <div className="p-3 bg-emerald-400/10 text-emerald-400 w-fit rounded-2xl">
                  {skill.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{skill.name}</h3>
                <p className="text-zinc-300 text-sm leading-relaxed">{skill.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Tools Section */}
        <motion.section variants={itemVariants} className="space-y-12">
          <h2 className="text-2xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 pb-1">
            <Wrench className="text-emerald-400 shrink-0" size={24} /> 工具展示
          </h2>
          <div className="flex flex-wrap gap-4">
            {TOOLS.map((tool, i) => (
              <span key={i} className="flex items-center gap-2.5 px-5 py-3 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-300 font-mono text-sm group hover:border-emerald-400/30 hover:text-emerald-400 transition-all cursor-default">
                <span className="w-5 h-5 flex items-center justify-center shrink-0">
                  {tool.icon}
                </span>
                {tool.name}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Project Section */}
        <motion.section variants={itemVariants} className="space-y-12">
          <h2 className="text-2xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 pb-1">
            <FolderKanban className="text-emerald-400 shrink-0" size={24} /> 核心专项项目
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PROJECTS.map((project, i) => (
              <div key={i} className="glass p-8 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-xl font-bold text-white">{project.name}</h3>
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">{project.role}</p>
                <p className="text-zinc-200 text-sm leading-relaxed">{project.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Work Experience Section (Timeline) */}
        <motion.section variants={itemVariants} className="space-y-12">
          <h2 className="text-2xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 pb-1">
            <Briefcase className="text-emerald-400 shrink-0" size={24} /> 工作经历
          </h2>
          <div className="space-y-16">
            {WORK_EXPERIENCES.map((exp, i) => (
              <div key={i} className="relative pl-8 border-l border-white/5 space-y-4">
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{exp.period}</span>
                <div>
                  <h3 className="text-xl font-bold text-white">{exp.company}</h3>
                  <p className="text-emerald-400/80 font-medium text-sm">{exp.role}</p>
                </div>
                <p className="text-zinc-200 leading-relaxed max-w-2xl text-sm">{exp.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Education Section */}
        <motion.section variants={itemVariants} className="space-y-12">
          <h2 className="text-2xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 pb-1">
            <GraduationCap className="text-emerald-400 shrink-0" size={24} /> 教育经历
          </h2>
          <div className="space-y-8">
            {EDUCATION.map((edu, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{edu.school}</h3>
                  <div className="flex gap-2 text-zinc-400 text-sm">
                    <span>{edu.degree}</span>
                    <span>·</span>
                    <span className="text-emerald-400/60">{edu.honor}</span>
                  </div>
                </div>
                <span className="text-sm font-mono text-zinc-500">{edu.period}</span>
              </div>
            ))}
          </div>
        </motion.section>
      </motion.div>

      {/* Download Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <button
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => {
                setShowModal(false);
                setSubmitted(false);
              }}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative glass border border-white/10 rounded-3xl p-8 md:p-10 w-full max-w-md space-y-6"
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setShowModal(false);
                  setSubmitted(false);
                }}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {submitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-400/20 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">发送成功</h3>
                  <p className="text-zinc-400 text-sm">简历将会发送到你的邮箱，请留意查收。</p>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-xl font-bold text-white">获取简历</h3>
                    <p className="text-zinc-400 text-sm mt-1">请填写以下信息，简历将会发送到你的邮箱。</p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!email.trim() || !identity.trim()) return;
                      setSubmitted(true);
                    }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">邮箱地址</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="请输入你的邮箱"
                        required
                        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400/50 transition-colors"
                      />
                      <p className="text-xs text-zinc-500">简历将会发送到你的邮箱</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">你的身份</label>
                      <input
                        type="text"
                        value={identity}
                        onChange={(e) => setIdentity(e.target.value)}
                        placeholder="请说明您的身份"
                        required
                        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400/50 transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors text-sm"
                    >
                      发送简历
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
