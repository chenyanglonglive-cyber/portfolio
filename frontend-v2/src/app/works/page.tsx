import WorksFilterGrid from '@/components/WorksFilterGrid';
import { queryStrapi } from '@/lib/strapi';
import { Work, normalizeWork } from '@/types/work';

export const revalidate = 3600;

async function fetchWorks(endpoint: string, fields: string): Promise<{ data: Work[]; error?: string }> {
  try {
    const data = await queryStrapi<Work[]>(`${endpoint}?${fields}`);
    return { data: data || [] };
  } catch (err) {
    const isTimeout =
      err instanceof Error && (
        err.name === 'TimeoutError' ||
        err.name === 'AbortError' ||
        /timeout|abort/i.test(err.message)
      );
    return {
      data: [],
      error: isTimeout ? '请求超时，请稍后重试' : (err instanceof Error ? `请求失败：${err.message}` : '网络请求失败'),
    };
  }
}

export default async function WorksPage() {
  const videoFields = [
    "populate[video][fields][0]=url",
    "populate[cover][fields][0]=url",
    "fields[0]=Title",
    "fields[1]=IsFeatured",
    "fields[2]=Rank",
    "fields[3]=Spend",
    "fields[4]=ROI_7D",
    "fields[5]=CTR",
    "fields[6]=Story",
    "fields[7]=LaunchDate",
    "pagination[pageSize]=50",
  ].join("&");

  const imageFields = [
    "populate[image][fields][0]=url",
    "fields[0]=Title",
    "fields[1]=IsFeatured",
    "fields[2]=Rank",
    "fields[3]=Spend",
    "fields[4]=ROI_7D",
    "fields[5]=CTR",
    "fields[6]=Story",
    "fields[7]=LaunchDate",
    "pagination[pageSize]=50",
  ].join("&");

  const [videosResult, imagesResult] = await Promise.all([
    fetchWorks('videos', videoFields),
    fetchWorks('images', imageFields),
  ]);

  const videos = videosResult.data
    .map(normalizeWork).sort((a, b) => (b.Rank || 0) - (a.Rank || 0));
  const images = imagesResult.data
    .map(normalizeWork).sort((a, b) => (b.Rank || 0) - (a.Rank || 0));

  const globalError =
    videosResult.data.length === 0 && imagesResult.data.length === 0
      ? videosResult.error || imagesResult.error || undefined
      : undefined;

  return (
    <div className="container mx-auto max-w-5xl px-8 py-20">
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 tracking-tighter uppercase pr-4">
            Portfolio <span className="text-emerald-400 ml-2 text-2xl md:text-4xl">.作品</span>
          </h1>
          <p className="text-zinc-500 max-w-xl text-lg">
            展示 9:16 及 16:9 全尺寸广告创意。
          </p>
        </div>
      </div>

      <WorksFilterGrid
        initialVideos={videos}
        initialImages={images}
        error={globalError}
      />
    </div>
  );
}
