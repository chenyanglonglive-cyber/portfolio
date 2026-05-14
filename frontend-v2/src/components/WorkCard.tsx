'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Work } from '@/types/work';
import { Play } from 'lucide-react';
import { getStrapiMedia } from '@/lib/strapi';
import Image from 'next/image';

interface WorkCardProps {
  work: Work;
}

export default function WorkCard({ work }: WorkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [generatedCover, setGeneratedCover] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const videoUrl = getStrapiMedia(work.Video?.url);
  const coverUrl = getStrapiMedia(work.Cover?.url);

  // 如果没有封面图，自动从视频首帧生成
  const generateCoverFromVideo = useCallback(() => {
    if (coverUrl || !videoUrl || generatedCover) return;

    const tempVideo = document.createElement('video');
    tempVideo.crossOrigin = 'anonymous';
    tempVideo.src = videoUrl;
    tempVideo.muted = true;
    tempVideo.preload = 'metadata';

    tempVideo.addEventListener('loadeddata', () => {
      // 跳到第 0.1 秒，避免纯黑首帧
      tempVideo.currentTime = 0.1;
    });

    tempVideo.addEventListener('seeked', () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = tempVideo.videoWidth;
      canvas.height = tempVideo.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setGeneratedCover(dataUrl);
      }
      // 清理临时视频元素
      tempVideo.src = '';
      tempVideo.load();
    });
  }, [coverUrl, videoUrl, generatedCover]);

  useEffect(() => {
    if (work.Type === 'video' && !coverUrl) {
      generateCoverFromVideo();
    }
  }, [work.Type, coverUrl, generateCoverFromVideo]);

  useEffect(() => {
    if (isHovered && work.Type === 'video' && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          // Ignore AbortError caused by rapid hover
          if (err.name !== 'AbortError') {
            console.error('Video play failed:', err);
          }
        });
      }
    } else if (!isHovered && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, work.Type]);

  // 最终使用的封面：优先用自动生成的视频首帧 > Strapi 上传的封面 > 占位图
  const displayCover = (work.Type === 'video' ? generatedCover : coverUrl) || coverUrl || generatedCover || null;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-white/5 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
    >
      {/* 隐藏的 canvas 用于生成首帧 */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 16:9 外部容器 */}
      <div className="aspect-video relative overflow-hidden bg-black flex items-center justify-center">

        {/* 背景：使用封面图的深度模糊版本，自动获取主色调 */}
        {displayCover && (
          <div
            className="absolute inset-0 opacity-40 blur-3xl scale-110 pointer-events-none"
            style={{
              backgroundImage: `url(${displayCover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}

        {/* 主体内容：9:16 居中盛满高度 */}
        <div className="relative h-full aspect-[9/16] z-10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {displayCover ? (
            <Image
              src={displayCover}
              alt={work.Title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-opacity duration-500 ${isHovered && work.Type === 'video' && videoUrl ? 'opacity-0' : 'opacity-100'
                }`}
              // 自动生成的 base64 图片不走 next/image 优化
              unoptimized={!coverUrl}
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 animate-pulse" />
          )}

          {work.Type === 'video' && videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              muted
              loop
              playsInline
              preload="none"
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
