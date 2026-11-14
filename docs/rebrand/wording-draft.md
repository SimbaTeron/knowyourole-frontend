# What Career Fits — Step 2 wording draft (for review)

Status: **draft only**. No repo edits, commits, or PRs were made.
Prepared: Saturday, Nov 14, 2026, afternoon Pacific Time (America/Los_Angeles).
Source: live pages on knowyourole.com, plus named files on `main` in `SimbaTeron/knowyourole-frontend` (`client/`). GitHub code search for this repo is not indexed, so this inventory is from those named live-app files, not a full-repo clone grep. The old `KnowYouRole/` tree and `_archive/` are out of scope (not the live Next.js app).

This is the wording package for the rebrand to **whatcareerfits.com**. Domain connection (step 1) and cutover redirects / Search Console (step 3) are separate. Nothing here should be merged until you approve the copy.

Constraints honored: no invented stats or accuracy claims; keep “non-diagnostic,” “no account needed,” and existing privacy facts (30-day deletion, no name, optional analytics). Lead with “free career quiz” / “what career fits me.” Keep “work style” only as the explanation of how the quiz works.

The site already enforces **titles ≤ 60 characters** and **descriptions ≤ 160** (`client/tests/unit/seoMeta.test.mjs`). This draft also keeps new meta descriptions at **≤ 155 characters**, as requested. Character counts below include spaces and punctuation.

---

## (a) Brand name styling

**Recommendation: “What Career Fits”** (three words, title case).

Reason: it matches how people search (“what career fits me”) and is easier to read in a logo, tab title, and search result than the jammed wordmark “WhatCareerFits.”

How to use it:

| Place | Style |
|---|---|
| Header, footer, titles (`\| What Career Fits`), JSON-LD `name`, manifest, emails from-name | **What Career Fits** |
| Domain, email addresses, analytics host | **whatcareerfits.com**, `info@whatcareerfits.com` |
| Do not use | “WhatCareerFits,” “WhatCareerFits.com” as display text, or “WCF” |

The compact header that still says “knowrole” should be replaced with the same three-word name, not a new nickname.

---

## (b) Before / after: title, meta, H1

Live values were checked on the production pages. H1s for `/`, `/quiz`, `/for-schools`, `/for-counselors`, and `/student-data` match the source files.

### `/` (homepage)

| | Before | After | Chars after |
|---|---|---|---|
| Title | Free Work Style & Career Quiz for Students \| KnowYouRole (56) | Free Career Quiz: What Career Fits Me? \| What Career Fits | 57 |
| Meta | A free 30-question work style and personality quiz. No sign-up. Big Five, MBTI-style, and DISC signals, plus career directions from trades to creative work. (156) | A free 30-question career quiz. No account or name needed. See what career fits you, with work-style clues from Big Five, MBTI-style, and DISC signals. | 151 |
| H1 | Discover your work style, uncover your strengths, and find career paths to explore next. | Find out what career fits you, in 30 free questions. | 52 |

Supporting homepage lines (not in the table, but part of the same review):

| Line | Before | After |
|---|---|---|
| Eyebrow | Free personality quiz for work style & career fit | Free career quiz for students |
| Subtitle | A free, 30-question personality quiz that combines Big Five traits, MBTI-style patterns, and DISC work behavior into one practical result. | A free, 30-question career quiz. It looks at how you like to work — Big Five traits, MBTI-style patterns, and DISC work behavior — and suggests directions to explore. |
| Trust body | KnowYouRole brings together Big Five trait language, familiar MBTI-style patterns, and DISC-style work behavior. It is built for reflection and role exploration—not diagnosis, hiring, or predicting your future. | What Career Fits brings together Big Five trait language, familiar MBTI-style patterns, and DISC-style work behavior. It is built for reflection and career exploration — not diagnosis, hiring, or predicting your future. |
| Footer copyright | © 2026 KnowYouRole | © 2026 What Career Fits |

### `/quiz`

| | Before | After | Chars after |
|---|---|---|---|
| Title | Take the Free Work Style Quiz, No Sign-Up \| KnowYouRole (55) | Take the Free Career Quiz, No Sign-Up \| What Career Fits | 56 |
| Meta | Start the free 30-question work style quiz. No account or name needed. Big Five, MBTI-style, and DISC signals, plus career directions. (134) | Start the free 30-question career quiz. No account or name needed. See what career fits you, plus work-style, communication, and role-fit clues. | 144 |
| H1 | Take a free personality quiz for work style and career fit | Take a free career quiz to see what fits you | 44 |

Supporting `/quiz` lines:

| Line | Before | After |
|---|---|---|
| Intro | Answer grounded prompts and get a practical KnowYouRole result that combines Big Five traits, MBTI-style patterns, DISC work behavior, communication style, pressure behavior, and career-fit guidance. | Answer grounded prompts and get a practical result that combines Big Five traits, MBTI-style patterns, DISC work behavior, communication style, pressure behavior, and career-fit guidance. |
| Mid-page heading | A free personality quiz for clearer work style, communication, and career fit. | A free career quiz for clearer work style, communication, and role fit. |
| Mid-page body | KnowYouRole turns a short set of personality quiz answers into one practical result. … | What Career Fits turns a short set of answers into one practical result. It blends Big Five traits, MBTI-style preference patterns, and DISC-style work behavior so your result is more useful than a single label. |
| JSON-LD Quiz name | KnowYouRole Free Personality Quiz | What Career Fits Free Career Quiz |

### `/for-schools`

| | Before | After | Chars after |
|---|---|---|---|
| Title | Schools and Counselors Career Reflection \| KnowYouRole (54) | Career Quiz for Schools and Counselors \| What Career Fits | 57 |
| Meta | A plain-language guide for educators and IT teams: what KnowYouRole is, appropriate student use, privacy choices, and technical access information. (147) | A plain-language guide for educators and IT teams: what this free career quiz is, how students can use it, privacy choices, and how to access the site. | 151 |
| H1 | A short, structured way to start a better student conversation. | Keep as is. | 63 |

### `/for-counselors`

| | Before | After | Chars after |
|---|---|---|---|
| Title | Free Career Lesson Plan for School Counselors \| KnowYouRole (59) | Free Career Lesson for School Counselors \| What Career Fits | 59 |
| Meta | A free career exploration lesson for class or a counseling group. No student accounts. Includes a lesson plan you can print. Not for placement or grades. (153) | Keep as is. It already leads with “career” and stays honest. | 153 |
| H1 | A free career exploration lesson for counselors and teachers | Keep as is. | 60 |

The title had to drop the word “Plan” so it still fits in 60 characters with the longer brand name. The H1 and page body can still say “lesson plan.”

Light body retarget on this page: change “Students take the free work-style quiz” to “Students take the free career quiz,” and keep “work style” in the explanation of what the questions look at.

### `/student-data`

| | Before | After | Chars after |
|---|---|---|---|
| Title | Student Data & Privacy \| KnowYouRole for Schools (48) | Student Data & Privacy for Schools \| What Career Fits | 53 |
| Meta | What KnowYouRole stores, how long results are kept, how to ask for deletion, and the FERPA, COPPA, and state student-privacy approach. (134) | What this career quiz stores, how long results are kept, how to ask for deletion, and the FERPA, COPPA, and state student-privacy approach. | 139 |
| H1 | Student data and privacy | Keep as is. | 24 |

Opening sentence after the H1: change “KnowYouRole is a free work-style quiz.” to “What Career Fits is a free career quiz. It looks at work style to suggest directions to explore.” Privacy facts on this page stay the same.

---

## (c) Short FAQ for `/quiz` (and optionally the homepage)

Recommend placing these five questions on **`/quiz`**, with FAQPage JSON-LD, because that is the page people will open from “what career fits me quiz.” Optionally repeat the same block lower on the homepage. Also update the first item on the existing `/faq` page so the two pages do not disagree.

The site already has a longer, honest FAQ at `/faq` (including “we do not publish an accuracy percentage”). These five are the search-targeted short set. Each answer is under 50 words.

**Q1. What career fits me?**
Take this free 30-question quiz to get a starting picture of careers that may fit how you like to work. It is not a diagnosis or a decision. Use the result to explore a class, a conversation, or a small experiment.
(41 words)

**Q2. Is there a free career quiz for teens?**
Yes. The quiz is free, and no account or name is needed. It is built for junior high and high school students, and a parent or counselor can sit with them. It suggests directions to explore. It does not pick a job.
(42 words)

**Q3. Is this a work style quiz or a career quiz?**
Both. The questions look at how you like to work — focus, decisions, people, and pressure — then suggest career directions to explore. Work style is how the quiz reads you. “What career fits me” is the question it helps you start answering.
(39 words)

**Q4. Do I need an account to take the career quiz?**
No. You can finish without an account and without your name. Your result is saved with a random session ID and deleted automatically after 30 days.
(26 words)

**Q5. Is this quiz a test I can fail, or a diagnosis?**
No. It is a self-report reflection tool, not a clinical assessment, hiring screen, or placement test. There are no right answers, and it does not tell you what job you must do.
(32 words)

Draft FAQPage JSON-LD (for `/quiz`; use the new canonical URL at cutover):

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What career fits me?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Take this free 30-question quiz to get a starting picture of careers that may fit how you like to work. It is not a diagnosis or a decision. Use the result to explore a class, a conversation, or a small experiment."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a free career quiz for teens?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The quiz is free, and no account or name is needed. It is built for junior high and high school students, and a parent or counselor can sit with them. It suggests directions to explore. It does not pick a job."
      }
    },
    {
      "@type": "Question",
      "name": "Is this a work style quiz or a career quiz?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Both. The questions look at how you like to work — focus, decisions, people, and pressure — then suggest career directions to explore. Work style is how the quiz reads you. “What career fits me” is the question it helps you start answering."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need an account to take the career quiz?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. You can finish without an account and without your name. Your result is saved with a random session ID and deleted automatically after 30 days."
      }
    },
    {
      "@type": "Question",
      "name": "Is this quiz a test I can fail, or a diagnosis?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. It is a self-report reflection tool, not a clinical assessment, hiring screen, or placement test. There are no right answers, and it does not tell you what job you must do."
      }
    }
  ]
}
```

---

## (d) Full inventory with proposed replacement text

**Count: 86 user-facing or public-metadata strings** across **38 live-app files**, plus **7 configuration / host items** that wait for cutover (step 3), and **a long-tail rule** covering the remaining SEO landing titles and body mentions in `seo-pages.ts`.

Strings that should **not** change in the wording pass: CSS classes (`kyr-`, `kyr-workday`), localStorage keys (`knowrole-theme`, `knowrole-mood`, etc.), component/file names, and the typo’d logo path `/knowyourrole-target.png` until a new asset exists.

### 1. Central brand constants (one change fans out)

| File | Line | Current | Proposed |
|---|---|---|---|
| `client/src/lib/seo.ts` | 5 | `SITE_URL = "https://knowyourole.com"` | `https://whatcareerfits.com` at **cutover** (step 3). Leave as-is during a wording-only PR if the old domain is still canonical. |
| `client/src/lib/seo.ts` | 6 | `SITE_NAME = "KnowYouRole"` | `"What Career Fits"` |
| `client/src/lib/seo.ts` | 150 | title-strip regex `\s*\|\s*KnowYouRole\s*$` | `\s*\|\s*What Career Fits\s*$` |
| `client/src/lib/seo.ts` | 188, 204, 265, 286, 297, 307 | `applicationName` / `siteName` / fallback title / JSON-LD `name` via `SITE_NAME` | Follows `SITE_NAME` |
| `client/src/lib/seo.ts` | 213 | OG image alt: “KnowYouRole personality quiz for work style and career fit” | “What Career Fits free career quiz” |
| `client/src/lib/seo.ts` | 289 | “KnowYouRole is a free work-style reflection and career-exploration website for individuals, educators, and counselors.” | “What Career Fits is a free career-exploration website for students, parents, educators, and counselors. It uses work-style questions to suggest directions to explore.” |
| `client/src/lib/seo.ts` | 290 | `email: "info@knowyourole.com"` | `info@whatcareerfits.com` (needs a mailbox; see open questions) |
| `client/src/lib/seo.ts` | 268 | noIndex fallback description: “A free work style and career reflection quiz. No account or name needed.” | “A free career quiz. No account or name needed.” |
| `client/src/app/og/ogCardInput.ts` | 13 | same title-strip regex `KnowYouRole` | `What Career Fits` |
| `client/src/app/og/ogCardInput.ts` | 22–26 | Auth / checkout / profile titles ending `\| KnowYouRole` | `\| What Career Fits` |
| `client/src/app/og/route.tsx` | 48, 57 | Wordmark “KnowYouRole” and footer “knowyourole.com” on every social card | “What Career Fits” and, at cutover, “whatcareerfits.com” |
| `client/public/manifest.json` | 2–3 | `"name"` / `"short_name"`: KnowYouRole | What Career Fits |
| `client/src/components/seo/SeoContentPage.tsx` | 7, 10–11, 39 | Hardcoded `https://knowyourole.com` in JSON-LD; kicker “KnowYouRole” | Use `SITE_URL` / `SITE_NAME` (this file currently bypasses the constants) |
| `client/src/components/seo/BaseJsonLd.tsx` | — | Renders `baseJsonLd()` from `seo.ts` | Follows the constants above |

Foundation page titles and descriptions in `seo.ts` (besides the five pages in section b):

| Path | Current title | Proposed title (chars) | Proposed description notes |
|---|---|---|---|
| `/careers` | Career Paths by Personality & Work Style \| KnowYouRole | Career Paths by Personality & Work Style \| What Career Fits (59) | Replace “the KnowYouRole quiz” with “the What Career Fits quiz” in the description. |
| `/build` | How KnowYouRole Was Built \| Product & Engineering Case Study (60) | How We Built the Career Quiz \| What Career Fits (48) | Description: swap the product name; keep the case-study framing. |
| `/about` | About KnowYouRole \| Work Style and Career Quiz | About the Free Career Quiz \| What Career Fits (45) | “Learn how What Career Fits helps people turn a short quiz into clearer self-understanding, communication language, and career reflection.” |
| `/faq` | Personality Quiz FAQ \| KnowYouRole | Career Quiz FAQ \| What Career Fits (34) | “Answers about this free career quiz, what it can and cannot tell you, privacy, and how results are produced.” |
| `/methodology` | Personality Quiz Methodology \| KnowYouRole | Career Quiz Methodology \| What Career Fits (42) | Swap the product name; keep the Big Five / MBTI-style / DISC explanation. |
| `/privacy` | Privacy Policy \| KnowYouRole | Privacy Policy \| What Career Fits (33) | “Read how What Career Fits handles quiz answers, result data, analytics preferences, cookies, export requests, and deletion requests.” |
| `/terms` | Terms of Service \| KnowYouRole | Terms of Service \| What Career Fits (35) | Swap the product name; keep the legal scope as written. |
| `/contact` | Contact KnowYouRole \| Personality Quiz Support | Contact What Career Fits \| Career Quiz Support (46) | “Contact What Career Fits about the career quiz, privacy, methodology, results, partnerships, or support.” |

### 2. Header, footer, and residual chrome

| File | Line | Current | Proposed |
|---|---|---|---|
| `client/src/components/layout/AppHeader.tsx` | 43, 50, 51, 59, 65 | Logo text and aria-labels: “KnowYouRole home”, “KnowYouRole”, “Explore KnowYouRole”, “start the free KnowYouRole quiz” | “What Career Fits home”, “What Career Fits”, “Explore What Career Fits”, “start the free What Career Fits quiz” |
| `client/src/components/layout/AppFooter.tsx` | 6, 16, 23 | “About KnowYouRole”; brand “KnowYouRole”; “© 2026 KnowYouRole” | “About What Career Fits”; “What Career Fits”; “© 2026 What Career Fits” |
| `client/src/components/layout/AppFooter.tsx` | 16 | Tagline: “Practical work-style reflection and career exploration. A useful starting point, not a verdict.” | “A free career quiz and a useful starting point, not a verdict. It looks at how you like to work.” |
| `client/src/app/page.tsx` | 350, 459 | aria-label “Example KnowYouRole result”; “© 2026 KnowYouRole” | “Example What Career Fits result”; “© 2026 What Career Fits” |
| `client/src/components/KnowRoleHeader.tsx` | 50 | Visible “KnowYouRole” (legacy header) | “What Career Fits” if this header still mounts anywhere |
| `client/src/components/CompactHeader.tsx` | 59–60 | Visible “knowrole” | “What Career Fits” if this header still mounts anywhere |
| `client/src/app/not-found.tsx` | 7, 11 | “Page not found \| KnowYouRole” | “Page not found \| What Career Fits” (33) |

### 3. Schools, counselors, student data, contact, legal

| File | Line | Current | Proposed |
|---|---|---|---|
| `client/src/app/for-schools/page.tsx` | 12, 26, 29, 87 | Body uses “KnowYouRole” as the product name, including “How KnowYouRole is intended to be used” | “What Career Fits”; intro: “What Career Fits is a free career-exploration tool. In about 15 minutes, students answer 30 fixed questions…” |
| `client/src/app/for-schools/page.tsx` | 46, 80, 96 | `info@knowyourole.com` (deletion, school contact, classification) | `info@whatcareerfits.com` |
| `client/src/app/for-schools/page.tsx` | 93–94 | Allowlist: knowyourole.com, www.knowyourole.com | At cutover, list `whatcareerfits.com` and `www.whatcareerfits.com`, and keep the old hosts listed as redirected aliases until schools update filters |
| `client/src/app/student-data/page.tsx` | 15, 22–23, 55, 130 | Controller “KnowYouRole”; contact `info@knowyourole.com`; opening “free work-style quiz” | Controller “What Career Fits” (confirm legal name — open question); `info@whatcareerfits.com`; opening sentence as in section b |
| `client/src/lib/guidePages.ts` | 418–438 | Counselors title (see section b); “network allows knowyourole.com”; intro “free work-style quiz” | New title; “network allows whatcareerfits.com” at cutover (keep a note that the old domain redirects); intro “free career quiz” |
| `client/src/lib/guidePages.ts` | 342–352, 362, 408 | Parents title “\| KnowYouRole for Parents”; “What KnowYouRole is…”; `info@knowyourole.com` | “Career Quiz for Your Teenager \| What Career Fits” (48); “What What Career Fits is, and what it isn't” is awkward — use **“What this quiz is, and what it isn't”**; emails to `info@whatcareerfits.com`; intro: “What Career Fits is a free career quiz…” |
| `client/src/lib/guidePages.ts` | 57, 164, 267 | Trades / creator / teens body: “KnowYouRole is a free work-style quiz…” / “KnowYouRole will not tell you…” | “What Career Fits is a free career quiz…” / “What Career Fits will not tell you…” |
| `client/src/lib/guidePages.ts` | 42, 148, 255 | Guide titles ending `\| KnowYouRole` | See section b / other titles list; all fit in 60 characters |
| `client/src/app/contact/page.tsx` | 7–8, 18, 32, 34 | Titles, “Contact KnowYouRole…”, mailto `info@knowyourole.com` | New title/description; “Contact What Career Fits…”; `info@whatcareerfits.com` |
| `client/src/app/privacy/page.tsx` | 29, 40, 72, 99, 106, 116, 119, 140, 154 | Repeated “KnowYouRole”; mailto `info@knowyourole.com` | “What Career Fits” (or “we/our/us” where the legal name is already defined); `info@whatcareerfits.com` |
| `client/src/app/terms/page.tsx` | 18, 25, 37, 52, 59, 73, 80, 94 | “By accessing and using KnowYouRole”; IP and liability uses of the name; `info@knowyourole.com` | “What Career Fits”; same legal meaning; `info@whatcareerfits.com` |
| `client/src/app/about/page.tsx` | 13, 17, 32, 44, 58, 98 | H1 “About KnowYouRole”; founder “of KnowYouRole”; mission and disclaimer use the old name | H1: “About What Career Fits”; “Sim Teron is the founder of What Career Fits…”; remaining body swaps the name only |
| `client/src/app/methodology/page.tsx` | ~45, 51, 63, 65, 163 | “Back to KnowYouRole”; body and email `info@knowyourole.com` | “Back to What Career Fits”; swap the product name; new email |
| `client/src/app/build/page.tsx` | 13, 45, 56 | “Most personality products… KnowYouRole was built…”; “Back to KnowYouRole” | Swap the product name; “Back to What Career Fits” |
| `client/src/app/faq/page.tsx` | 40 | “Everything you need to know about KnowYouRole” | “Everything you need to know about What Career Fits” |
| `client/src/app/faq/faqItems.ts` | 5–7, 23, 27, 47, 51 | “What is the current KnowYouRole quiz?” and four answers that name the product | Q: “What is the current What Career Fits quiz?” A: “What Career Fits is a free 30-prompt self-reflection quiz for career exploration. It looks at work style and turns your answers into a practical report on preferences, work behavior, trait signals, and career directions worth testing. It is not designed to reduce a person to one permanent label.” Other answers: swap the name only. Keep the “no accuracy percentage” answer unchanged in substance. |

### 4. Share text, PDF, results email, and results chrome

| File | Line | Current | Proposed |
|---|---|---|---|
| `client/src/app/quiz/QuizPageClient.tsx` | 353, 358 | `I'm a ${mbtiType} on KnowYouRole`; share title “My KnowYouRole Result” | `I'm a ${mbtiType} on What Career Fits`; “My What Career Fits result” |
| `client/src/app/quiz/QuizPageClient.tsx` | 510, 810, 860, 862 | Print/PDF: “My KnowYouRole Personality Profile”; logo; “generated by KnowYouRole”; “Retake the quiz at knowyourole.com” | “My What Career Fits profile”; “What Career Fits”; “generated by What Career Fits”; “Retake the quiz at whatcareerfits.com” (URL at cutover) |
| `client/src/app/quiz/QuizPageClient.tsx` | 985, 987, 1013 | Quiz H1 / intro / mid-page (see section b) | See section b |
| `client/src/app/results/layout.tsx` | 8 | “Quiz Results \| KnowYouRole” | “Quiz Results \| What Career Fits” (31). Share OG title “My work style starting point” can become “My career-fit starting point” if you want the card to match the new lead. |
| `client/src/app/results/views/ResultShareView.tsx` | 34 | “It ends with a link to **knowyourole.com**.” | “whatcareerfits.com” at cutover |
| `client/src/app/results/ResultsPageClient.tsx` | 431–432, 2153–2159, 2300, 2376–2378, 3653, 4943–4959, 5029, 5122 | `BRAND_SHARE_URL` / `BRAND_SHARE_HOST`; filenames `KnowYouRole-Full-Portrait-…`; share/email “My KnowYouRole result”; canvas wordmark; consent “so KnowYouRole can send this result summary”; “Try your own result at knowyourole.com”; “Back to KnowYouRole home” | Brand strings → What Career Fits; host/URL at cutover; filenames `WhatCareerFits-Full-Portrait-…` (no spaces in the filename); consent “so What Career Fits can send this result summary” |
| `client/src/components/SharePDFModal.tsx` | 68, 88, 108, 153 | Fallback URL `https://knowyourole.com`; “Discover your unique personality at KnowYouRole!”; PDF filename `KnowYouRole-Results-…` | New domain at cutover; “Discover your career fit at What Career Fits.”; `WhatCareerFits-Results-…` |
| `client/src/app/api/generate-pdf/route.ts` | 54, 129–132, 175–177, 248, 369 | `BRAND_URL = 'knowyourole.com'`; PDF title/creator/producer; footer wordmark and URL; download filename | `whatcareerfits.com` at cutover; creator/producer “What Career Fits”; filename `WhatCareerFits-Full-Portrait.pdf` |
| `client/src/app/api/results/email-lead/emailDelivery.ts` | 48, 80, 88, 99, 101 | Subject “Your KnowYouRole result summary”; body brand “KnowYouRole”; “you asked KnowYouRole to save” | “Your What Career Fits result summary”; “What Career Fits”; “you asked What Career Fits to save” |
| `client/.env.example` | 22 | `RESULT_EMAIL_FROM="KnowYouRole <results@knowyourole.com>"` | `RESULT_EMAIL_FROM="What Career Fits <results@whatcareerfits.com>"` (mailbox required; do not change production env until the inbox exists) |

### 5. Long-tail SEO pages (`client/src/lib/seo-pages.ts`)

There is a registry of landing, framework, comparison, result-type, career, learn, and resource pages. Almost every **title** ends in `| KnowYouRole`, and many intros/sections name the product.

**Rule for implementation (after you approve):**

1. Replace the title suffix `| KnowYouRole` with `| What Career Fits`.
2. If a title then exceeds 60 characters, shorten the left side rather than dropping the brand. The tightest current example is `/personality-quiz-for-students` (“Free Career Quiz for Students, No Sign-Up \| What Career Fits” = 60).
3. In body copy, replace “KnowYouRole” with “What Career Fits.”
4. Do not retarget every “work style” mention. Only retarget page **titles, H1s, and intros that currently lead with work style** where there is a natural career-quiz phrasing, especially `/work-style-quiz`. That page can keep its URL and become a supporting explanation: title e.g. “Work Style Quiz Inside a Free Career Quiz \| What Career Fits” — **only if it fits in 60 characters**; otherwise “Work Style and Career Quiz \| What Career Fits” (40).
5. Keep comparison pages honest (they are alternatives / explainers, not attack pages).

`/career-quiz-for-teens` and `/personality-quiz-for-students` already lead with “career quiz”; they mainly need the name swap.

### 6. Configuration, hosts, and sitemap (mostly step 3 — cutover)

| File | Line | Current | When to change |
|---|---|---|---|
| `client/src/lib/seo.ts` | 5, 145, 185, 279 | `SITE_URL` drives canonicals, OG URLs, JSON-LD, sitemap | Cutover |
| `client/src/app/sitemap.ts` | — | Uses `SITE_URL` | Cutover |
| `client/src/app/robots.ts` | — | `Sitemap: https://knowyourole.com/sitemap.xml` via `SITE_URL` | Cutover |
| Live `robots.txt` | — | `Sitemap: https://knowyourole.com/sitemap.xml` | Follows the app after cutover |
| `client/src/lib/analytics/collectionGate.ts` | 12–13 | `CANONICAL_ANALYTICS_HOST = "knowyourole.com"` | Cutover. Analytics should collect on the new apex only, once it is canonical. |
| `client/src/lib/analytics/productionHost.ts` | 3 | `WWW_HOST = "www.knowyourole.com"` | Cutover: also add www.whatcareerfits.com → apex, and keep old-host 301s. |
| `client/next.config.ts` | 39 | Comment: analytics gated on `knowyourole.com` | Update the comment at cutover |
| `client/.env.example` | 4, 15 | `NEXT_PUBLIC_API_URL` / `PUBLIC_URL` point at a Vercel preview URL today | Confirm production `PUBLIC_URL` becomes `https://whatcareerfits.com` at cutover |
| Root `.env.example` | 8, 10, 32 | Legacy Vite/Auth0 comments: `knowyourole.us.auth0.com`, `https://knowyourole.com/api`, `PUBLIC_URL=https://knowyourole.com` | Not user-facing; update comments later. Auth0 tenant rename is a separate decision. |
| `client/package.json` | 2 | `"name": "knowyourrole-frontend"` (note the extra “r”) | Not user-facing; optional later rename |

### 7. Intentionally left alone in this wording pass

- Logo file `/knowyourrole-target.png` (filename has “knowyourrole,” a long-standing typo). Needs a new asset if you want the file name or art changed.
- CSS hooks `kyr-`, `html.kyr-workday`, and test IDs.
- Browser storage keys prefixed `knowrole-` (changing them would drop saved theme / quiz UI state).
- Nested `KnowYouRole/` app and `_archive/` (not shipped as the live site).
- Question bank and result archetype names (Systems Builder, etc.).

---

## (e) Open questions

1. **Email mailboxes.** The site uses `info@knowyourole.com` in contact, privacy, terms, student-data, schools, parents, and methodology, and `results@knowyourole.com` as the optional results-email From address. A switch needs inboxes (or Porkbun forwards) on **info@whatcareerfits.com** and **results@whatcareerfits.com**, plus forwards from the old addresses so deletion requests and school emails are not lost. Confirm before those strings go live.
2. **Legal controller name.** Privacy and student-data say “KnowYouRole is the data controller.” Should the legal name become “What Career Fits,” stay as a legal entity that is only trading under the new brand, or use a person/company name? This draft assumes the public controller name becomes “What Career Fits,” but that is your call.
3. **Display styling.** This draft uses “What Career Fits,” not “WhatCareerFits.” Say if you want the jammed wordmark in the logo only.
4. **New logo / favicon / OG art.** Today the logo is a typographic wordmark plus `/knowyourrole-target.png`. Do you want new art before step 2 ships, or a text-only swap first?
5. **Sequencing.** Step 2 (wording) can merge while knowyourole.com is still the canonical URL, which means search results would show “What Career Fits” on the old domain for a while. Alternatively, ship wording and cutover together. Which do you prefer?
6. **Allowlists for school networks.** `/for-schools` tells IT teams to allow `knowyourole.com` and `www.knowyourole.com`. After cutover we should list the new hosts and keep the old ones as redirected aliases. Any district that already allowlisted the old domain should be told, once you approve outreach.
7. **Auth0 tenant** `knowyourole.us.auth0.com` appears only in a legacy root `.env.example` comment. Is that tenant still in use? Renaming it is not part of this copy pass.
8. **Optional results email** is described on `/student-data` as “not live yet.” The templates still need the new brand so they are right if you turn the feature on later.
9. **X / social `sameAs`.** Organization JSON-LD has `"sameAs": []`. Add your X profile after the account is rebranded, if you want it in the schema.
10. **`/work-style-quiz`.** Keep the URL (it already ranks as a supporting page) and make the title/intro explain work style as the method inside the career quiz, rather than leading with a declining phrase.

---

## What I am not asking you to approve yet

- Domain DNS, Vercel domain attach, or 301 redirects (steps 1 and 3).
- Any commit or PR. This document is the review surface.
- Test updates (`seoMeta.test.mjs` currently requires the homepage and quiz titles to include “Work Style”). Those would land with the wording PR, after you approve the copy.

When you mark this wording OK (including answers to the open questions you care about), the implementation can be estimated as a **medium** brand pass: one PR with copy, titles, share/email strings, and tests, still not cutting traffic over to the new domain until you approve step 3.
