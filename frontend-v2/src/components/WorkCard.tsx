'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import Image from 'next/image';
import { Work, getWorkType, getWorkCoverUrl, getWorkVideoUrl } from '@/types/work';
import { getStrapiMedia } from '@/lib/strapi';

interface WorkCardProps {
  work: Work;
  priority?: boolean; // 新增：用于首屏图片优先加载
}

export default function WorkCard({ work, priority = false }: WorkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [generatedCover, setGeneratedCover] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>("00:30");
  // 懒加载：初始为空，首次 hover 时才设置，触发浏览器请求
  const [videoSrc, setVideoSrc] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  // 防止重复抓帧
  const hasCaptured = useRef(false);

  const isVideo = getWorkType(work) === 'video';
  const rawCoverUrl = getWorkCoverUrl(work);
  const coverUrl = getStrapiMedia(rawCoverUrl);
  const videoUrl = isVideo ? getStrapiMedia(getWorkVideoUrl(work)) : null;

  // 1. 补位逻辑：如果后端没封面，就在挂载时主动抓帧
  useEffect(() => {
    if (isVideo && !rawCoverUrl && !generatedCover && !hasCaptured.current) {
      captureFirstFrame();
    }
  }, [isVideo, rawCoverUrl, generatedCover, captureFirstFrame]);

  // 首帧抓取：仅在首次 hover 且无封面时执行，不在 mount 时触发
  const captureFirstFrame = useCallback(() => {
    // 只有在确定没有后端封面且未抓取过时才执行
    if (!videoUrl || hasCaptured.current || rawCoverUrl) return;
    hasCaptured.current = true;

    const tempVideo = document.createElement('video');
    tempVideo.crossOrigin = 'anonymous';
    tempVideo.src = videoUrl;
    tempVideo.muted = true;
    tempVideo.preload = 'metadata';

    const cleanup = () => {
      tempVideo.removeEventListener('loadedmetadata', handleMetadata);
      tempVideo.removeEventListener('seeked', handleSeeked);
      tempVideo.src = '';
      tempVideo.load();
    };

    const handleMetadata = () => {
      tempVideo.currentTime = Math.min(tempVideo.duration, 1.0);
    };

    const handleSeeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = tempVideo.videoWidth;
        canvas.height = tempVideo.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx && canvas.width > 0) {
          ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          setGeneratedCover(canvas.toDataURL('image/jpeg', 0.8));
        }
      } catch (err) {
        console.warn('Thumbnail capture failed:', err);
      } finally {
        cleanup();
      }
    };

    tempVideo.addEventListener('loadedmetadata', handleMetadata);
    tempVideo.addEventListener('seeked', handleSeeked);
  }, [videoUrl, coverUrl]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!isVideo || !videoUrl) return;

    // 首次 hover 时才设置 src，触发视频资源请求
    if (!videoSrc) {
      setVideoSrc(videoUrl);
      // 没有封面时同步抓取首帧
      if (!coverUrl) captureFirstFrame();
    }

    // 播放（src 刚设置时 play() 会在 canplay 后自动触发）
    const playPromise = videoRef.current?.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        if (err.name !== 'AbortError') console.error('Video play failed:', err);
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // 从播放元素读取时长（hover 后首次 loadedmetadata）
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration && !isNaN(video.duration)) {
      const mins = Math.floor(video.duration / 60);
      const secs = Math.floor(video.duration % 60);
      setDuration(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      // 同时尝试在此时抓帧（无封面且未抓取）
      if (!coverUrl && !hasCaptured.current) captureFirstFrame();
    }
  };

  // 优先使用 Strapi 上传的封面（秒显示），canvas 抓帧仅在无封面时作兜底
  const displayCover = coverUrl || generatedCover || null;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-white/5 group cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
    >
      <div className={`${isVideo ? 'aspect-[9/16]' : 'aspect-[16/9]'} relative bg-black`}>
        {/* 封面图 */}
        {displayCover ? (
          <Image
            src={displayCover}
            alt={work.Title}
            fill
            priority={priority}
            className="object-cover opacity-80 group-hover:opacity-40 transition-opacity duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-zinc-900 animate-pulse" />
        )}

        {/* 悬停视频预览：preload=none，src 延迟注入 */}
        {isVideo && (
          <video
            ref={videoRef}
            src={videoSrc || undefined}
            muted
            loop
            playsInline
            preload="none"
            crossOrigin="anonymous"
            onLoadedMetadata={handleLoadedMetadata}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isHovered && videoSrc ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* 左上角时长/类型徽章 */}
        <div className="absolute top-3 left-3 z-20 px-2 py-1 rounded-md text-[10px] font-bold bg-black/50 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5 uppercase tracking-wider">
          {isVideo ? <Play size={10} fill="currentColor" /> : null}
          {isVideo ? duration : "IMAGE"}
        </div>

        {/* 悬停遮罩层 */}
        <div className={`absolute inset-0 z-10 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-10'
        }`}>
          <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none mb-1 group-hover:translate-x-1 transition-transform duration-500">
            {work.Title}
          </h3>
          <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
            View Case Study →
          </p>
        </div>
      </div>
    </motion.div>
  );
}
