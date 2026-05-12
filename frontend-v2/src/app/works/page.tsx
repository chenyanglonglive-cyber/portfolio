"use client";

import { useState, useMemo } from 'react';
import WorkCard from '@/components/WorkCard';
import WorkModal from '@/components/WorkModal';
import { Work } from '@/types/work';

// Mock data with mixed aspect ratios (9:16 and 16:9)
const MOCK_WORKS: Work[] = [
  {
    id: 1, documentId: 'w1', Title: '竖屏：某二次元手游 PV 混剪', Type: 'video', 
    Cover: { url: 'https://picsum.photos/seed/v1/450/800' }, 
    VideoURL: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    Spend: 250000, ROI_7D: 3.15, CTR: 4.5, IsFeatured: true, Rank: 99,
    LaunchDate: "2024.12",
    Story: "该竖屏素材针对 TikTok 与抖音平台设计，通过高频转场与强冲击力的视觉特效，在前 3 秒就锁定了用户注意力。",
    Description: "主打华丽战斗视觉，通过 AI 补帧提升流畅度。"
  },
  {
    id: 10, documentId: 'w10', Title: '横屏：雷霆战机品牌宣传片', Type: 'video', 
    Cover: { url: 'https://picsum.photos/seed/h1/800/450' }, 
    VideoURL: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    Spend: 1500000, ROI_7D: 4.2, CTR: 6.8, IsFeatured: true, Rank: 100,
    LaunchDate: "2024.10",
    Story: "这是为《雷霆战机》十周年设计的横屏品牌片。采用了 16:9 的电影级构图，展示了宏大的星际战场与品牌发展历程。",
    Description: "10周年品牌焕新素材，横屏大片感。"
  },
  {
    id: 2, documentId: 'w2', Title: '竖屏：SLG 策略投放素材 B', Type: 'image', 
    Cover: { url: 'https://picsum.photos/seed/i1/450/800' }, 
    Spend: 8000, ROI_7D: 1.42, CTR: 2.1, IsFeatured: true, Rank: 50,
    LaunchDate: "2024.10",
    Story: "使用 MAYA 渲染核心建筑，展示升级成就感。竖屏构图更适合展示建筑的挺拔感。",
    Description: "目标精准投放核心玩家。"
  },
  {
    id: 20, documentId: 'w20', Title: '横屏：官网首屏 KV 视觉', Type: 'image', 
    Cover: { url: 'https://picsum.photos/seed/hi1/800/450' }, 
    Spend: 5000, ROI_7D: 1.1, CTR: 1.2, IsFeatured: false, Rank: 30,
    LaunchDate: "2024.11",
    Story: "为游戏官网设计的 16:9 横向 KV。背景采用了深度模糊处理，突出中心角色，营造史诗感。",
    Description: "横屏视觉大图，官网核心资产。"
  },
];

export default function WorksPage() {
  const [filter, setFilter] = useState<'all' | 'video' | 'image'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'spend'>('default');
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWorkClick = (work: Work) => {
    setSelectedWork(work);
    setIsModalOpen(true);
  };

  const filteredAndSortedWorks = useMemo(() => {
    let result = [...MOCK_WORKS].filter(
      work => filter === 'all' || work.Type === filter
    );

    if (sortBy === 'spend') {
      result.sort((a, b) => b.Spend - a.Spend);
    } else {
      result.sort((a, b) => b.Rank - a.Rank || b.id - a.id);
    }

    return result;
  }, [filter, sortBy]);

  return (
    <div className="container mx-auto max-w-5xl px-8 py-20">
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 tracking-tighter uppercase italic pr-4">
            Portfolio <span className="text-emerald-400 not-italic ml-2 text-2xl md:text-4xl">.作品</span>
          </h1>
          <p className="text-zinc-500 max-w-xl text-lg">
            展示 9:16 及 16:9 全尺寸广告创意。
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-12">
        <div className="flex gap-3">
          {(['all', 'video', 'image'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-8 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all duration-300 border ${
                filter === t
                  ? 'bg-white border-white text-black'
                  : 'bg-transparent border-white/10 text-zinc-500 hover:text-white hover:border-white/30'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="hidden md:block h-4 w-px bg-white/10 mx-2" />

        <button
          onClick={() => setSortBy(sortBy === 'spend' ? 'default' : 'spend')}
          className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest border transition-all uppercase ${
            sortBy === 'spend' 
              ? 'bg-emerald-400 border-emerald-400 text-black shadow-[0_0_15px_rgba(52,211,153,0.3)]' 
              : 'border-white/10 text-zinc-500 hover:text-white hover:border-white/30'
          }`}
        >
          {sortBy === 'spend' ? '按消耗排序中' : '按消耗排序'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredAndSortedWorks.map((work) => (
          <div key={work.documentId} onClick={() => handleWorkClick(work)}>
            <WorkCard work={work} />
          </div>
        ))}
      </div>

      <WorkModal 
        work={selectedWork} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
