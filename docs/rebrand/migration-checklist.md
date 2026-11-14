# Domain migration checklist: knowyourole.com → whatcareerfits.com

Status: **research only**. No repo, DNS, Vercel, or Supabase changes were made while writing this.
Prepared: Saturday, Nov 14, 2026, afternoon Pacific Time (America/Los_Angeles).
Approved decisions already in force: brand **What Career Fits**; ship wording together with cutover; text-only logo first; inbound `info@whatcareerfits.com` via Porkbun forwarding; keep `/work-style-quiz`.

Sources: live `https://knowyourole.com` headers and sitemap (97 URLs); named files on `main` in `SimbaTeron/knowyourole-frontend` (`client/`). GitHub code search is not indexed for this repo. A Vercel API read of project `prj_xfRh2KAfdnUsctAthiHGWEJuWRAz` (team `alfredv2`) was refused (403) in this session, so domain-attach and env-var details below rely on the already-reported project state plus live-header checks, not a fresh dashboard dump.

## Current state (confirmed today)

| Item | Status |
|---|---|
| New domain registered at Porkbun | Yes. `whatcareerfits.com` is yours, good until Nov 14, 2027. |
| Old domain expiry | **knowyourole.com expires Saturday, Nov 28, 2026 at 6:39 PM PT.** Renew it and turn on auto-renew before then. Keep it for years (ideally for the life of the site). |
| Vercel project | “client” (`prj_xfRh2KAfdnUsctAthiHGWEJuWRAz`, team `team_dQ6Aymp8Ap0mCHkQNnTtP5lj`). Parent report: `whatcareerfits.com` and `www.whatcareerfits.com` (308 → apex) already added. **Porkbun DNS is still pending.** |
| Live old site | `https://knowyourole.com` serves the app (Vercel, 200). `https://www.knowyourole.com/` returns **308** to `https://knowyourole.com/`. Query strings are preserved (`/quiz?ref=test` stayed intact). |
| Live new site | As of this afternoon, `https://whatcareerfits.com` and `www` return **302** to `https://whatcareerfits-com.l.ink` (Porkbun parking). This is a risk if Google crawls the new domain before DNS is pointed at Vercel. |
| Search Console | Domain property for `knowyourole.com` is already verified via TXT at Porkbun. |
| Analytics | Consent-based GA4, measurement ID `G-QGQ9STMV74` (from `NEXT_PUBLIC_GA_MEASUREMENT_ID` or that code fallback). Collection is **hostname-gated** to `knowyourole.com` only. |
| Backend | Supabase `rflvyrcoczhrmmpkowch`. Auth0 is also wired in production (`NEXT_PUBLIC_AUTH0_DOMAIN` / CSP allow `dev-f0lrnyg4uigdvae1.us.auth0.com`). |
| Sitemap | 97 public URLs, all on `https://knowyourole.com`. Home canonical has **no trailing slash**. `/results` is noindex and not in the sitemap, but shared result links still need redirects. `/schools` is a **404** today and is not in the sitemap. |
| Middleware | **N/A.** There is no `middleware.ts`. Redirects today come from `next.config.ts` (`canonicalHostRedirects()` for www → apex) and from Vercel domain redirects. |
| hreflang | **N/A.** `alternates` in `client/src/lib/seo.ts` is canonical only. |
| Vercel Analytics / Speed Insights package | **N/A** in `client/package.json`. Check the Vercel dashboard only if you turned it on there. |
| Site URL in code | Hardcoded `SITE_URL = "https://knowyourole.com"` and `SITE_NAME = "KnowYouRole"` in `client/src/lib/seo.ts`. It is **not** read from a `NEXT_PUBLIC_SITE_URL` env var. Sitemap, robots, canonicals, and most JSON-LD follow this constant. `SeoContentPage.tsx` currently hardcodes `https://knowyourole.com` and bypasses the constant — that must be fixed in the same PR. |

HTTP→HTTPS for the old apex could not be verified from this environment (plain `http://` requests were intercepted and returned 500 from a `Pingora` proxy, never reached Vercel). Confirm from a normal browser before cutover that `http://knowyourole.com` and `http://whatcareerfits.com` upgrade to HTTPS.

---

## How to use this list

Each item has an **owner**, **phase**, a concrete **action**, and **how to verify**. “User” means you (Porkbun, Google, Auth0, Resend, X, renewals, and approval of any copy PR). “Alfred” means I implement or check, then stop before anything irreversible unless you have already approved that exact step.

Redirects should be **permanent (301 or 308)** and **kept as long as the old domain is renewed — ideally forever, and at least one year.** Google treats 308 like 301 for this purpose. Vercel domain redirects are already 308 for www; that is fine. Aim for **one hop**: old host (www or apex) → `https://whatcareerfits.com` + the same path and query, not www.old → old apex → new apex.

---

## A. SEO

| # | Item | Phase | Owner | Action | Verify |
|---|---|---|---|---|---|
| A1 | Page-to-page permanent redirects | 2 | Alfred, with your OK | After the new apex is the production domain, attach **301/308 redirects** on Vercel for `knowyourole.com` and `www.knowyourole.com` → `https://whatcareerfits.com/:path*` (and the bare `/` → `https://whatcareerfits.com`). Include **every sitemap path (97 URLs)**, plus noindex routes people may have bookmarked (`/results`, `/auth`, `/callback`, `/profile`, `/checkout-success`, `/checkout-cancel`). Preserve **query strings** (result session IDs, `?ref=`). Update `canonicalHostRedirects()` so it no longer sends www.old → old apex (that would create a double hop). Keep `www.whatcareerfits.com` 308 → new apex (already reported as added). | Curl, without following redirects, a sample of: `/`, `/quiz`, `/quiz?ref=test`, `/for-schools`, `/for-counselors`, `/work-style-quiz`, `/career-quiz-for-teens`, `/student-data`, `/results?` (use a real session if you have one), and one `/compare/…` and `/learn/…` URL. Expect **308 or 301**, `Location` on `https://whatcareerfits.com` with the **same path and query**, one hop. Then follow the redirect and confirm **200**. |
| A2 | `/schools` 404 | 2 | Alfred (in the same PR) | `/schools` is already 404 on the live site. Add a permanent redirect `/schools` → `/for-schools` on the **new** host, and make sure the old-host redirect still lands on `/schools` so the chain becomes old `/schools` → new `/schools` → `/for-schools`, or (better) old `/schools` → new `/for-schools` in one hop if Vercel allows a path rewrite. | `https://knowyourole.com/schools` ends at `https://whatcareerfits.com/for-schools` with a 200. |
| A3 | Canonical tags | 2 | Alfred | Change `SITE_URL` to `https://whatcareerfits.com`. Fix `SeoContentPage.tsx` to use `SITE_URL` instead of a hardcoded old URL. Home canonical must stay **without** a trailing slash, matching today’s sitemap. | View-source on `/`, `/quiz`, `/for-schools`: `<link rel="canonical">` and `og:url` are `https://whatcareerfits.com…`. |
| A4 | Hardcoded site URL / env | 2 | Alfred; user if a Vercel env exists | Code uses hardcoded `SITE_URL`, not `NEXT_PUBLIC_SITE_URL`. Also check Vercel envs (I could not list them this session) for `PUBLIC_URL`, `APP_URL`, `NEXT_PUBLIC_APP_URL`, and `NEXT_PUBLIC_API_URL`. Stripe checkout builds success/cancel URLs from `NEXT_PUBLIC_APP_URL` or `APP_URL` or the request origin (`getAppOrigin` in `security.ts`). Set or update those to `https://whatcareerfits.com` at cutover if they are present. Do **not** point production `PUBLIC_URL` at a preview URL. | After deploy, checkout success URLs (if used) and canonicals all use the new origin. |
| A5 | `sitemap.xml` and `robots.txt` | 2 | Alfred | Both are generated from `SITE_URL` (`client/src/app/sitemap.ts`, `robots.ts`). They will flip when the PR deploys. | `https://whatcareerfits.com/sitemap.xml` lists 97 URLs on the new host. `robots.txt` has `Sitemap: https://whatcareerfits.com/sitemap.xml` and the same disallows as today (`/auth`, `/callback`, `/profile`, `/checkout-success`, `/checkout-cancel`, `/checkout/success`, `/checkout/cancel`, `/api`). Old `/sitemap.xml` should **308/301** to the new sitemap (or serve a sitemap that only contains new-host URLs after the app is cut over — do not leave a sitemap of old URLs on the old host once it only redirects). |
| A6 | hreflang | — | — | **N/A.** None present. | — |
| A7 | JSON-LD | 2 | Alfred | Organization / WebSite / EducationalApplication `@id` and `url` follow `SITE_URL`. Update the Organization `email` to `info@whatcareerfits.com` and the description/name per the approved wording. `sameAs` is currently `[]` — add your X profile later if you want, not required for cutover. Quiz JSON-LD on `/quiz` also uses `SITE_URL`. | View-source: JSON-LD `url` and `@id` use `https://whatcareerfits.com`. |
| A8 | OG / Twitter image URLs | 2 | Alfred | Cards are generated at `/og?title=…&path=…` and absolutized with `SITE_URL`. The image itself draws “KnowYouRole” and “knowyourole.com” in `client/src/app/og/route.tsx`. Update the wordmark and domain in that image, and the title-strip regex in `ogCardInput.ts` / `seo.ts`. | Share a staging or just-cut-over URL in the Facebook/Twitter debugger (or open `/og?title=Test&path=/`) and confirm the new name and domain. `og:image` is an absolute `https://whatcareerfits.com/og?…` URL. |
| A9 | Internal absolute links | 2 | Alfred | Most internal links are relative (safe). Exceptions already inventoried: `SeoContentPage.tsx`, share/PDF/email copy, results share cards, school allowlist, print footers. Replace those in the wording + cutover PR. Do not rename CSS `kyr-` hooks or `knowrole-` localStorage keys. | Search the built page source for `knowyourole.com` on `/`, `/quiz`, `/for-schools`, and a learn page; only expected leftover is “this used to be…” or none. |
| A10 | Search Console — new Domain property | 1–2 | **User** | Add a **Domain** property for `whatcareerfits.com` (covers apex and www). Google will give a TXT record. Add it at Porkbun on the new domain, then verify. You can start this as soon as you can put a TXT record on the domain (after or with DNS). | Property status is Verified. |
| A11 | Change of Address tool | 2 (after 301s are live) | **User** | In the **old** `knowyourole.com` property, use Google’s Change of Address tool and point it at the new verified property. Do this only after permanent redirects and the new canonicals are live. | Google accepts the move. Keep the confirmation. |
| A12 | Resubmit sitemap; keep the old property | 2–3 | User (Alfred can remind) | In the **new** property, submit `https://whatcareerfits.com/sitemap.xml`. **Keep the old Domain property** for at least a year (longer is better) so you can watch 404s and the move. Do not delete it. | New property shows the sitemap as fetched, no “couldn’t fetch” error. Old property still exists. |
| A13 | Bing Webmaster Tools | 1–2 | **User** | If a Bing / IndexNow account exists, add `whatcareerfits.com`, verify (usually CNAME or TXT at Porkbun), and submit the new sitemap. If you never opened Bing, this is optional but cheap. Bing has no Change of Address tool as complete as Google’s; redirects do the work. | Bing shows the site verified and the sitemap submitted, or you confirm you are skipping Bing. |
| A14 | Expected ranking dip | 3 | Alfred (explain); User (patience) | A temporary dip is normal while Google recrawls 97 URLs and retargets queries. The exact-match name “what career fits me” should help clicks once pages are recrawled. Do not strip 301s early, and do not make more title experiments during the first month unless something is broken. | Watch impressions/clicks in both GSC properties at T+7, T+14, T+30, T+90. The Nov 23 Search Console counselor check should include this move. |
| A15 | How long to keep redirects | 3+ | **User** (renewal) + Alfred (don’t remove them) | Keep 301/308 **permanently**, as long as `knowyourole.com` is renewed. One year is the minimum; forever is the goal. A lapse on Nov 28 would drop the redirects and break old links, posts, and GSC history. | Calendar reminder each year to renew `knowyourole.com`. Redirects still tested after renewal. |
| A16 | Monitor 404s and indexed pages | 3 | Alfred on a schedule; User in GSC if needed | After cutover, check GSC **Pages** (indexed, not indexed, 404/soft 404) on both properties, plus Vercel logs for 404 paths. Fix anything important with an extra redirect rather than hoping Google forgets it. | No wave of new 404s on high-value paths. Indexed count on the new host rises as the old host’s indexed count falls. |

---

## B. Analytics

| # | Item | Phase | Owner | Action | Verify |
|---|---|---|---|---|---|
| B1 | GA4 data stream domain | 2 | **User** (GA4 admin) | In GA4, keep the existing property/stream (`G-QGQ9STMV74`) so history is not split. Update the data-stream website URL to `https://whatcareerfits.com`. Add the new domain as a configured stream URL if the UI asks. | Realtime (with consent accepted on a test browser) shows a hit on `whatcareerfits.com` after cutover. |
| B2 | Cross-domain / referral exclusions | 2 | **User** | Add `knowyourole.com` and `whatcareerfits.com` (and www of each) to the referral exclusion list so a 301 hop is not counted as referral traffic. Cross-domain linking is not required if users are fully redirected and do not browse both hosts at once. | A click from an old link does not appear as a referral from knowyourole.com. |
| B3 | Hostname collection gate — **do not miss this** | 2 | Alfred | `CANONICAL_ANALYTICS_HOST` in `client/src/lib/analytics/collectionGate.ts` is hardcoded to `knowyourole.com`. The tag **will not load** on the new host until this (and the www host in `productionHost.ts`) is updated in the same deploy as the domain switch. | On `https://whatcareerfits.com` with analytics accepted, the GA script loads. On a `*.vercel.app` preview, it still does **not** load (today’s rule). |
| B4 | Event names | 2 | Alfred | Events are prefixed `kyr_` and categorized as `knowyourole_quiz`, `knowyourole_results`, etc. **Leave those category strings alone** unless you accept a break in historical GA event reporting. They are not user-facing. | Existing explorations still show `kyr_quiz_started` etc. after cutover. |
| B5 | Consent banner domain | 2 / 3 (user impact) | Alfred (no code domain change needed); User (awareness) | Consent is stored in **localStorage** under `kyr_cookie_consent`, not a first-party cookie. It is origin-scoped, so it **will not carry over** from the old host. Returning visitors will see the banner again. The banner copy does not name the domain. No CSP change is required (`'self'` follows the new origin). | Incognito on the new host shows the banner; accepting loads GA; rejecting does not. |
| B6 | Vercel Analytics | — | User, only if enabled in the dashboard | **N/A** in the app package. If the Vercel project has Web Analytics or Speed Insights turned on, confirm it still records on the new domain. | Dashboard shows traffic after cutover, or you confirm it is off. |

---

## C. Auth, backend, cookies, and existing links

| # | Item | Phase | Owner | Action | Verify |
|---|---|---|---|---|---|
| C1 | Supabase Auth Site URL + redirect allowlist | 2 | **User** (dashboard); Alfred can list the URLs | In Supabase project `rflvyrcoczhrmmpkowch` → Authentication → URL configuration: set Site URL to `https://whatcareerfits.com` and add `https://whatcareerfits.com/**`, `https://www.whatcareerfits.com/**`, and keep the old-host URLs plus `https://*.vercel.app/**` previews until you are sure nothing still starts on the old host. The JS client talks to `https://rflvyrcoczhrmmpkowch.supabase.co` (unchanged). I could not read Auth settings from the API in this pass. | A test login (if you use Supabase auth for any account path) returns to the new host. |
| C2 | CORS / origin checks in API routes | 2 | Alfred | API routes are same-origin. `getAppOrigin` only requires https in production; it does not hardcode the old host. HTML responses already send `Access-Control-Allow-Origin: *` (pre-existing, not introduced by this move). **No CORS rewrite is required** for the rename itself, other than setting `APP_URL` / `NEXT_PUBLIC_APP_URL` if those envs exist (see A4). | Stripe success URL (if used) and API POSTs from the new origin succeed. |
| C3 | Auth0 — **this is in production, not leftover comments** | 2 | **User** (Auth0 dashboard); Alfred (don’t change the audience string) | Live CSP and `AuthProvider.tsx` use tenant `dev-f0lrnyg4uigdvae1.us.auth0.com`. `redirect_uri` is computed as `window.location.origin + "/callback"`, so the **dashboard must allow** `https://whatcareerfits.com/callback` (and usually `/`, logout, and web origins) **before** users land on the new host. Keep the old-host callback URLs through the transition. **Leave the API audience** `https://knowyourole.com/api` unchanged unless you also recreate the Auth0 API; it is a token identifier, not a link users click. Changing it would break tokens. | From the new host, start login and confirm Auth0 redirects back to `https://whatcareerfits.com/callback` without an “callback URL mismatch” error. |
| C4 | Cookies / localStorage will not carry over | 3 (user impact) | Alfred (document only) | Consent: `kyr_cookie_consent`. Other UI keys: `knowrole-theme`, `knowrole-mood`, `knowrole-funmode`, `knowrole-landmark`, `knowrole-donation-state`. Auth0 cache is **memory**, not localStorage. **Do not rename these keys** in the PR. Visitors who only use the new host will be asked for consent again and will lose theme / in-progress UI state. **Quiz results** are server-side for 30 days and are reached by link; a redirected `/results?…` URL should still open the result. | Open an old result link (if you have one) after redirects are live; the result still loads. A new visit shows the consent banner. |
| C5 | Share links, QR codes, emails, and posts already pointing at knowyourole.com | 2–3 | Alfred (redirects); User (optional updates) | Permanent redirects cover existing shares, counselor printouts, and posts. You do not have to edit old X posts. Optionally update high-visibility links (bio, school handouts you still print) when convenient. | An old `/quiz` or `/for-counselors` URL 308/301s to the same path on the new host and returns 200. |

---

## D. Email

| # | Item | Phase | Owner | Action | Verify |
|---|---|---|---|---|---|
| D1 | Inbound forwarding | 1 | **User** (Porkbun) | Forward `info@whatcareerfits.com` (and, if you want, `results@whatcareerfits.com`) to the inbox you actually read. **Also keep** `info@knowyourole.com` and `results@knowyourole.com` forwarding, so school deletion requests and old contacts are not lost. Porkbun forwarding is inbound only. | Send a test message to both old and new `info@` addresses and confirm you receive them. |
| D2 | Outbound results email (Resend) | 2, only if you send mail | **User** (Resend + DNS); Alfred (copy in the PR) | The app can send via **Resend** (`RESULT_EMAIL_DELIVERY_PROVIDER=resend`, `RESULT_EMAIL_FROM`, `RESEND_API_KEY`). The student-data page still says this feature is “not live yet,” but the code is ready. To send from `What Career Fits <results@whatcareerfits.com>` you must **verify the new domain in Resend** and add the SPF, DKIM, and (recommended) DMARC records Resend gives you at Porkbun. Inbound forwarding does **not** authenticate outbound mail. Until that is done, leave `RESULT_EMAIL_FROM` unset or pointing at an already-verified sender, or keep the feature off. The current template has **no link back to the site**, only a snapshot; still update the “KnowYouRole” wording in the same PR. | If enabled: Resend shows the domain verified; a test send passes spam checks and shows the new from-name. If not enabled: a lead stores with `deliveryStatus="not_sent"` as today. |
| D3 | SPF / DKIM / DMARC for the old domain | 1–2 | User, if you already send from it | If `results@knowyourole.com` was ever verified in Resend, leave those records in place. Do not delete old SPF/DKIM while old mail might still go out. | Existing records remain; new domain has its own. |

---

## E. Outside the site

| # | Item | Phase | Owner | Action | Verify |
|---|---|---|---|---|---|
| E1 | X profile (link, bio, name) | 2 or shortly after | **User** (or Alfred in a browser, only with your OK) | Update the site link to `https://whatcareerfits.com` and the display name/bio when you are ready. Do not post the four starter drafts until you say so. | Profile link opens the new site. |
| E2 | Backlinks and directories | 3 | Alfred (list); User (approves any outreach) | Existing backlinks should follow 301/308. When you later do counselor-page outreach, use the new URL. No outreach goes out without your approval. | Spot-check a known link if you have one; it should land on the new host. |
| E3 | Google Business / Maps | — | User | **Likely N/A** (this is a quiz site, not a storefront). If you ever created a Business Profile, update the website URL. | You confirm there isn’t one, or it is updated. |
| E4 | School / district pages and allowlists | 2–3 | Alfred (copy on `/for-schools`); User (tell schools if a district already allowlisted you) | After cutover, `/for-schools` should list `whatcareerfits.com` and `www.whatcareerfits.com`, and keep the old hosts noted as redirected aliases so existing allowlists still work. Any named district contact is your call; I will not email them unless you approve a specific message. | The live schools page lists the new hosts. A test from a normal network loads the new domain. |
| E5 | QR codes and counselor lesson printouts | 3 | User | The counselor “printable kit” is the webpage itself (no separate unlockable PDF in the repo). Old printouts and any QR codes that encode `knowyourole.com` stay valid **as long as redirects and the old domain live**. New printouts after cutover will show the new URL. | Open the lesson page, print a preview, and confirm the new domain appears. Old printed URL still redirects. |

---

## F. Security headers, CSP, previews

| # | Item | Phase | Owner | Action | Verify |
|---|---|---|---|---|---|
| F1 | CSP and security headers | 2 | Alfred (only if a host string changes) | Live CSP does **not** name `knowyourole.com`. It uses `'self'` plus Google Analytics, `https://*.supabase.co`, Zippopotam, and the Auth0 tenant. `form-action 'self'`, `frame-ancestors 'none'`, HSTS `max-age=63072000; includeSubDomains`, and `upgrade-insecure-requests` can stay. No CSP edit is required for the rename itself. | After cutover, the CSP on `https://whatcareerfits.com` still includes Auth0 and Supabase, and the quiz, consent, and (if used) login still function. |
| F2 | Vercel Deployment Protection | 1 | User / Alfred check | The production site is publicly reachable today, so production protection is not blocking the apex. Preview `*.vercel.app` URLs may still be protected; that is fine. Do not turn on protection on the production custom domains. | `https://whatcareerfits.com` returns 200 without a Vercel login wall after DNS is pointed and the deploy is live. |
| F3 | Preview domains | ongoing | Alfred | Leave preview hosts as `*.vercel.app`. Analytics already refuses to collect on `vercel.app`. Do not add preview URLs to the sitemap. | A preview URL still works for PR review; GA does not fire there. |

---

## G. Rollback plan

If the new domain mis-resolves, the deploy is bad, or Search Console shows a wave of errors in the first 48 hours:

1. **Do not drop `knowyourole.com` or its DNS.** It is the rollback path.
2. In Vercel, make `knowyourole.com` the production domain again and point `whatcareerfits.com` / `www` as 308 redirects **to the old apex** (temporary), or serve the previous production deployment on both hosts.
3. Revert the cutover PR (or ship a hotfix that restores `SITE_URL`, `CANONICAL_ANALYTICS_HOST`, and the www redirect target to `knowyourole.com`).
4. Leave Search Console properties in place. If Change of Address was already submitted, tell me before doing anything else — do not submit a second move casually.
5. Auth0 / Supabase: keep both hosts on the allowlist so either origin still works during rollback.
6. Once stable, fix the issue, then repeat Phase 2 in a short, planned window.

---

## Recommended run order (3 phases)

### Phase 1 — Prep, no change to the live knowyourole.com experience

Do these first. The only public change in this phase should be that `whatcareerfits.com` stops parking and starts serving the **current** site (canonicals can still say knowyourole.com until Phase 2).

1. **User, immediately:** Renew `knowyourole.com` and enable auto-renew. It expires **Nov 28, 2026 at 6:39 PM PT**.
2. **User:** At Porkbun, point `whatcareerfits.com` and `www` at Vercel (the nameservers or the A/CNAME/ALIAS records Vercel shows). This must replace the current **302 to `whatcareerfits-com.l.ink`**. Optionally lower TTL on both domains to 300–600 seconds a day before cutover.
3. **Alfred, after DNS:** Confirm Vercel shows both new hosts as verified; `https://whatcareerfits.com` returns the app (even if branding is still old); `www` 308s to the new apex. I will not change DNS myself.
4. **User:** Set Porkbun forwards for `info@whatcareerfits.com` (and keep the old `info@` working). Send a test mail.
5. **User:** Add and verify the Search Console Domain property for `whatcareerfits.com` (TXT at Porkbun). Optionally add Bing.
6. **User:** In Auth0, *add* (do not yet remove) the new callback, logout, and web origin URLs. In Supabase Auth, *add* the new Site URL as an additional redirect (you can switch the primary Site URL at cutover).
7. **Alfred:** Open the wording + cutover PR (brand copy already approved, `SITE_URL`, analytics host, OG wordmark, email copy, `/schools` redirect, tests including `seoMeta.test.mjs`). **Do not merge** until you say the cutover window is on. This PR changes user-facing wording, so it needs your OK even though checks may be green.

### Phase 2 — Cutover (one window, wording and domain together)

Only after Phase 1 DNS is live and the PR is approved.

1. Merge and deploy the PR to production.
2. Make `whatcareerfits.com` the primary production domain. Put permanent 308/301s from `knowyourole.com` and `www.knowyourole.com` to the matching new-host paths, query strings included, one hop.
3. User: switch GA4 stream URL and referral exclusions; switch Supabase Site URL; confirm Auth0 allows the new callback.
4. User: if you will send results mail, verify `whatcareerfits.com` in Resend and add SPF/DKIM/DMARC; then set `RESULT_EMAIL_FROM`.
5. Alfred: run the redirect and canonical verification list in A1, A3, A5, B3, C3, C5.
6. User: Search Console Change of Address from the old property, then submit `https://whatcareerfits.com/sitemap.xml`. Keep the old property.
7. User (when ready): update the X profile link.

### Phase 3 — Post-cutover monitoring

Assume cutover day is **T0** (date TBD). All times Pacific.

| When | What |
|---|---|
| T0, same day | Redirect sample (A1), canonicals, sitemap, robots, no parking page, GA fires only with consent, login callback if used, `info@` still works. |
| T0 + 1 day | GSC coverage on both properties; Vercel 404 logs; fix any missed paths with extra redirects. |
| **Monday, Nov 23, 2026, 10:00 AM PT** | Already-planned Search Console counselor check — include the domain move, both properties, and the Generative AI report. |
| T0 + 7 and T0 + 14 days | Indexed-page counts, 404s, top queries, obvious ranking dips. |
| **Saturday, Nov 28, 2026, 6:39 PM PT** | Hard deadline that `knowyourole.com` is already renewed. Do not let this sneak up if Phase 1 slipped. |
| T0 + 30 and T0 + 90 days | Confirm the move is being honored, old URLs still 308/301, new host is the one in the index. Keep redirects. |

---

## Build PR size

**Medium.** It is the approved brand pass plus a small, tightly scoped set of host constants (`SITE_URL`, analytics host, www redirect target, OG/share/email strings, `/schools` redirect, and the `seoMeta` test). It is not a large rewrite: no new logo art, no Auth0 tenant rename, no localStorage key changes, no event-name changes.

It still needs **your explicit OK to merge**, because it changes user-facing wording.

---

## Items you must do personally

- Renew `knowyourole.com` and turn on auto-renew (before Nov 28).
- Porkbun DNS for the new domain (and www), replacing the parking 302.
- Porkbun email forwarding for `info@whatcareerfits.com`, and keep the old addresses forwarding.
- Search Console: new Domain property TXT, Change of Address, sitemap submit; keep the old property.
- Bing, if you use it.
- GA4 stream URL and referral exclusions.
- Auth0 dashboard callback / logout / web origins (leave the audience string alone).
- Supabase Auth Site URL and redirect allowlist.
- Resend domain verification and DNS (SPF/DKIM/DMARC) if you will send results email.
- Approve the wording + cutover PR before it merges.
- X profile link (and any school email) when you want those updated.
- Optional: Google Business (likely none), old QR codes / printed packets (redirects cover them).

I will not purchase, change DNS, email anyone, or merge that PR until you say so.
