'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import Image from 'next/image';
import { Work } from '@/types/work';
import { getStrapiMedia } from '@/lib/strapi';

interface WorkCardProps {
  work: Work;
}

export default function WorkCard({ work }: WorkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [generatedCover, setGeneratedCover] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>("00:30");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mediaItem = work.Media?.[0];
  const isVideo = mediaItem?.__component === 'media.video-item';
  const coverUrl = getStrapiMedia(
    isVideo ? mediaItem.cover?.url : (mediaItem?.__component === 'media.image-item' ? mediaItem.image?.url : undefined)
  );
  const videoUrl = isVideo ? getStrapiMedia(mediaItem.video?.url) : null;

  // 1. 自动抓取视频首帧（改进版：寻找有画面的时间点 + CORS 增强）
  useEffect(() => {
    if (!isVideo || coverUrl || !videoUrl || generatedCover) return;

    const tempVideo = document.createElement('video');
    tempVideo.crossOrigin = 'anonymous';
    tempVideo.src = videoUrl;
    tempVideo.muted = true;
    tempVideo.preload = 'metadata';

    const handleMetadata = () => {
      // 抓取第 1.0 秒，通常已经有画面了，避开纯黑开头
      tempVideo.currentTime = Math.min(tempVideo.duration, 1.0);
    };

    const handleSeeked = () => {
      try {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = tempVideo.videoWidth;
        canvas.height = tempVideo.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx && canvas.width > 0) {
          ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setGeneratedCover(dataUrl);
        }
      } catch (err) {
        console.warn('Thumbnail capture failed:', err);
      } finally {
        cleanup();
      }
    };

    const cleanup = () => {
      tempVideo.removeEventListener('loadedmetadata', handleMetadata);
      tempVideo.removeEventListener('seeked', handleSeeked);
      tempVideo.src = '';
      tempVideo.load();
    };

    tempVideo.addEventListener('loadedmetadata', handleMetadata);
    tempVideo.addEventListener('seeked', handleSeeked);

    return cleanup;
  }, [work.documentId, coverUrl, videoUrl, generatedCover, isVideo]);

  // 2. 处理视频播放/暂停控制
  useEffect(() => {
    if (isHovered && isVideo && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          if (err.name !== 'AbortError') console.error('Video play failed:', err);
        });
      }
    } else if (!isHovered && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, isVideo]);

  // 3. 动态获取视频时长
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration && !isNaN(video.duration)) {
      const mins = Math.floor(video.duration / 60);
      const secs = Math.floor(video.duration % 60);
      setDuration(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }
  };

  // 最终使用的封面：优先用自动生成的视频首帧 > Strapi 上传的封面
  const displayCover = (isVideo ? generatedCover : coverUrl) || coverUrl || generatedCover || null;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-white/5 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
    >
      <div className="aspect-[16/9] relative bg-black">
        {/* 底层展示图 */}
        {displayCover ? (
          <Image
            src={displayCover}
            alt={work.Title}
            fill
            className="object-cover opacity-80 group-hover:opacity-40 transition-opacity duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 animate-pulse" />
        )}

        {/* 悬停时的视频预览 */}
        {isVideo && videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            loop
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
            onLoadedMetadata={handleLoadedMetadata}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'
              }`}
          />
        )}

        {/* 左上角时长徽章 */}
        <div className="absolute top-3 left-3 z-20 px-2 py-1 rounded-md text-[10px] font-bold bg-black/50 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5 uppercase tracking-wider">
          {isVideo ? <Play size={10} fill="currentColor" /> : null}
          {isVideo ? duration : "IMAGE"}
        </div>

        {/* 悬停遮罩层 */}
        <div className={`absolute inset-0 z-10 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-10'
          }`}>
          <h3 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none mb-1 group-hover:translate-x-1 transition-transform duration-500">
            {work.Title}
          </h3>
          <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
            View Case Study →
          </p>
        </div>
      </div>

      {/* 隐藏的辅助 Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
