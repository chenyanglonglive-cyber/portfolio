"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ content }: { content: any }) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!Array.isArray(content)) return;

    const extractedHeadings: TOCItem[] = [];
    content.forEach((block: any) => {
      if (block.type === "heading") {
        const text = block.children?.map((c: any) => c.text).join("") || "";
        const id = text ? `heading-${text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}` : `h-${Math.random()}`;
        extractedHeadings.push({
          id,
          text,
          level: block.level,
        });
      }
    });
    setHeadings(extractedHeadings);

    // Set up Intersection Observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -66%" }
    );

    // Note: We need the actual DOM elements to have these IDs.
    // Since BlocksRenderer renders them, we might need to inject IDs or rely on client-side mapping.
    // For now, let's assume we'll use a custom renderer for headings in ArticleDetail.

    return () => observer.disconnect();
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden lg:block fixed left-[max(2rem,calc(50%-45rem))] top-40 w-56 space-y-4">
      <h4 className="text-[10px] font-black tracking-widest uppercase text-zinc-500 mb-4">Contents</h4>
      <nav className="space-y-2">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`block text-xs font-bold transition-all duration-300 hover:text-emerald-400 ${
              activeId === heading.id ? "text-emerald-400 translate-x-1" : "text-zinc-600"
            } ${heading.level === 3 ? "ml-4" : ""}`}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}
