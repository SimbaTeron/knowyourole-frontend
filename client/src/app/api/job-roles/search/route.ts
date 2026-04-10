import { NextRequest, NextResponse } from "next/server";
import rolesData from "@/data/roles.json";

export async function GET(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  if (!q) {
    return NextResponse.json({ roles: [] }, { headers });
  }

  try {
    // Extract role names from the roles.json structure
    // The roles.json has keys like "intp-d-o-high" and each has primary/secondary roles
    const roleSet = new Set<string>();
    
    const rolesObj = rolesData.roles as Record<string, {
      primary?: { title?: string };
      secondary?: { title?: string };
    }>;
    
    for (const key of Object.keys(rolesObj)) {
      const roleEntry = rolesObj[key];
      if (roleEntry.primary?.title) {
        roleSet.add(roleEntry.primary.title.toLowerCase());
      }
      if (roleEntry.secondary?.title) {
        roleSet.add(roleEntry.secondary.title.toLowerCase());
      }
    }

    // Filter roles that start with the query string (prefix match)
    const matchingRoles = Array.from(roleSet)
      .filter(roleName => roleName.startsWith(q))
      .sort()
      .slice(0, 8);

    // Return with original casing
    const allRoleNames = Array.from(roleSet);
    const results = matchingRoles.map(lowerRole => 
      allRoleNames.find(name => name.toLowerCase() === lowerRole) || lowerRole
    ).map(roleName => ({
      roleName,
      // Find the original entry for additional data if needed
      ...Object.values(rolesObj).find(entry => 
        entry.primary?.title?.toLowerCase() === roleName.toLowerCase() ||
        entry.secondary?.title?.toLowerCase() === roleName.toLowerCase()
      )?.primary || {}
    }));

    return NextResponse.json({ roles: results }, { headers });
  } catch (err) {
    console.error("Job role search error:", err);
    return NextResponse.json(
      { error: "Failed to search roles" },
      { status: 500, headers }
    );
  }
}
