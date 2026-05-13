"use client";

import { motion } from "framer-motion";
import { Home, FileText, Briefcase, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const pathname = usePathname();

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
        {navItems.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={i}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group hover:bg-white hover:text-black ${
                isActive ? "text-white" : "text-white/70"
              }`}
            >
              <span className={`transition-colors group-hover:text-black ${
                isActive ? "text-white" : "text-white/70"
              }`}>
                {item.icon}
              </span>
              <span className="text-sm font-bold hidden md:inline uppercase tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </motion.div>
    </nav>
  );
}
