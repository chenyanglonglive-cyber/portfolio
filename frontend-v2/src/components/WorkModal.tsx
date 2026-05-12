'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, BarChart3, PenTool, Play } from 'lucide-react';
import { Work } from '@/types/work';

interface WorkModalProps {
  work: Work | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkModal({ work, isOpen, onClose }: WorkModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!work) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-5xl h-full max-h-[75vh] mt-12 bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.8)]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-50 p-2 bg-black/50 hover:bg-white/10 text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            {/* Left: Video Player */}
            <div className="md:flex-1 bg-black flex items-center justify-center relative overflow-hidden p-8">
                {/* Background diffusion */}
                <div 
                  className="absolute inset-0 opacity-20 blur-3xl scale-110 pointer-events-none"
                  style={{ 
                    backgroundImage: `url(${work.Cover?.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                
                <div className="relative h-full w-full flex items-center justify-center z-10">
                   {work.Type === 'video' && work.VideoURL ? (
                     <video
                        src={work.VideoURL}
                        controls
                        autoPlay
                        loop
                        className="max-h-full max-w-full object-contain shadow-2xl rounded-xl"
                     />
                   ) : (
                     <img src={work.Cover.url} className="max-h-full max-w-full object-contain shadow-2xl rounded-xl" alt={work.Title} />
                   )}
                </div>
            </div>

            {/* Right: Info Panel with custom scrollbar */}
            <div className="w-full md:w-[400px] flex flex-col border-l border-white/5">
              <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                
                {/* Header Info */}
                <section className="space-y-4">
                   <div className="flex items-center gap-3 text-emerald-400 font-mono text-xs uppercase tracking-widest">
                      <Calendar size={14} />
                      {work.LaunchDate || "2024.10"}
                   </div>
                   <h2 className="text-2xl font-black text-white leading-tight uppercase italic">
                      {work.Title}
                   </h2>
                </section>

                {/* Data Dashboard */}
                <section className="space-y-6">
                   <h3 className="text-xs font-bold text-zinc-500 flex items-center gap-2 uppercase tracking-widest">
                      <BarChart3 size={14} /> Performance Data .数据
                   </h3>
                   <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                         <p className="text-[9px] text-zinc-500 uppercase mb-1">Spend</p>
                         <p className="text-sm font-mono font-bold text-white">${work.Spend.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                         <p className="text-[9px] text-zinc-500 uppercase mb-1">CTR</p>
                         <p className="text-sm font-mono font-bold text-emerald-400">{work.CTR}%</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                         <p className="text-[9px] text-zinc-500 uppercase mb-1">ROI</p>
                         <p className="text-sm font-mono font-bold text-emerald-400">{work.ROI_7D}</p>
                      </div>
                   </div>
                </section>

                {/* Creative Story */}
                <section className="space-y-6 pb-10">
                   <h3 className="text-xs font-bold text-zinc-500 flex items-center gap-2 uppercase tracking-widest">
                      <PenTool size={14} /> Creative Insights .创意
                   </h3>
                   <div className="prose prose-invert prose-emerald max-w-none">
                      <p className="text-zinc-400 leading-relaxed text-sm whitespace-pre-wrap">
                        {work.Story || "该项目的核心创意源于对目标玩家群体心理的深度洞察。我们采用高对比度的视觉风格，配合动感的配乐，在前 3 秒就锁定了用户的注意力。通过 A/B 测试，我们不断迭代素材，最终实现了点击率与转化率的双重突破。"}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                         <div className="aspect-square bg-zinc-800 rounded-xl animate-pulse" />
                         <div className="aspect-square bg-zinc-800 rounded-xl animate-pulse" />
                      </div>
                   </div>
                </section>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
