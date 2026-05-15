import WorksFilterGrid from '@/components/WorksFilterGrid';
import { getWorks } from '@/lib/strapi';

export default async function WorksPage() {
  const initialWorks = await getWorks();

  return (
    <div className="container mx-auto max-w-5xl px-8 py-20">
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 tracking-tighter uppercase italic pr-4">
            Portfolio <span className="text-emerald-400 not-italic ml-2 text-2xl md:text-4xl">.作品</span>
          </h1>
          <p className="text-zinc-500 max-w-xl text-lg">
            展示 9:16 及 16:9 全尺寸广告创意。
          </p>
        </div>
      </div>

      <WorksFilterGrid initialWorks={initialWorks} />
    </div>
  );
}
