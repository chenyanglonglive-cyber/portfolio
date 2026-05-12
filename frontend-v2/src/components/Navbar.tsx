"use client";

import { motion } from "framer-motion";
import { Home, FileText, Briefcase, Clock, Zap, MoreHorizontal, User } from "lucide-react";

export default function Navbar() {
  const navItems = [
    { icon: <Home size={18} />, label: "首页", href: "/" },
    { icon: <User size={18} />, label: "简历", href: "/resume" },
    { icon: <Briefcase size={18} />, label: "作品", href: "/works" },
    { icon: <FileText size={18} />, label: "手记", href: "/blog" },
  ];

  return (
    <nav className="fixed top-8 left-0 right-0 z-40 flex justify-center px-4">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass pill-nav flex items-center gap-1 sm:gap-2 overflow-hidden shadow-2xl"
      >
        {navItems.map((item, i) => (
          <a
            key={i}
            href={item.href}
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group text-white hover:bg-white hover:text-black"
          >
            <span className="text-white group-hover:text-black transition-colors">
              {item.icon}
            </span>
            <span className="text-sm font-bold hidden md:inline uppercase tracking-tight">{item.label}</span>
          </a>
        ))}
      </motion.div>
      
    </nav>
  );
}
