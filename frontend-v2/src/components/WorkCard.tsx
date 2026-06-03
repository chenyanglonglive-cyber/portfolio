'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import Image from 'next/image';
import { Work, getWorkType, getWorkCoverUrl, getWorkVideoUrl } from '@/types/work';
import { getStrapiMedia, getStrapiProxyUrl } from '@/lib/strapi';
import {
  preloadVideo,
  getCachedDuration,
  isPreloaded,
  PRELOAD_DISTANCE_PX,
} from '@/lib/videoCache';

interface WorkCardProps {
  work: Work;
  priority?: boolean;
}

function fmtDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:30';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function WorkCard({ work, priority = false }: WorkCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo = getWorkType(work) === 'video';
  const isCompressing = isVideo && 'video' in work && work.video?.alternativeText === 'compressing';
  const rawCoverUrl = getWorkCoverUrl(work);
  const coverUrl = getStrapiMedia(rawCoverUrl);
  const videoProxyUrl = isVideo && !isCompressing ? getStrapiProxyUrl(getWorkVideoUrl(work)) : null;

  // Restore cached state on mount (survives page navigation)
  const [videoSrc, setVideoSrc] = useState<string>(() => {
    if (videoProxyUrl && isPreloaded(videoProxyUrl)) return videoProxyUrl;
    return '';
  });
  const [duration, setDuration] = useState<string>(() => {
    if (isCompressing) return '排队中';
    if (videoProxyUrl) return fmtDuration(getCachedDuration(videoProxyUrl));
    return '00:30';
  });
  const [isHovered, setIsHovered] = useState(false);

  // Keep duration in sync when cached duration updates (e.g. preload completes
  // after mount but before hover)
  useEffect(() => {
    if (!videoProxyUrl || videoSrc) return;
    const d = getCachedDuration(videoProxyUrl);
    if (!isNaN(d)) setDuration(fmtDuration(d));
  }, [videoProxyUrl, videoSrc]);

  // ── Hover ──────────────────────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (!isVideo || !videoProxyUrl || isCompressing) return;

    if (!videoSrc) setVideoSrc(videoProxyUrl);

    // Wait a tick so the <video> src is in the DOM, then play
    requestAnimationFrame(() => {
      const v = videoRef.current;
      if (!v) return;
      v.play().catch((err) => {
        if (err.name !== 'AbortError') console.error('Video play failed:', err);
      });
    });
  }, [isVideo, videoProxyUrl, videoSrc, isCompressing]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }, []);

  // ── Proximity preload ──────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!videoProxyUrl || videoSrc || isCompressing) return; // already loaded or compressing → skip
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Distance from cursor to nearest edge of the card
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < PRELOAD_DISTANCE_PX) preloadVideo(videoProxyUrl);
    },
    [videoProxyUrl, videoSrc, isCompressing]
  );

  // ── Metadata (only fires for the visible <video>) ──────────────
  const handleLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const d = e.currentTarget.duration;
    if (d && !isNaN(d)) setDuration(fmtDuration(d));
  }, []);

  const displayCover = coverUrl || null;

  return (
    <motion.div
      ref={cardRef}
      className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-white/5 group cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
    >
      <div
        className={`${isVideo ? 'aspect-[4/5]' : 'aspect-[16/9]'} relative bg-black`}
      >
        {/* Cover */}
        {displayCover ? (
          <Image
            src={displayCover}
            alt={work.Title}
            fill
            priority={priority}
            className="object-cover opacity-100 group-hover:opacity-40 transition-opacity duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-zinc-900 animate-pulse" />
        )}

        {/* Video preview — conditionally mounted on hover for GPU performance */}
        {isVideo && !isCompressing && isHovered && (
          <video
            ref={videoRef}
            src={videoProxyUrl || undefined}
            muted
            loop
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            onLoadedMetadata={handleLoadedMetadata}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-100"
            autoPlay
          />
        )}

        {/* Compressing status overlay */}
        {isCompressing && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] text-yellow-400">
            <div className="text-xl mb-1 animate-pulse">⏳</div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-yellow-200 bg-yellow-950/80 px-2 py-0.5 rounded border border-yellow-700/30">
              排队压缩中
            </span>
          </div>
        )}

        {/* Duration / type badge (only rendered for videos) */}
        {isVideo && (
          <div className="absolute top-3 left-3 z-20 px-2 py-1 rounded-md text-[10px] font-bold bg-black/50 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5 uppercase tracking-wider">
            <Play size={10} fill="currentColor" />
            {isCompressing ? '排队中' : duration}
          </div>
        )}

        {/* Hover overlay (Centered Case Study Badge) */}
        <div
          className={`absolute inset-0 z-10 flex items-center justify-center bg-black/25 transition-opacity duration-300 pointer-events-none ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="bg-emerald-400 text-black text-[10px] font-black tracking-widest uppercase rounded-full px-5 py-2.5 shadow-lg shadow-emerald-400/20 transform scale-90 group-hover:scale-100 transition-transform duration-300">
            查看案例
          </div>
        </div>

        {/* Bottom info overlay (hidden by default only for images to preserve vertical space) */}
        <div className={`absolute bottom-0 left-0 right-0 z-20 bg-zinc-950/70 backdrop-blur-md border-t border-white/5 px-4 py-3 flex items-center justify-between gap-3 select-none transition-all duration-300 ease-out ${
          isVideo 
            ? '' 
            : 'transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
        }`}>
          <span className="text-xs font-bold text-white truncate max-w-[65%] tracking-tight">
            {work.Title}
          </span>
          {work.Spend !== null && work.Spend !== undefined && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded font-mono shrink-0">
              {work.Currency === 'USD' ? '$' : '￥'}{Number(work.Spend).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
