# Search Console and indexing tracker

## Scope
Canonical public domain: `https://knowyourole.com`

## Technical preflight completed locally
- Sitemap route: `/sitemap.xml`
- Crawl directives route: `/robots.txt`
- Public content routes are generated in the production build.
- User-specific `/results` remains non-indexable while public `/results/types/*` remains eligible for crawling.

## External steps requiring a Search Console property owner
| Step | Owner | Status | Evidence/date |
| --- | --- | --- | --- |
| Verify `knowyourole.com` property | Search Console property owner | Blocked pending property access | — |
| Submit `https://knowyourole.com/sitemap.xml` | Search Console property owner | Blocked pending property access | — |
| Record first Indexing/Coverage review | Search Console property owner | Blocked pending property access | — |
| Review result-type, career, learn, and resource page coverage weekly | Search Console property owner | Not started | — |

## Weekly coverage record
| Check date | URL | Page type | Search Console status | Notes/action |
| --- | --- | --- | --- | --- |

## Data integrity rule
Do not mark a page indexed, excluded, or crawled without a Search Console observation. HTTP 200 and a valid sitemap demonstrate technical reachability, not Google indexation.
