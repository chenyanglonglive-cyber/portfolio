"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-height-[80vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-32 h-32 mb-8"
      >
        <img
          src="/photo.png"
          alt="Avatar"
          className="rounded-full w-full h-full object-cover border-4 border-white/20 shadow-xl"
        />
        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-zinc-800 rounded-full p-2 shadow-lg">
          👋
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-xl font-medium mb-2 text-zinc-600 dark:text-zinc-400"
      >
        Hi, I'm <span className="text-accent-teal dark:text-accent-pink font-bold">User</span>
      </motion.h2>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
      >
        A NodeJS Full Stack <br />
        <span className="font-mono text-2xl md:text-3xl text-zinc-500 dark:text-zinc-500">
          &lt;Developer /&gt;
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="max-w-md text-zinc-500 dark:text-zinc-400 font-mono text-sm uppercase tracking-widest"
      >
        AN INDEPENDENT DEVELOPER CODING WITH LOVE.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="mt-12 flex gap-4"
      >
        <button className="glass pill-btn bg-accent-teal text-white border-none px-8 py-3 font-bold hover:bg-opacity-90">
          Say Hello
        </button>
      </motion.div>
    </section>
  );
}
