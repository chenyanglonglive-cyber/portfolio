"use client";

import { useState, useMemo, useRef } from 'react';
import WorkCard from '@/components/WorkCard';
import WorkModal from '@/components/WorkModal';
import { Work, getWorkType, normalizeWork } from '@/types/work';

interface WorksFilterGridProps {
  initialVideos: Work[];
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const IMAGE_FIELDS = [
  "populate[image][fields][0]=url",
  "fields[0]=Title",
  "fields[1]=IsFeatured",
  "fields[2]=Rank",
  "fields[3]=Spend",
  "fields[4]=ROI_7D",
  "fields[5]=CTR",
  "fields[6]=Story",
  "fields[7]=LaunchDate",
].join("&");

export default function WorksFilterGrid({ initialVideos }: WorksFilterGridProps) {
  const [filter, setFilter] = useState<'video' | 'image'>('video');
  const [sortBy, setSortBy] = useState<'default' | 'spend'>('default');
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 图片数据懒加载：切到图片 Tab 时才发请求，且只请求一次
  const [images, setImages] = useState<Work[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const imagesFetched = useRef(false);

  const handleFilterChange = async (next: 'video' | 'image') => {
    setFilter(next);
    if (next === 'image' && !imagesFetched.current) {
      imagesFetched.current = true;
      setImagesLoading(true);
      try {
        const res = await fetch(`${STRAPI_URL}/api/images?${IMAGE_FIELDS}`);
        if (res.ok) {
          const json = await res.json();
          const sorted = ((json.data as Work[]) || [])
            .map(normalizeWork)
            .sort((a, b) => (b.Rank || 0) - (a.Rank || 0));
          setImages(sorted);
        }
      } catch (err) {
        console.error('Failed to load images:', err);
      } finally {
        setImagesLoading(false);
      }
    }
  };

  const handleWorkClick = (work: Work) => {
    setSelectedWork(work);
    setIsModalOpen(true);
  };

  const currentWorks = filter === 'video' ? initialVideos : images;

  const filteredAndSortedWorks = useMemo(() => {
    const result = [...currentWorks];
    if (sortBy === 'spend') {
      result.sort((a, b) => b.Spend - a.Spend);
    } else {
      result.sort((a, b) => (b.Rank || 0) - (a.Rank || 0) || (b.id || 0) - (a.id || 0));
    }
    return result;
  }, [currentWorks, sortBy]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-12">
        {/* 分类切换按钮 */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-full border border-white/5">
          {(['video', 'image'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleFilterChange(t)}
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
          className={`px-5 py-2 rounded-lg text-[10px] font-medium tracking-wider transition-all border ${
            sortBy === 'spend'
              ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
              : 'border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700'
          }`}
        >
          {sortBy === 'spend' ? '消耗排序 ↓' : '默认排序'}
        </button>
      </div>

      {imagesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[16/9] rounded-2xl bg-zinc-900/80 animate-pulse" />
          ))}
        </div>
      ) : filteredAndSortedWorks.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-32 text-center">
          <p className="text-6xl font-black text-zinc-800 mb-4">--</p>
          <p className="text-zinc-500 text-sm tracking-widest uppercase">
            {filter === 'video' ? 'No videos yet' : 'No images yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
