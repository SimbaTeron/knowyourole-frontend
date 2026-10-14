import { validateResultDTO, type ResultDTO } from "@/lib/results/buildResultDTO";

/** Minimal database row required to read a persisted canonical quiz result. */
export interface PersistedQuizResultRow {
  id: string;
  user_id: string | null;
  session_id: string | null;
  responses: unknown;
  created_at: string | null;
  updated_at?: string | null;
  deleted?: boolean | null;
}

export interface PersistedQuizResultSummary {
  id: string;
  sessionId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deleted: boolean;
  tier: string;
  mood: string | null;
  funMode: boolean;
  landmark: string | null;
  mbtiType: string;
  mbtiBlend: string;
  discStyle: string;
  bigFive: { O: number; C: number; E: number; A: number; N: number };
  primaryRoleTitle: string | null;
  secondaryRoleTitle: string | null;
  criticalThinking: number | null;
  firstPrinciples: number | null;
  totalQuestions: number;
  avgResponseTime: number | null;
  engagementScore: number | null;
}

/**
 * `responses.dto` is the sole persisted result contract. Legacy scalar columns
 * were removed after every existing row had been verified against this DTO.
 */
export function readPersistedQuizResultDTO(row: Pick<PersistedQuizResultRow, "id" | "responses">): ResultDTO {
  const dto = row.responses && typeof row.responses === "object" && !Array.isArray(row.responses)
    ? (row.responses as { dto?: unknown }).dto
    : undefined;
  const validation = validateResultDTO(dto);
  if (!validation.ok) {
    throw new Error(`Persisted result ${row.id} does not contain a valid canonical ResultDTO: ${validation.errors.join(", ")}`);
  }
  return dto as ResultDTO;
}

/**
 * Compatibility projection for legacy clients and account-history APIs.
 * Values are derived at read time, never redundantly stored as database columns.
 */
export function summarizePersistedQuizResult(row: PersistedQuizResultRow): PersistedQuizResultSummary {
  const dto = readPersistedQuizResultDTO(row);
  const legacyAdvanced = dto.scores.extensions?.legacyAdvanced as Record<string, unknown> | undefined;
  const readNumber = (value: unknown): number | null => typeof value === "number" && Number.isFinite(value) ? value : null;
  const trait = (code: "O" | "C" | "E" | "A" | "N") => dto.scores.bigFive.traits[code].normalized;

  return {
    id: row.id,
    sessionId: row.session_id ?? dto.meta.sessionId,
    createdAt: row.created_at ?? dto.meta.createdAt,
    updatedAt: row.updated_at ?? dto.meta.updatedAt,
    deleted: row.deleted ?? dto.meta.deleted,
    tier: dto.raw.tier,
    mood: dto.raw.mood ?? null,
    funMode: dto.raw.funMode ?? false,
    landmark: dto.raw.locality?.landmark ?? null,
    mbtiType: dto.scores.mbti.type,
    mbtiBlend: `${dto.scores.mbti.type}-${dto.scores.disc.primary}`,
    discStyle: dto.scores.disc.primary,
    bigFive: { O: trait("O"), C: trait("C"), E: trait("E"), A: trait("A"), N: trait("N") },
    primaryRoleTitle: dto.careerMatches[0]?.title ?? dto.careerDirection.title ?? null,
    secondaryRoleTitle: dto.careerMatches[1]?.title ?? null,
    criticalThinking: readNumber(legacyAdvanced?.criticalThinking),
    firstPrinciples: readNumber(legacyAdvanced?.firstPrinciples),
    totalQuestions: dto.audit.scoringAudit?.totalQuestions ?? dto.raw.responses.length,
    avgResponseTime: dto.scores.adaptive.averageResponseTime ?? null,
    engagementScore: readNumber(legacyAdvanced?.engagement),
  };
}
