import HomeHero from "@/components/HomeHero";
import WorkGrid from "@/components/WorkGrid";
import { getFeaturedWorks } from "@/lib/strapi";
import { Work } from "@/types/work";
export const revalidate = 3600;

export default async function Home() {
  const featuredWorks: Work[] = await getFeaturedWorks() || [];
  
  const videos = featuredWorks.filter(w => w.Type === 'video');
  const images = featuredWorks.filter(w => w.Type === 'image');

  return (
    <div className="container mx-auto max-w-5xl px-8">
      <HomeHero />
      <WorkGrid videos={videos} images={images} />
    </div>
  );
}
