"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Image as ImageIcon } from "lucide-react";
import WorkCard from "@/components/WorkCard";
import WorkModal from "@/components/WorkModal";
import { Work } from "@/types/work";

// Mock data for featured sections
const FEATURED_VIDEOS: Work[] = [
  {
    id: 1, documentId: 'fv1', Title: '大厂 SLG 投放视频 A', Type: 'video', 
    Cover: { url: 'https://picsum.photos/seed/v1/800/450' }, 
    VideoURL: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    Spend: 50000, ROI_7D: 2.8, CTR: 4.2, IsFeatured: true, Rank: 90,
    LaunchDate: "2024.11",
    Story: "该项目核心是通过电影感的剪辑手法，在开篇 3 秒展示宏大战场。通过 3D 角色建模的精细展示，成功吸引了高价值玩家群体。"
  },
  {
    id: 2, documentId: 'fv2', Title: '二次元手游 PV 混剪', Type: 'video', 
    Cover: { url: 'https://picsum.photos/seed/v2/800/450' }, 
    VideoURL: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    Spend: 15000, ROI_7D: 1.9, CTR: 3.5, IsFeatured: true, Rank: 85,
    LaunchDate: "2024.10",
    Story: "利用 AI 绘画技术辅助生成背景资产，配合粒子特效强化战斗打击感。重点优化了 2D 角色的动态表现。"
  },
  {
    id: 3, documentId: 'fv3', Title: '某知名 MMO 品牌宣传', Type: 'video', 
    Cover: { url: 'https://picsum.photos/seed/v3/800/450' }, 
    VideoURL: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    Spend: 120000, ROI_7D: 3.5, CTR: 5.1, IsFeatured: true, Rank: 95,
    LaunchDate: "2024.09",
    Story: "品牌向的大片制作，全景展示了游戏宏大的世界观。通过高标准的渲染质量，建立了深度的品牌认知。"
  },
  {
    id: 4, documentId: 'fv4', Title: '悬疑类解密游戏投放', Type: 'video', 
    Cover: { url: 'https://picsum.photos/seed/v4/800/450' }, 
    VideoURL: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    Spend: 8000, ROI_7D: 0.95, CTR: 1.8, IsFeatured: true, Rank: 70,
    LaunchDate: "2024.08",
    Story: "主打悬疑氛围感，利用第一人称视角增强代入感。在前 5 秒植入核心谜题，诱导用户产生下载欲望。"
  },
  {
    id: 41, documentId: 'fv5', Title: '赛车竞速类大促视频', Type: 'video', 
    Cover: { url: 'https://picsum.photos/seed/v5/800/450' }, 
    VideoURL: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    Spend: 45000, ROI_7D: 2.1, CTR: 4.8, IsFeatured: true, Rank: 88,
    LaunchDate: "2024.07",
    Story: "强调速度与激情的碰撞。通过动态模糊与多机位剪辑，完美还原了赛车漂移的快感，点击率远超行业平均值。"
  },
  {
    id: 42, documentId: 'fv6', Title: '模拟经营类开屏广告', Type: 'video', 
    Cover: { url: 'https://picsum.photos/seed/v6/800/450' }, 
    VideoURL: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    Spend: 32000, ROI_7D: 1.7, CTR: 3.2, IsFeatured: true, Rank: 75,
    LaunchDate: "2024.06",
    Story: "利用高饱和度的色彩与Q版角色，营造轻松愉快的游戏氛围。重点展示了建设与收获的成就感。"
  },
];

const FEATURED_IMAGES: Work[] = [
  {
    id: 5, documentId: 'fi1', Title: '全球发型 KV 视觉', Type: 'image', 
    Cover: { url: 'https://picsum.photos/seed/i1/800/450' }, 
    Spend: 5000, ROI_7D: 1.2, CTR: 1.5, IsFeatured: true, Rank: 60,
    LaunchDate: "2024.12",
    Story: "高精细度的商业修图案例。通过对光影的极精细控制，突出了材质的质感与角色的时尚感。"
  },
  {
    id: 6, documentId: 'fi2', Title: '社交推广角色插画', Type: 'image', 
    Cover: { url: 'https://picsum.photos/seed/i2/800/450' }, 
    Spend: 3000, ROI_7D: 2.1, CTR: 2.8, IsFeatured: true, Rank: 65,
    LaunchDate: "2024.11",
    Story: "为社交媒体传播设计的角色立绘。风格明快，适合多场景分发。"
  },
  {
    id: 7, documentId: 'fi3', Title: '应用内福利活动图', Type: 'image', 
    Cover: { url: 'https://picsum.photos/seed/i3/800/450' }, 
    Spend: 1500, ROI_7D: 1.5, CTR: 1.2, IsFeatured: true, Rank: 55,
    LaunchDate: "2024.10",
    Story: "运营活动配图，强调福利感与点击冲动。采用了鲜艳的红金色调。"
  },
  {
    id: 8, documentId: 'fi4', Title: 'Facebook 投放多图流', Type: 'image', 
    Cover: { url: 'https://picsum.photos/seed/i4/800/450' }, 
    Spend: 4500, ROI_7D: 1.1, CTR: 0.9, IsFeatured: true, Rank: 50,
    LaunchDate: "2024.09",
    Story: "Facebook 广告组序列图片，展示了游戏的多种核心玩法。"
  },
  {
    id: 81, documentId: 'fi5', Title: 'TikTok 竖屏活动海报', Type: 'image', 
    Cover: { url: 'https://picsum.photos/seed/i5/800/450' }, 
    Spend: 2200, ROI_7D: 1.8, CTR: 2.4, IsFeatured: true, Rank: 58,
    LaunchDate: "2024.08",
    Story: "竖屏构图的强冲击力海报，适合移动端全屏展示。"
  },
  {
    id: 82, documentId: 'fi6', Title: 'Google 展示位视觉 A', Type: 'image', 
    Cover: { url: 'https://picsum.photos/seed/i6/800/450' }, 
    Spend: 8500, ROI_7D: 2.3, CTR: 1.7, IsFeatured: true, Rank: 70,
    LaunchDate: "2024.07",
    Story: "针对 Google 展示广告位设计的横向 Banner，高点击率设计。"
  },
];

export default function Home() {
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWorkClick = (work: Work) => {
    setSelectedWork(work);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto max-w-5xl px-8">
      {/* Slogan & Intro */}
      <section className="py-20 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-32 h-32 mb-12"
        >
          <img
            src="/photo.png"
            alt="Avatar"
            className="rounded-full w-full h-full object-cover border-4 border-white/10 shadow-2xl"
          />
          <div className="absolute -bottom-2 -right-2 bg-zinc-900 rounded-full p-2 shadow-lg text-xl">
            👋
          </div>
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 tracking-tighter uppercase italic pr-4">
          用视觉捕捉游戏之魂
        </h1>
        <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          资深游戏广告设计师。专注于 30s 内高转化短视频与沉浸式视觉素材，为全球顶级游戏品牌提供创意支持。
        </p>
      </section>
      
      {/* Featured Videos */}
      <section className="mb-32">
        <h2 className="text-2xl font-bold mb-12 flex items-center gap-3 italic bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
          <Play size={24} className="text-emerald-400 not-italic" /> FEATURED VIDEOS <span className="text-zinc-400 not-italic ml-2 font-light">.视频精选</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {FEATURED_VIDEOS.map((work) => (
            <div key={work.documentId} onClick={() => handleWorkClick(work)}>
              <WorkCard work={work} />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Images */}
      <section className="mb-32">
        <h2 className="text-2xl font-bold mb-12 flex items-center gap-3 italic bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 pb-1">
          <ImageIcon size={24} className="text-emerald-400 not-italic shrink-0" /> FEATURED VISUALS <span className="text-zinc-400 not-italic ml-2 font-light">.视觉精选</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {FEATURED_IMAGES.map((work) => (
            <div key={work.documentId} onClick={() => handleWorkClick(work)}>
              <WorkCard work={work} />
            </div>
          ))}
        </div>
      </section>

      <WorkModal 
        work={selectedWork} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
