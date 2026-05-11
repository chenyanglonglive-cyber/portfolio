"use client";

import { motion } from "framer-motion";
import { Mail, Globe, Play, Share2, Send as Twitter, Code as Github, Aperture as Apple } from "lucide-react";

export default function Socials() {
  const socials = [
    { icon: <Twitter size={18} />, href: "#" },
    { icon: <Github size={18} />, href: "#" },
    { icon: <Mail size={18} />, href: "#" },
    { icon: <Globe size={18} />, href: "#" },
    { icon: <Apple size={18} />, href: "#" },
    { icon: <Play size={18} />, href: "#" },
    { icon: <Share2 size={18} />, href: "#" },
  ];

  return (
    <div className="fixed bottom-12 left-0 right-0 z-40 flex justify-center px-4">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="glass p-2 rounded-full flex items-center gap-2 shadow-xl"
      >
        {socials.map((social, i) => (
          <a
            key={i}
            href={social.href}
            className="p-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-accent-teal dark:hover:text-accent-pink"
          >
            {social.icon}
          </a>
        ))}
      </motion.div>
    </div>
  );
}
