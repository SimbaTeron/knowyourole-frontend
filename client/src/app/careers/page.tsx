import CareersClient from "./CareersClient";
import { FALLBACK_CAREER_CATALOG } from "@/data/careerCatalog";
import { getCareerCatalog } from "@/lib/job-role-catalog-server";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata("/careers");

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  try {
    const roles = await getCareerCatalog();
    return <CareersClient roles={roles} loadError={false} />;
  } catch (error) {
    console.error("[CareersPage] Failed to load managed catalog; serving checked-in public fallback:", error);
    return <CareersClient roles={FALLBACK_CAREER_CATALOG} loadError={false} />;
  }
}
