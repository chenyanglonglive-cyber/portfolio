import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="container mx-auto max-w-5xl">
      <Hero />
      
      {/* Optional: Add a 'Recent Notes' teaser like in the screenshot */}
      <div className="mt-24 px-8 opacity-60 hover:opacity-100 transition-opacity">
         <h3 className="text-sm font-mono uppercase tracking-widest mb-6">近期笔记</h3>
         <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-white/10 group cursor-pointer">
                <div>
                  <p className="text-xs text-zinc-500 font-mono mb-1">笔记 · 5 天前</p>
                  <p className="text-lg font-medium group-hover:text-accent-pink transition-colors">
                    {i === 1 ? "代码与多巴胺：我的 AI 造物日志" : "如何构建一个如丝般顺滑的个人主页"}
                  </p>
                </div>
                <div className="text-zinc-500 group-hover:translate-x-2 transition-transform">→</div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
