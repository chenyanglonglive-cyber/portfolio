"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Wrench, Award, Download, Rocket, Video, Zap, Cpu, Users, GraduationCap, FolderKanban, X } from "lucide-react";
import type { About } from "@/types/about";
import CustomBlocksRenderer from "@/components/CustomBlocksRenderer";

const SKILLS = [
  {
    name: "创意能力",
    icon: <Rocket size={20} />,
    desc: "游戏影视发烧友，深耕流行文化与亚文化，熟悉海内外多元影视、文学与网络梗生态；以跨文化洞察为创意源，擅长将用户共鸣点转化为适配不同市场的高吸引力素材，持续打造现象级创意内容。"
  },
  {
    name: "视频制作",
    icon: <Video size={20} />,
    desc: "动画专业背景，精通分镜、手绘、合成与剪辑；具备从脚本策划、镜头设计到后期包装的全链路制作能力，不仅仅是精通工具，更掌握信息流广告的剧情节奏。"
  },
  {
    name: "效率与管理",
    icon: <Users size={20} />,
    desc: "能针对岗位痛点和团队真实需求，自研工具与智能体打造自动化办公。搭建团队知识库管理散乱素材，为生成式 AI 和客服团队赋能。"
  },
  {
    name: "AI 工作流",
    icon: <Cpu size={20} />,
    desc: "深度钻研 AI 在视频领域的落地应用，自研 Gemini 智能体与多场景 AI 流水线；覆盖创意衍生、分镜生成、成片制作。构建可复用的 AI 提效体系。"
  }
];

const TOOLS = [
  {
    name: "Photoshop",
    icon: <img src="/icons/photoshop.webp" alt="Photoshop" className="w-full h-full object-contain rounded-md" />
  },
  {
    name: "After Effects",
    icon: <img src="/icons/after-effects.webp" alt="After Effects" className="w-full h-full object-contain rounded-md" />
  },
  {
    name: "Jianying",
    icon: <img src="/icons/jianying.webp" alt="Jianying" className="w-full h-full object-contain rounded-md" />
  },
  {
    name: "Maya",
    icon: <img src="/icons/maya.webp" alt="Maya" className="w-full h-full object-contain rounded-md" />
  },
  {
    name: "Spine",
    icon: <img src="/icons/spine.webp" alt="Spine" className="w-full h-full object-contain rounded-md" />
  },
  {
    name: "Claude Code",
    icon: <img src="/icons/claude.webp" alt="Claude Code" className="w-full h-full object-contain rounded-md" />
  },
  {
    name: "Codex",
    icon: <img src="/icons/codex.webp" alt="Codex" className="w-full h-full object-contain rounded-md" />
  },
  {
    name: "Chat GPT",
    icon: <img src="/icons/chatgpt.webp" alt="Chat GPT" className="w-full h-full object-contain rounded-md" />
  },
  {
    name: "Gemini",
    icon: <img src="/icons/gemini.webp" alt="Gemini" className="w-full h-full object-contain rounded-md" />
  },
  {
    name: "Seedance",
    icon: <img src="/icons/seedance.webp" alt="Seedance" className="w-full h-full object-contain rounded-md" />
  }
];

const PROJECTS = [
  {
    name: "雷霆战机",
    role: "AI发展负责人/核心创意/制作",
    desc: (
      <>
        主导<strong className="text-white font-bold">IP 情怀回归策略</strong>，产出双平台第1的爆款素材，单月单条消耗超 240 万，<strong className="text-white font-bold">个人素材总消耗破2千万</strong>；高量级投放下仍保持首日 ROI 20%、7 日回本，多次为团队指明素材发力方向，助力项目稳居微信小游戏畅销榜前列。
      </>
    )
  },
  {
    name: "Bingo Clash",
    role: "核心创意/制作",
    desc: (
      <>
        公司标杆级真金游戏，长期霸榜 iOS Casino TOP1-3，是营收超 10 亿美金的常青树产品。我主导打造的<strong className="text-white font-bold">刮刮卡创意素材持续跑量多年</strong>，单条爆款素材累计消耗超百万美金，个人年累计消耗超 4000 万美金，助力项目实现次留 70%、7 日留 50% 的高留存表现。
      </>
    )
  },
  {
    name: "Solitaire Clash",
    role: "核心创意/制作",
    desc: (
      <>
        公司核心双子星产品之一，稳居 iOS Casino TOP5。我贡献的 <strong className="text-white font-bold">“印钞机”“美金牌面”“收银机” 等爆款创意</strong>，单条素材累计消耗破百万美金，个人累计消耗超 3000 万美金，为项目提供了长期稳定的增量素材。
      </>
    )
  },
  {
    name: "Bingo Frenzy",
    role: "视频制作",
    desc: (
      <>
        公司超休闲赛道核心产品，月流水稳定 5000 万 +。我负责<strong className="text-white font-bold">全美术主题方向的创意输出</strong>，为项目提供了风格多元、适配不同市场的买量素材支撑。
      </>
    )
  }
];

const WORK_EXPERIENCES = [
  {
    period: "2023.09 - 至今",
    company: "北京爱乐游",
    role: "买量视频创意 / 制作 / AI 发展负责人",
    desc: "负责买量视频创意与制作，参与多款国内外核心项目，具备全流程项目操盘与团队 AI 赋能能力。主导公司 AI 发展，培训团队 AI 技能，设计新人培训流程，设计工程化管理报表。"
  },
  {
    period: "2021.12 - 2023.06",
    company: "北京欢忻网络科技有限公司",
    role: "视频创意设计师",
    desc: "负责玩法创意视频、真人脚本、可试玩广告以及原生创意视频脚本输出。负责多款核心项目的 Top 级爆款素材产出，精准把握副玩法方向与视频节奏，助力产品长期霸榜 iOS Casino 排行榜第 1-3 名。"
  },
  {
    period: "2020.03 - 2021.12",
    company: "北京乐城堡科技有限公司",
    role: "视频设计师",
    desc: "负责 Bingo Frenzy 广告投放视频素材的制作。所创造的创意方向为团队开辟了全新的主题突破点，并成功将创意主题反哺至产品设计中，获得优秀的回收表现。"
  },
  {
    period: "2017.05 - 2020.03",
    company: "浙文互联集团",
    role: "产品经理",
    desc: "负责奥迪内容工厂、奥迪全员营销及奥迪 DS-CRM 项目。\n1. 与奥迪市场部客户对接，深挖业务需求，制定针对性产品方案；\n2. 参与项目提案，协助客户完成立项与论证；\n3. 独立进行原型制作与 PRD 撰写，推进 UI 设计与项目进度管理，协调多方开发团队，组织测试并确保按时上线；\n4. 参与运营策略制定及运营数据分析，根据反馈持续迭代项目；\n5. 主导项目验收并撰写结案及验收报告，同时充当客户的产品顾问对其他业务线给出建议。"
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
                <p className="text-zinc-200 leading-relaxed max-w-2xl text-sm whitespace-pre-line">{exp.desc}</p>
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
