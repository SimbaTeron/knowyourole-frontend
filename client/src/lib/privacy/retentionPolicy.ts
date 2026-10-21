/**
 * Privacy windows the product actually enforces.
 * Page copy can import these later. Do not paste the numbers into a second place.
 */

/** Anonymous quiz sessions with no account are purged this many days after created_at. */
export const ANONYMOUS_RESULT_RETENTION_DAYS = 30;

/**
 * How long an anonymous deletion capability stays valid.
 * A valid request is deleted immediately; this is the window in which that request is authorized.
 */
export const DELETION_ON_REQUEST_DAYS = 30;

/** Matches PostgreSQL `INTERVAL 'n days'` (24-hour days, not calendar months). */
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Vercel cron entry that calls the purge route. The schedule is not the retention window. */
export const ANONYMOUS_RETENTION_PURGE_PATH = "/api/internal/privacy/purge";
export const ANONYMOUS_RETENTION_CRON_SCHEDULE = "17 3 * * *";

export function anonymousResultRetentionCutoff(
  now: Date,
  retentionDays = ANONYMOUS_RESULT_RETENTION_DAYS,
): Date {
  return new Date(now.getTime() - retentionDays * MS_PER_DAY);
}

export function deletionOnRequestWindowMs(days = DELETION_ON_REQUEST_DAYS): number {
  return days * MS_PER_DAY;
}

export type AnonymousSessionForPurge = {
  id: string;
  userId: string | null;
  createdAt: string;
  /** A child row is tied to an account, so the anonymous purge must leave the session alone. */
  ownedByUser: boolean;
  anonymousResultCount: number;
};

/**
 * Same candidate rule as purge_expired_anonymous_result_data in migration 006:
 * anonymous, strictly older than the retention window, and not tied to an account.
 */
export function selectAnonymousSessionsForPurge(
  rows: readonly AnonymousSessionForPurge[],
  now: Date,
  retentionDays = ANONYMOUS_RESULT_RETENTION_DAYS,
): AnonymousSessionForPurge[] {
  const cutoff = anonymousResultRetentionCutoff(now, retentionDays).getTime();
  return rows.filter((row) => {
    if (row.userId != null || row.ownedByUser) return false;
    const created = Date.parse(row.createdAt);
    return Number.isFinite(created) && created < cutoff;
  });
}

export async function purgeExpiredAnonymousResults(
  rows: readonly AnonymousSessionForPurge[],
  deleteSession: (id: string) => Promise<boolean>,
  now: Date = new Date(),
): Promise<{ deleted_sessions: number; deleted_results: number }> {
  let deleted_sessions = 0;
  let deleted_results = 0;
  for (const row of selectAnonymousSessionsForPurge(rows, now)) {
    if (await deleteSession(row.id)) {
      deleted_sessions += 1;
      deleted_results += row.anonymousResultCount;
    }
  }
  return { deleted_sessions, deleted_results };
}
