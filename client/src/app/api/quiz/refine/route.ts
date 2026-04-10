import { NextRequest, NextResponse } from "next/server";
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
  const sessionId = b.sessionId as string;
  const validationResponses = b.validationResponses as {
    mbtiMatch?: "exact" | "partial" | "not_really";
    opennessRating?: number;
  };

  if (!sessionId || !validationResponses) {
    return NextResponse.json(
      { error: "Session ID and validation responses required" },
      { status: 400, headers }
    );
  }

  try {
    // Fetch the session
    let { data: session, error: fetchError } = await getSupabaseAdmin()
      .from("quiz_results")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (fetchError || !session) {
      // Try session_id as fallback
      const { data: sessionData, error: sessionError } = await getSupabaseAdmin()
        .from("quiz_results")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (sessionError || !sessionData) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404, headers }
        );
      }
      session = sessionData;
    }

    // Get current Big Five values
    const currentBigFive = {
      O: session.big_five_o,
      C: session.big_five_c,
      E: session.big_five_e,
      A: session.big_five_a,
      N: session.big_five_n,
    };

    let adjustedBigFive = { ...currentBigFive };

    // Apply adjustments based on validation responses
    if (validationResponses.mbtiMatch === "partial") {
      const traits = ['O', 'C', 'E', 'A', 'N'] as const;
      for (const trait of traits) {
        const key = trait === 'O' ? 'O' : 
                     trait === 'C' ? 'C' : 
                     trait === 'E' ? 'E' : 
                     trait === 'A' ? 'A' : 'N';
        if (adjustedBigFive[key] > 60) adjustedBigFive[key] = Math.max(50, adjustedBigFive[key] - 5);
        else if (adjustedBigFive[key] < 40) adjustedBigFive[key] = Math.min(50, adjustedBigFive[key] + 5);
      }
    } else if (validationResponses.mbtiMatch === "not_really") {
      const traits = ['O', 'C', 'E', 'A', 'N'] as const;
      for (const trait of traits) {
        const key = trait === 'O' ? 'O' : 
                     trait === 'C' ? 'C' : 
                     trait === 'E' ? 'E' : 
                     trait === 'A' ? 'A' : 'N';
        if (adjustedBigFive[key] > 55) adjustedBigFive[key] = Math.max(45, adjustedBigFive[key] - 10);
        else if (adjustedBigFive[key] < 45) adjustedBigFive[key] = Math.min(55, adjustedBigFive[key] + 10);
      }
    }

    // Apply openness rating adjustment
    if (validationResponses.opennessRating) {
      const rating = validationResponses.opennessRating;
      if (rating <= 2) adjustedBigFive.O = Math.max(20, adjustedBigFive.O - 15);
      else if (rating >= 4) adjustedBigFive.O = Math.min(95, adjustedBigFive.O + 10);
    }

    // Update the session with adjusted Big Five
    const { data: updatedSession, error: updateError } = await getSupabaseAdmin()
      .from("quiz_results")
      .update({
        big_five_o: adjustedBigFive.O,
        big_five_c: adjustedBigFive.C,
        big_five_e: adjustedBigFive.E,
        big_five_a: adjustedBigFive.A,
        big_five_n: adjustedBigFive.N,
      })
      .eq("id", session.id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update session:", updateError);
      return NextResponse.json(
        { error: "Failed to refine quiz results" },
        { status: 500, headers }
      );
    }

    return NextResponse.json({
      success: true,
      adjustedBigFive,
      updatedResult: {
        mbtiType: session.mbti_type,
        mbtiBlend: session.mbti_blend,
        discStyle: session.disc_style,
        bigFive: adjustedBigFive,
        bigFiveProfile: {
          openness: adjustedBigFive.O,
          conscientiousness: adjustedBigFive.C,
          extraversion: adjustedBigFive.E,
          agreeableness: adjustedBigFive.A,
          neuroticism: adjustedBigFive.N,
        },
        title: session.primary_role_title,
      },
    }, { headers });
  } catch (err) {
    console.error("Quiz refinement error:", err);
    return NextResponse.json(
      { error: "Failed to refine quiz results" },
      { status: 500, headers }
    );
  }
}
