import { getAbout } from "@/lib/strapi";
import ResumeContent from "@/components/ResumeContent";

export default async function ResumePage() {
  const about = await getAbout();

  return <ResumeContent about={about} />;
}
