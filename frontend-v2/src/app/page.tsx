import HomeHero from "@/components/HomeHero";
import WorkGrid from "@/components/WorkGrid";
import AIWorkflowGrid from "@/components/AIWorkflowGrid";
import { getFeaturedWorks } from "@/lib/strapi";
import { getWorkType, getWorkVideoUrl } from "@/types/work";

export const revalidate = 3600;

export default async function Home() {
  const featuredWorks = await getFeaturedWorks();

  const videos = featuredWorks.filter(w => getWorkType(w) === 'video' && getWorkVideoUrl(w));
  const images = featuredWorks.filter(w => getWorkType(w) === 'image');

  return (
    <div className="container mx-auto max-w-5xl px-8">
      <HomeHero />
      <AIWorkflowGrid />
      <WorkGrid videos={videos} images={images} />
    </div>
  );
}
