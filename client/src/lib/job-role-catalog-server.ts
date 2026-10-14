import "server-only";

import { FALLBACK_CAREER_CATALOG, CAREER_CATALOG_MINIMUM } from "@/data/careerCatalog";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import { CareerCatalogRole } from "@/lib/job-role-catalog";
import { z } from "zod";

const jobRoleRowSchema = z.object({
  role_number: z.number().int().nonnegative(),
  role_name: z.string().trim().min(1),
  category: z.string().trim().min(1),
});

/** Fetches the current public catalog for server-rendered Career Paths HTML. */
export async function getCareerCatalog(): Promise<CareerCatalogRole[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("job_roles")
    .select("role_number, role_name, category")
    .order("role_number", { ascending: true });

  if (error) throw new Error(`Career catalog query failed: ${error.message}`);

  const catalog = z.array(jobRoleRowSchema).parse(data ?? []).map((role) => ({
    id: role.role_number,
    roleName: role.role_name,
    category: role.category,
  }));

  // A partially seeded database should never make the public product look like a
  // thin prototype. The checked-in catalog remains the reliable public baseline.
  return catalog.length >= CAREER_CATALOG_MINIMUM ? catalog : FALLBACK_CAREER_CATALOG;
}
