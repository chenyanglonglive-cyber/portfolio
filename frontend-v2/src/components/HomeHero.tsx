"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HomeHero() {
  return (
    <section className="py-20 text-center flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-[180px] h-[180px] mb-12"
      >
        <Image
          src="/Avatar2.png"
          alt="Avatar"
          width={180}
          height={180}
          priority
          className="rounded-full w-full h-full object-cover border-4 border-white/10 shadow-2xl"
        />
        <div className="absolute -bottom-2 -right-2 bg-zinc-900 rounded-full p-2 shadow-lg text-xl">
          👋
        </div>
      </motion.div>

      <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 tracking-tighter uppercase pr-4">
        创意为核AI为刃，把想法变成爆款素材
      </h1>
      <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
        游戏影视发烧友 + 网感敏锐+技术极客，创意源源不断，AIGC全链路放大创作，自动化提效，打造海内外高转化爆款游戏广告。
      </p>
    </section>
  );
}
