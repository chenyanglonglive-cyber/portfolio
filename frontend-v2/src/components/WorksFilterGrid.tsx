"use client";

import { useState, useMemo } from 'react';
import WorkCard from '@/components/WorkCard';
import WorkModal from '@/components/WorkModal';
import { Work, Tag, Project } from '@/types/work';

interface WorksFilterGridProps {
  initialVideos: Work[];
  initialImages: Work[];
  tags?: Tag[];
  projects?: Project[];
  error?: string;
}

export default function WorksFilterGrid({ 
  initialVideos, 
  initialImages, 
  tags = [], 
  projects = [],
  error 
}: WorksFilterGridProps) {
  const [filter, setFilter] = useState<'video' | 'image'>('video');
  const [sortBy, setSortBy] = useState<'default' | 'spend'>('default');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWorkClick = (work: Work) => {
    setSelectedWork(work);
    setIsModalOpen(true);
  };

  // 根据当前 Tab 选择数据源，切换是瞬时的，因为数据都在 props 里
  const currentWorks = filter === 'video' ? initialVideos : initialImages;

  const filteredAndSortedWorks = useMemo(() => {
    let result = [...currentWorks];
    
    // 按选中的项目进行过滤
    if (selectedProjectId !== 'all') {
      result = result.filter(work => work.project?.documentId === selectedProjectId);
    }

    // 按选中的标签进行过滤
    if (selectedTagId !== null) {
      result = result.filter(work => 
        work.tags && work.tags.some(t => t.documentId === selectedTagId)
      );
    }

    if (sortBy === 'spend') {
      result.sort((a, b) => (b.Spend ?? -1) - (a.Spend ?? -1));
    } else {
      result.sort((a, b) => (b.Rank || 0) - (a.Rank || 0) || (b.id || 0) - (a.id || 0));
    }
    return result;
  }, [currentWorks, sortBy, selectedTagId, selectedProjectId]);

  const isProjectActive = selectedProjectId !== 'all';

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-12">
        {/* 分类切换按钮 */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-full border border-white/5">
          {(['video', 'image'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setFilter(t);
                // Switch tabs should preserve filters, or we can reset them if needed,
                // but keeping them is standard
              }}
              className={`px-8 py-2.5 rounded-full text-xs font-black tracking-widest transition-all duration-300 uppercase ${
                filter === t
                  ? 'bg-white text-black shadow-lg'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {t === 'video' ? '视频' : '图片'}
            </button>
          ))}
        </div>

        <div className="hidden md:block h-5 w-px bg-white/10 mx-1" />

        {/* 排序按钮 */}
        <button
          onClick={() => setSortBy(sortBy === 'spend' ? 'default' : 'spend')}
          className={`px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all border ${
            sortBy === 'spend'
              ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
              : 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
        >
          {sortBy === 'spend' ? '消耗排序 ↓' : '默认排序'}
        </button>

        {/* 项目筛选下拉菜单 */}
        {projects && projects.length > 0 && (
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className={`appearance-none bg-zinc-950/80 backdrop-blur-md border font-semibold rounded-lg py-2.5 pl-4 pr-10 text-xs tracking-wider transition-all outline-none cursor-pointer ${
                isProjectActive 
                  ? 'border-emerald-400/50 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.1)]' 
                  : 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <option value="all">所有项目</option>
              {projects.map((p) => (
                <option key={p.documentId} value={p.documentId} className="bg-zinc-950 text-zinc-300">
                  {p.Name}
                </option>
              ))}
            </select>
            <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none transition-colors ${
              isProjectActive ? 'text-emerald-400' : 'text-zinc-500'
            }`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}

        {/* 标签过滤栏 */}
        {tags && tags.length > 0 && (
          <div className="w-full flex flex-wrap items-center gap-2 mt-4 py-2 border-t border-white/5">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest mr-2">标签过滤:</span>
            <button
              onClick={() => setSelectedTagId(null)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider transition-all duration-300 ${
                selectedTagId === null
                  ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
                  : 'bg-white/5 text-zinc-400 border border-transparent hover:text-white hover:bg-white/10'
              }`}
            >
              全部
            </button>
            {tags.map((t) => (
              <button
                key={t.documentId}
                onClick={() => setSelectedTagId(t.documentId)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider transition-all duration-300 ${
                  selectedTagId === t.documentId
                    ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
                    : 'bg-white/5 text-zinc-400 border border-transparent hover:text-white hover:bg-white/10'
                }`}
              >
                {t.Name}
              </button>
            ))}
          </div>
        )}
      </div>


      {filteredAndSortedWorks.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-32 text-center">
          <p className="text-6xl font-black text-zinc-800 mb-4">--</p>
          {error ? (
            <p className="text-red-400/80 text-sm tracking-widest">{error}</p>
          ) : (
            <p className="text-zinc-500 text-sm tracking-widest uppercase">
              {filter === 'video' ? 'No videos yet' : 'No images yet'}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedWorks.map((work) => (
            <div key={work.documentId} onClick={() => handleWorkClick(work)} className="cursor-pointer">
              <WorkCard work={work} />
            </div>
          ))}
        </div>
      )}

      <WorkModal
        work={selectedWork}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
