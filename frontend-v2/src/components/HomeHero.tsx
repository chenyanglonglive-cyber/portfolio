"use client";
import { motion } from "framer-motion";

export default function HomeHero() {
  return (
    <section className="py-20 text-center flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-32 h-32 mb-12"
      >
        <img
          src="/photo.png"
          alt="Avatar"
          className="rounded-full w-full h-full object-cover border-4 border-white/10 shadow-2xl"
        />
        <div className="absolute -bottom-2 -right-2 bg-zinc-900 rounded-full p-2 shadow-lg text-xl">
          👋
        </div>
      </motion.div>

      <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 tracking-tighter uppercase italic pr-4">
        用视觉捕捉游戏之魂
      </h1>
      <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
        资深游戏广告设计师。专注于 30s 内高转化短视频与沉浸式视觉素材，为全球顶级游戏品牌提供创意支持。
      </p>
    </section>
  );
}
