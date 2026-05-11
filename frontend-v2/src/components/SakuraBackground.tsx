"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Petal = ({ i }: { i: number }) => {
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [duration, setDuration] = useState(10);
  const [delay, setDelay] = useState(0);

  useEffect(() => {
    setStartPos({
      x: Math.random() * 100,
      y: -10,
    });
    setDuration(15 + Math.random() * 10);
    setDelay(Math.random() * 20);
  }, []);

  return (
    <motion.div
      initial={{ top: "-5%", left: `${startPos.x}%`, opacity: 0 }}
      animate={{
        top: "105%",
        left: `${startPos.x + (Math.random() * 20 - 10)}%`,
        rotate: 360,
        opacity: [0, 0.6, 0.6, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "linear",
      }}
      className="fixed pointer-events-none z-0"
    >
      <div className="w-4 h-4 bg-[#f472b6] opacity-40 rounded-full blur-[1px] transform rotate-45" 
           style={{ borderRadius: "100% 0 100% 0" }}></div>
    </motion.div>
  );
};

export default function SakuraBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
      {[...Array(20)].map((_, i) => (
        <Petal key={i} i={i} />
      ))}
    </div>
  );
}
