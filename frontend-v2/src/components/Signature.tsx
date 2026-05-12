'use client';

import { motion } from 'framer-motion';

export default function Signature() {
  // 模拟书法笔触的 SVG 路径 (代表 "王晨阳")
  // 这里使用了简化的艺术化路径来模拟书写感
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-8 left-8 z-[100] cursor-default hidden md:block"
    >
      <svg
        width="180"
        height="80"
        viewBox="0 0 200 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
      >
        {/* 王 - Stroke */}
        <motion.path
          d="M20 30 H60 M40 30 V70 M25 70 H55 M20 50 H60"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
        />
        
        {/* 晨 - Simplified Brush Stroke */}
        <motion.path
          d="M80 30 H120 V50 H80 V30 M80 50 L80 80 M120 50 L120 80 M90 65 H110"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 2 }}
        />

        {/* 阳 - Simplified Brush Stroke */}
        <motion.path
          d="M140 25 V80 M140 30 Q165 30 165 50 Q165 70 140 70 M175 25 V80 M175 45 H195 V80"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 3 }}
        />

        {/* 底部装饰线 - 笔锋扫尾 */}
        <motion.path
          d="M20 85 Q100 80 180 85"
          stroke="white"
          strokeWidth="1"
          strokeOpacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 4 }}
        />
      </svg>
    </motion.div>
  );
}
