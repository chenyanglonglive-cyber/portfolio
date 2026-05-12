"use client";

import { motion } from "framer-motion";
import { Briefcase, Wrench, Award, Download, Rocket, Video, Zap, Cpu, Users, GraduationCap, FolderKanban } from "lucide-react";

const SKILLS = [
  { name: "创意能力", icon: <Rocket size={20} />, desc: "9年买量广告创意背景，擅长将 IP 沉淀与现代买量策略结合，创造行业标杆素材。" },
  { name: "视频制作", icon: <Video size={20} />, desc: "精通合成制作与剪辑，具备从脚本策划、视觉表现到后期包装的全链路能力。" },
  { name: "效率提升", icon: <Zap size={20} />, desc: "主导企业级 AI 工作流搭建，优化制作管线，显著提升团队生产与创意迭代效率。" },
  { name: "AI工作流", icon: <Cpu size={20} />, desc: "深度钻研 AI 在视频流中的落地应用，负责公司级 AI 提效体系的设计与全员赋能。" },
  { name: "团队管理", icon: <Users size={20} />, desc: "作为 AI 发展负责人，具备从项目操盘到跨部门团队管理的综合领导能力。" },
];

const TOOLS = ["Photoshop", "Premiere Pro", "After Effects", "Cinema 4D", "Midjourney", "Stable Diffusion"];

const PROJECTS = [
  {
    name: "《雷霆战机》10周年品牌焕新买量",
    role: "项目负责人 / 核心创意",
    desc: "主导“情怀向”策略，抖音消耗 510万+，单月最高 240万+。首日 ROI 20%，7天回本，产出十余条 10W+ 爆款素材。"
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

export default function ResumePage() {
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
        <motion.section variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 pr-4">
              Resume <span className="text-emerald-400 not-italic ml-2">.王晨阳</span>
            </h1>
            <p className="text-xl text-zinc-100 leading-relaxed max-w-2xl">
              <span className="text-white font-bold">资深广告创意设计师 / AI 工作流负责人</span>。
              9年深耕广告设计，以数据驱动创意，用 AI 重塑增长，专注百万级消耗高 ROI 爆款素材。
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold text-sm hover:bg-emerald-400 transition-colors shrink-0">
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
              <span key={i} className="px-6 py-3 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-300 font-mono text-sm group hover:border-emerald-400/30 hover:text-emerald-400 transition-all cursor-default">
                {tool}
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
    </main>
  );
}
