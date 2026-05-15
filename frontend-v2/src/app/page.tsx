import HomeHero from "@/components/HomeHero";
import WorkGrid from "@/components/WorkGrid";
import { getFeaturedWorks } from "@/lib/strapi";

export default async function Home() {
  const featuredWorks = await getFeaturedWorks();
  
  const videos = featuredWorks.filter(w => w.Type === 'video' && w.Video?.url);
  const images = featuredWorks.filter(w => w.Type === 'image');

  return (
    <div className="container mx-auto max-w-5xl px-8">
      <HomeHero />
      <WorkGrid videos={videos} images={images} />
    </div>
  );
}
