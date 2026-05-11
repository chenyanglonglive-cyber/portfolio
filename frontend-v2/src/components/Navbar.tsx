"use client";

import { motion } from "framer-motion";
import { Home, FileText, Briefcase, Clock, Zap, MoreHorizontal, User } from "lucide-react";

export default function Navbar() {
  const navItems = [
    { icon: <Home size={18} />, label: "首页", href: "/" },
    { icon: <FileText size={18} />, label: "文档", href: "/docs" },
    { icon: <Briefcase size={18} />, label: "手记", href: "/blog" },
    { icon: <Clock size={18} />, label: "时光", href: "/timeline" },
    { icon: <Zap size={18} />, label: "思考", href: "/thoughts" },
    { icon: <MoreHorizontal size={18} />, label: "更多", href: "/more" },
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
          >
            <span className="text-zinc-500 group-hover:text-accent-teal dark:group-hover:text-accent-pink transition-colors">
              {item.icon}
            </span>
            <span className="text-sm font-medium hidden md:inline">{item.label}</span>
          </a>
        ))}
      </motion.div>
      
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
         <button className="glass pill-btn p-2 rounded-full">
            <User size={20} />
         </button>
      </div>
    </nav>
  );
}
