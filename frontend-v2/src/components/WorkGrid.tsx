"use client";
import { useState } from "react";
import { Play, Image as ImageIcon } from "lucide-react";
import WorkCard from "@/components/WorkCard";
import WorkModal from "@/components/WorkModal";
import { Work } from "@/types/work";

interface WorkGridProps {
  videos: Work[];
  images: Work[];
}

export default function WorkGrid({ videos, images }: WorkGridProps) {
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWorkClick = (work: Work) => {
    setSelectedWork(work);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Featured Videos */}
      <section className="mb-32">
        <h2 className="text-2xl font-bold mb-12 flex items-center gap-3 italic bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
          <Play size={24} className="text-emerald-400 not-italic" /> FEATURED VIDEOS <span className="text-zinc-400 not-italic ml-2 font-light">.视频精选</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {videos.map((work) => (
            <div key={work.documentId} onClick={() => handleWorkClick(work)} className="cursor-pointer">
              <WorkCard work={work} />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Images */}
      <section className="mb-32">
        <h2 className="text-2xl font-bold mb-12 flex items-center gap-3 italic bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 pb-1">
          <ImageIcon size={24} className="text-emerald-400 not-italic shrink-0" /> FEATURED VISUALS <span className="text-zinc-400 not-italic ml-2 font-light">.视觉精选</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {images.map((work) => (
            <div key={work.documentId} onClick={() => handleWorkClick(work)} className="cursor-pointer">
              <WorkCard work={work} />
            </div>
          ))}
        </div>
      </section>

      <WorkModal 
        work={selectedWork} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
