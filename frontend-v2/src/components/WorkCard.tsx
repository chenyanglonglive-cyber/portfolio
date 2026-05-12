'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Work } from '@/types/work';
import { Play } from 'lucide-react';
import { getStrapiMedia } from '@/lib/strapi';

interface WorkCardProps {
  work: Work;
}

export default function WorkCard({ work }: WorkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isHovered && work.Type === 'video' && videoRef.current) {
      videoRef.current.play().catch(err => console.log('Video play interrupted', err));
    } else if (!isHovered && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, work.Type]);

  const coverUrl = getStrapiMedia(work.Cover?.url);
  const videoUrl = getStrapiMedia(work.VideoURL);

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-white/5 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
    >
      {/* 16:9 外部容器 */}
      <div className="aspect-video relative overflow-hidden bg-black flex items-center justify-center">

        {/* 背景：使用封面图的深度模糊版本，自动获取主色调 */}
        <div
          className="absolute inset-0 opacity-40 blur-3xl scale-110 pointer-events-none"
          style={{
            backgroundImage: `url(${coverUrl || "https://picsum.photos/seed/placeholder/800/450"})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* 主体内容：9:16 居中盛满高度 */}
        <div className="relative h-full aspect-[9/16] z-10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <img
            src={coverUrl || "https://picsum.photos/seed/placeholder/800/1422"}
            alt={work.Title}
            className={`w-full h-full object-cover transition-opacity duration-500 ${isHovered && work.Type === 'video' && videoUrl ? 'opacity-0' : 'opacity-100'
              }`}
          />

          {work.Type === 'video' && videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              muted
              loop
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'
                }`}
            />
          )}
        </div>

        {/* 左上角徽章 (参考截图样式) */}
        <div className="absolute top-3 left-3 z-20 px-2 py-1 rounded-md text-[10px] font-bold bg-black/50 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5 uppercase tracking-wider">
          {work.Type === 'video' ? <Play size={10} fill="currentColor" /> : null}
          {work.Type === 'video' ? "00:30" : "IMAGE"}
        </div>

        {/* 悬停时显示的数据遮罩 - 移除了全局 backdrop-blur 以保持视频清晰 */}
        <div className={`absolute inset-0 z-30 bg-black/10 transition-opacity duration-500 flex flex-col justify-end p-5 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between items-end bg-black/60 p-3 rounded-xl border border-white/10 backdrop-blur-xl translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <div className="flex flex-col">
              <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest">Spend</span>
              <span className="text-white font-mono text-sm">${(work.Spend || 0).toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest">7D ROI</span>
              <span className={`font-mono text-sm font-bold ${(work.ROI_7D || 0) >= 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(work.ROI_7D || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部文字 */}
      <div className="p-4 border-t border-white/5">
        <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
          {work.Title}
        </h3>
      </div>
    </motion.div>
  );
}
