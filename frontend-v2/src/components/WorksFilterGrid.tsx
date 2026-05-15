"use client";

import { useState, useMemo } from 'react';
import WorkCard from '@/components/WorkCard';
import WorkModal from '@/components/WorkModal';
import { Work, getWorkType } from '@/types/work';

interface WorksFilterGridProps {
  initialWorks: Work[];
}

export default function WorksFilterGrid({ initialWorks }: WorksFilterGridProps) {
  const [filter, setFilter] = useState<'all' | 'video' | 'image'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'spend'>('default');
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWorkClick = (work: Work) => {
    setSelectedWork(work);
    setIsModalOpen(true);
  };

  const filteredAndSortedWorks = useMemo(() => {
    const result = [...initialWorks].filter(
      work => filter === 'all' || getWorkType(work) === filter
    );

    if (sortBy === 'spend') {
      result.sort((a, b) => b.Spend - a.Spend);
    } else {
      result.sort((a, b) => (b.Rank || 0) - (a.Rank || 0) || (b.id || 0) - (a.id || 0));
    }

    return result;
  }, [initialWorks, filter, sortBy]);

  return (
    <>
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

      {filteredAndSortedWorks.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-32 text-center">
          <p className="text-6xl font-black text-zinc-800 mb-4">--</p>
          <p className="text-zinc-500 text-sm tracking-widest uppercase">
            {filter === 'video' ? 'No videos yet' : filter === 'image' ? 'No images yet' : 'No works yet'}
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
