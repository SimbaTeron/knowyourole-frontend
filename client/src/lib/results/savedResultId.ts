declare const savedResultIdBrand: unique symbol;

/**
 * A quiz_results id that was actually written. The fit and direction cards take
 * this type so an unsaved fallback id cannot be passed through as a string.
 */
export type SavedResultId = string & { readonly [savedResultIdBrand]: "SavedResultId" };

const LOCAL_RESULT_PREFIX = "local-";

export type ResultStorageMeta = {
  resultId?: string | null;
  storage?: "saved" | "local" | null;
};

/** Id shape used only on the unpersisted compute fallback. */
export function localResultId(resultId: string): string {
  return resultId.startsWith(LOCAL_RESULT_PREFIX) ? resultId : `${LOCAL_RESULT_PREFIX}${resultId}`;
}

export function isLocalResultId(resultId: string): boolean {
  return resultId.startsWith(LOCAL_RESULT_PREFIX);
}

/**
 * Saved rows, including ones stored before `storage` existed, keep their server id.
 * The unpersisted fallback rewrites the id with a local prefix and sets storage to "local".
 */
export function toSavedResultId(meta: ResultStorageMeta | null | undefined): SavedResultId | null {
  const resultId = meta?.resultId?.trim() ?? "";
  if (!resultId || isLocalResultId(resultId) || meta?.storage === "local") return null;
  if (meta?.storage === "saved" || meta?.storage == null) return resultId as SavedResultId;
  return null;
}

export function markResultSaved<T extends { meta: ResultStorageMeta }>(result: T): T {
  return { ...result, meta: { ...result.meta, storage: "saved" } };
}
