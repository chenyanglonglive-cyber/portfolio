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
  const rawCoverUrl = getWorkCoverUrl(work);
  const coverUrl = getStrapiMedia(rawCoverUrl);
  const videoProxyUrl = isVideo ? getStrapiProxyUrl(getWorkVideoUrl(work)) : null;

  // Restore cached state on mount (survives page navigation)
  const [videoSrc, setVideoSrc] = useState<string>(() => {
    if (videoProxyUrl && isPreloaded(videoProxyUrl)) return videoProxyUrl;
    return '';
  });
  const [duration, setDuration] = useState<string>(() => {
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
    if (!isVideo || !videoProxyUrl) return;

    if (!videoSrc) setVideoSrc(videoProxyUrl);

    // Wait a tick so the <video> src is in the DOM, then play
    requestAnimationFrame(() => {
      const v = videoRef.current;
      if (!v) return;
      v.play().catch((err) => {
        if (err.name !== 'AbortError') console.error('Video play failed:', err);
      });
    });
  }, [isVideo, videoProxyUrl, videoSrc]);

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
      if (!videoProxyUrl || videoSrc) return; // already loaded → skip
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Distance from cursor to nearest edge of the card
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < PRELOAD_DISTANCE_PX) preloadVideo(videoProxyUrl);
    },
    [videoProxyUrl, videoSrc]
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
        className={`${isVideo ? 'aspect-[9/16]' : 'aspect-[16/9]'} relative bg-black`}
      >
        {/* Cover */}
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

        {/* Video preview — src injected lazily */}
        {isVideo && (
          <video
            ref={videoRef}
            src={videoSrc || undefined}
            muted
            loop
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
            onLoadedMetadata={handleLoadedMetadata}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isHovered && videoSrc ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Duration / type badge */}
        <div className="absolute top-3 left-3 z-20 px-2 py-1 rounded-md text-[10px] font-bold bg-black/50 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5 uppercase tracking-wider">
          {isVideo ? <Play size={10} fill="currentColor" /> : null}
          {isVideo ? duration : 'IMAGE'}
        </div>

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 z-10 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-10'
          }`}
        >
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
