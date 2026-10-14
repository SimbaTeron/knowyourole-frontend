import { z } from "zod";

/**
 * The public shape consumed by the Career Paths UI.
 * Keep this separate from the database row shape returned by Supabase.
 */
export type CareerCatalogRole = {
  id: number;
  roleName: string;
  category: string;
};

const jobRoleApiRecordSchema = z.object({
  role_number: z.number().int().nonnegative(),
  role_name: z.string().trim().min(1),
  category: z.string().trim().min(1),
});

const jobRolesResponseSchema = z.object({
  success: z.literal(true),
  count: z.number().int().nonnegative(),
  jobRoles: z.array(jobRoleApiRecordSchema),
});

/**
 * Converts the API's explicitly versioned envelope into the minimal model the
 * public catalog needs. Zod rejects malformed API responses before they reach
 * rendering code, so a bad response becomes a recoverable query error rather
 * than a render-time exception or a misleading empty catalog.
 */
export function parseJobRolesResponse(payload: unknown): CareerCatalogRole[] {
  const response = jobRolesResponseSchema.parse(payload);

  return response.jobRoles.map((role) => ({
    id: role.role_number,
    roleName: role.role_name,
    category: role.category,
  }));
}
