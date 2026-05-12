"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 强制播放 1.5 秒以确保动画完整呈现 (Force 1.5s playback)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#090a0f]"
        >
          <div className="relative flex flex-col items-center justify-center gap-8">
             <div className="waves"></div>
             <p className="text-zinc-500 text-sm tracking-[0.2em] font-light animate-pulse">
               创意正在扩散中...
             </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
