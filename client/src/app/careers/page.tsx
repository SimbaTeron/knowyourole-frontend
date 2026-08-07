import CareersClient from "./CareersClient";
import { getCareerCatalog } from "@/lib/job-role-catalog-server";

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  try {
    const roles = await getCareerCatalog();
    return <CareersClient roles={roles} loadError={false} />;
  } catch (error) {
    console.error("[CareersPage] Failed to load career catalog:", error);
    return <CareersClient roles={[]} loadError />;
  }
}
