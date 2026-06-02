"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail } from "lucide-react";
import { useState } from "react";

const Icons = {
  Phone: () => (
    <Phone size={18} className="md:w-5 md:h-5" />
  ),
  Email: () => (
    <Mail size={18} className="md:w-5 md:h-5" />
  ),
  Wechat: () => (
    <svg viewBox="0 0 1024 1024" className="w-[18px] h-[18px] md:w-5 md:h-5" fill="currentColor">
      <path d="M506.942 345.921c25.259 0 42.134-16.916 42.134-42.107 0-25.477-16.848-41.956-42.134-41.956-25.299 0-50.668 16.48-50.668 41.956 0.028 25.204 25.409 42.107 50.668 42.107v0z" />
      <path d="M271.257 261.857c-25.259 0-50.79 16.48-50.79 41.956 0 25.19 25.532 42.107 50.79 42.107 25.163 0 42.012-16.916 42.012-42.107-0.014-25.477-16.834-41.956-42.012-41.956v0z" />
      <path d="M1010.654 615.492c0-133.202-123.563-246.702-275.237-258.512 0.205-1.652 0.301-3.373-0.068-5.092-30.406-141.79-182.886-248.695-354.7-248.695-194.15 0-352.119 135.387-352.119 301.793 0 89.279 45.574 169.725 131.946 233.158l-30.106 90.508c-1.939 5.885-0.177 12.37 4.506 16.452 2.853 2.458 6.445 3.741 10.076 3.741 2.335 0 4.697-0.546 6.867-1.625l113.036-56.565 13.926 2.827c34.802 7.154 64.853 13.353 101.868 13.353 10.895 0 40.878-3.987 43.404-7.182 40.755 101.99 153.094 175.61 285.273 175.61 33.86 0 68.13-8.164 98.891-15.866l87.136 47.636c2.307 1.257 4.847 1.911 7.359 1.911 3.441 0 6.881-1.161 9.639-3.413 4.847-3.932 6.841-10.404 5.038-16.33l-22.255-74.001c74.602-58.955 115.521-129.488 115.521-199.708v0zM409.798 665.75c-9.626 0.833-19.388 1.243-29.082 1.243-32.686 0-60.334-5.652-92.31-12.26l-18.582-3.755c-3.195-0.683-6.567-0.245-9.503 1.269l-81.687 40.892 21.231-63.775c2.076-6.24-0.205-13.053-5.57-16.821-82.070-57.207-123.659-126.894-123.659-207.093 0-144.179 139.087-261.516 310.067-261.516 151.142 0 284.959 91.955 312.579 214.261-158.475 2.076-286.706 113.487-286.706 250.32 0 19.893 3.018 39.171 8.11 57.767-1.542-0.382-3.168-0.683-4.887-0.532v0zM860.371 788.699c-4.875 3.673-6.935 10.007-5.188 15.852l13.804 45.903-56.647-30.993c-2.157-1.188-4.588-1.803-7.004-1.803-1.188 0-2.389 0.15-3.564 0.464-30.379 7.674-61.822 15.593-92.433 15.593-142.186 0-257.857-97.717-257.857-217.811 0-120.095 115.658-217.771 257.857-217.771 139.469 0 257.325 99.724 257.325 217.771 0 59.87-37.738 121.255-106.291 172.797v0z" />
      <path d="M616.454 506.006c-16.848 0-33.696 16.971-33.696 33.792 0 16.944 16.848 33.669 33.696 33.669 25.313 0 42.038-16.725 42.038-33.669 0-16.848-16.725-33.792-42.038-33.792v0z" />
      <path d="M801.58 506.006c-16.603 0-33.451 16.971-33.451 33.792 0 16.944 16.848 33.669 33.451 33.669 25.231 0 42.257-16.725 42.257-33.669 0-16.848-16.998-33.792-42.257-33.792v0z" />
    </svg>
  )
};

export default function Socials() {
  const [hovered, setHovered] = useState<string | null>(null);

  const socials = [
    {
      id: "phone",
      name: "电话",
      icon: <Icons.Phone />,
      href: "tel:13678178194",
      content: "13678178194"
    },
    { 
      id: "email",
      name: "邮箱", 
      icon: <Icons.Email />, 
      href: "mailto:459361040@qq.com", 
      content: "459361040@qq.com" 
    },
    { 
      id: "wechat",
      name: "微信", 
      icon: <Icons.Wechat />, 
      href: "#", 
      isQR: true 
    },
  ];

  return (
    <div className="fixed top-8 right-4 md:right-8 z-50 flex items-center gap-2 md:gap-3">
      {socials.map((social, i) => (
        <motion.div
          key={social.id}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: "circOut" }}
          className={`glass p-2.5 md:p-3 rounded-full flex items-center justify-center shadow-2xl border relative cursor-pointer group transition-all duration-300 ${
            hovered === social.id 
              ? 'border-emerald-400/50 bg-emerald-400/10 shadow-[0_0_15px_rgba(52,211,153,0.2)]' 
              : 'border-emerald-500/25 bg-emerald-950/20'
          }`}
          onMouseEnter={() => setHovered(social.id)}
          onMouseLeave={() => setHovered(null)}
        >
          <a
            href={social.href}
            className={`flex items-center justify-center transition-all duration-300 ${
              hovered === social.id ? 'text-emerald-300 scale-110' : 'text-emerald-400'
            }`}
          >
            {social.icon}
          </a>

          {/* Popover 弹出气泡 */}
          <AnimatePresence>
            {hovered === social.id && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 10, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="absolute top-full mt-3 md:mt-4 right-0 z-50 pointer-events-none"
              >
                <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 px-3.5 py-2 rounded-2xl shadow-2xl min-w-max relative flex flex-col items-center">
                  {social.isQR ? (
                    <div className="w-28 h-28 md:w-32 md:h-32 p-2 bg-white rounded-xl overflow-hidden shadow-inner">
                      <img 
                        src="/wechat-qr.png" 
                        alt="Wechat QR" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <span className="text-emerald-400 font-mono text-xs md:text-sm font-bold tracking-tight px-1 py-0.5">
                      {social.content}
                    </span>
                  )}
                  {/* 指向上方的箭头 */}
                  <div className="absolute bottom-full right-4 md:right-5 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[5px] border-b-zinc-900/95 md:border-l-[6px] md:border-r-[6px] md:border-b-[6px]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
