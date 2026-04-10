import { NextRequest, NextResponse } from "next/server";
import { analyzeRoleFitFromDB } from "@/app/api/_lib/scoring";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";

export async function POST(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers });
  }

  const b = body as Record<string, unknown>;
  const dreamRole = b.dreamRole as string;
  const bigFive = b.bigFive as { O?: number; C?: number; E?: number; A?: number; N?: number };
  const mbtiType = b.mbtiType as string;
  const discStyle = b.discStyle as string;

  if (!dreamRole || !bigFive) {
    return NextResponse.json(
      { error: "Dream role and personality data required" },
      { status: 400, headers }
    );
  }

  try {
    // Look up the role in the job_roles table from Supabase
    const { data: roleData, error: roleError } = await getSupabaseAdmin()
      .from("job_roles")
      .select("*")
      .ilike("role_name", dreamRole)
      .limit(1)
      .single();

    if (roleError || !roleData) {
      return NextResponse.json(
        { error: "Role not found in database. Please select a role from the suggestions." },
        { status: 404, headers }
      );
    }

    const roleAnalysis = analyzeRoleFitFromDB(roleData, bigFive, mbtiType, discStyle);

    return NextResponse.json({
      success: true,
      analysis: roleAnalysis,
    }, { headers });
  } catch (err) {
    console.error("Role fit analysis error:", err);
    return NextResponse.json(
      { error: "Failed to analyze role fit" },
      { status: 500, headers }
    );
  }
}
