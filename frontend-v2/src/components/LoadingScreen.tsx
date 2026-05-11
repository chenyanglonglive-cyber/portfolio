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
          className="fixed inset-0 z-[999] flex items-center justify-center bg-background-light dark:bg-background-dark"
        >
          {/* 复刻 Shiro 的 ScaleTransitionView 逻辑 */}
          <motion.div
            initial={{ scale: 0.001, opacity: 0 }}
            animate={{ 
              scale: [0.001, 1, 100], // 从圆点到正常大小，再到全屏扩散
              opacity: [0, 1, 1]
            }}
            transition={{
              duration: 1.5,
              times: [0, 0.4, 1],
              ease: [0.34, 1.56, 0.64, 1], // Spring-like cubic-bezier
            }}
            className="w-20 h-20 rounded-full bg-accent-teal dark:bg-accent-pink shadow-2xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
