import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import {
  isResultEmailDeliveryConfigured,
  sendResultSummaryEmail,
} from "./emailDelivery";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const optionalUuid = z
  .union([z.string().uuid(), z.literal(""), z.null(), z.undefined()])
  .transform((value) => (typeof value === "string" && value.length > 0 ? value : null));

const optionalText = (maxLength: number) =>
  z
    .union([z.string().trim().max(maxLength), z.literal(""), z.null(), z.undefined()])
    .transform((value) => (typeof value === "string" && value.length > 0 ? value : null));

const resultEmailLeadSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(254, "Email is too long"),
  sessionId: optionalUuid,
  resultId: optionalUuid,
  mbtiType: optionalText(12),
  discStyle: optionalText(40),
  primaryRoleTitle: optionalText(120),
  consentResultSummary: z.literal(true, {
    errorMap: () => ({ message: "Consent is required to save this email" }),
  }),
  consentMarketing: z.boolean().optional().default(false),
});

type FieldErrors = Record<string, string>;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400, headers: corsHeaders },
      );
    }

    const parsed = resultEmailLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email lead request",
          fieldErrors: toFieldErrors(parsed.error),
        },
        { status: 400, headers: corsHeaders },
      );
    }

    const lead = parsed.data;
    const normalizedEmail = lead.email.trim().toLowerCase();
    const deliveryConfigured = isResultEmailDeliveryConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("result_email_leads")
      .insert({
        email: lead.email.trim(),
        normalized_email: normalizedEmail,
        session_id: lead.sessionId,
        result_id: lead.resultId,
        mbti_type: lead.mbtiType,
        disc_style: lead.discStyle,
        primary_role_title: lead.primaryRoleTitle,
        source: "results_page",
        consent_result_summary: true,
        consent_marketing: lead.consentMarketing,
        delivery_requested: true,
        delivery_status: deliveryConfigured ? "queued" : "not_sent",
        user_agent: req.headers.get("user-agent"),
        referrer: req.headers.get("referer") ?? req.headers.get("referrer"),
        updated_at: new Date().toISOString(),
      })
      .select("id, delivery_status")
      .single();

    if (error) {
      console.error("[POST /api/results/email-lead] insert failed", {
        code: error.code,
        message: error.message,
      });
      return NextResponse.json(
        { success: false, error: "Failed to save email lead" },
        { status: 500, headers: corsHeaders },
      );
    }

    const delivery = await sendResultSummaryEmail({
      leadId: data.id,
      email: lead.email.trim(),
      mbtiType: lead.mbtiType,
      discStyle: lead.discStyle,
      primaryRoleTitle: lead.primaryRoleTitle,
    });

    if (delivery.status !== data.delivery_status) {
      const { error: updateError } = await supabase
        .from("result_email_leads")
        .update({
          delivery_status: delivery.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id);

      if (updateError) {
        console.error("[POST /api/results/email-lead] delivery status update failed", {
          code: updateError.code,
          message: updateError.message,
        });
      }
    }

    return NextResponse.json(
      { success: true, id: data.id, deliveryStatus: delivery.status },
      { status: 201, headers: corsHeaders },
    );
  } catch (error) {
    console.error("[POST /api/results/email-lead] fatal error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: corsHeaders },
    );
  }
}

function toFieldErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}
