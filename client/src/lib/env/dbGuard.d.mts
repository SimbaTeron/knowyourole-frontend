export declare const REAL_DB_OPT_IN_VAR: "KYR_ALLOW_REAL_DB";
export declare function isHostedSupabaseUrl(url: string | undefined): boolean;
export declare function checkSupabaseTarget(env: Record<string, string | undefined>): { ok: true } | { ok: false; reason: string };
export declare function assertSafeSupabaseTarget(env?: Record<string, string | undefined>): void;
