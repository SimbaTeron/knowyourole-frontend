import type { Metadata, MetadataRoute } from "next";
import { allSeoPages } from "@/lib/seo-pages";
import { QUESTION_COUNT } from "@/lib/quiz/quizConfig";

export const SITE_URL = "https://whatcareerfits.com";
export const SITE_NAME = "What Career Fits";
export const DEFAULT_OG_IMAGE = "/og-image.png";

export type PublicPage = {
  path: string;
  title: string;
  description: string;
  changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"];
  priority: number;
  /** ISO date the page content last changed meaningfully. Defaults to CONTENT_LAST_UPDATED. */
  lastModified?: string;
};

/** Bump when site-wide copy changes (v5 scoring and question-count copy shipped 2026-10-16). */
export const CONTENT_LAST_UPDATED = "2026-10-16";

const foundationPages: PublicPage[] = [
  {
    path: "/",
    title: "Free Career Quiz: What Career Fits Me? | What Career Fits",
    description:
      `A free ${QUESTION_COUNT}-question career quiz. No account or name needed. See what career fits you, with work-style clues from Big Five, MBTI-style, and DISC signals.`,
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/quiz",
    title: "Take the Free Career Quiz, No Sign-Up | What Career Fits",
    description:
      `Start the free ${QUESTION_COUNT}-question career quiz. No account or name needed. See what career fits you, plus work-style, communication, and role-fit clues.`,
    changeFrequency: "weekly",
    priority: 0.95,
  },
  {
    path: "/careers",
    title: "Career Paths by Personality & Work Style | What Career Fits",
    description:
      "Explore career paths by personality and work style, then take the What Career Fits quiz for practical career-fit guidance tailored to how you work.",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/build",
    title: "How We Built the Career Quiz | What Career Fits",
    description:
      "A transparent product and engineering case study: What Career Fits' problem, architecture, validation, privacy decisions, and lessons learned.",
    changeFrequency: "monthly",
    priority: 0.55,
  },
  {
    path: "/student-data",
    title: "Student Data & Privacy for Schools | What Career Fits",
    description:
      "What this career quiz stores, how long results are kept, how to ask for deletion, and the FERPA, COPPA, and state student-privacy approach.",
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    path: "/for-schools",
    title: "Career Quiz for Schools and Counselors | What Career Fits",
    description:
      "A plain-language guide for educators and IT teams: what this free career quiz is, how students can use it, privacy choices, and how to access the site.",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/about",
    title: "About the Free Career Quiz | What Career Fits",
    description:
      "Learn how What Career Fits helps people turn a short quiz into clearer self-understanding, communication language, and career reflection.",
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    path: "/faq",
    title: "Career Quiz FAQ | What Career Fits",
    description:
      "Answers about this free career quiz, what it can and cannot tell you, privacy, and how results are produced.",
    changeFrequency: "monthly",
    priority: 0.65,
  },
  {
    path: "/methodology",
    title: "Career Quiz Methodology | What Career Fits",
    description:
      "How What Career Fits combines Big Five traits, MBTI-style personality language, DISC-style communication insights, and career-fit guidance for self-reflection.",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/privacy",
    title: "Privacy Policy | What Career Fits",
    description:
      "Read how What Career Fits handles quiz answers, result data, analytics preferences, cookies, export requests, and deletion requests.",
    changeFrequency: "yearly",
    priority: 0.35,
  },
  {
    path: "/terms",
    title: "Terms of Service | What Career Fits",
    description:
      "Review the terms for using What Career Fits' personality quiz, career-fit guidance, self-reflection tools, accounts, content, and results.",
    changeFrequency: "yearly",
    priority: 0.35,
  },
  {
    path: "/contact",
    title: "Contact What Career Fits | Career Quiz Support",
    description:
      "Contact What Career Fits about the career quiz, privacy, methodology, results, partnerships, or support.",
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export const publicPages: PublicPage[] = [
  ...foundationPages,
  ...allSeoPages.map((page) => ({
    path: page.path,
    title: page.title,
    description: page.description,
    changeFrequency: page.changeFrequency ?? "monthly",
    priority: page.priority ?? (page.phase === "landing" || page.phase === "framework" ? 0.82 : 0.55),
  })),
];

export const noIndexPaths = [
  "/auth",
  "/callback",
  "/profile",
  "/checkout-success",
  "/checkout-cancel",
  "/checkout/success",
  "/checkout/cancel",
  "/api",
];

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Per-page social card rendered by /og (src/app/og/route.tsx). */
export function ogImagePath(title: string, path = "/") {
  const clean = title.replace(/\s*\|\s*What Career Fits\s*$/, "").replace(/\s*\|\s*/g, " · ").trim();
  const params = new URLSearchParams({ title: clean, path });
  return `/og?${params.toString()}`;
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path === "/" ? SITE_URL : absoluteUrl(item.path),
    })),
  };
}

export function pageMetadata({
  path,
  title,
  description,
  index = true,
  ogTitle,
}: {
  path: string;
  title: string;
  description: string;
  index?: boolean;
  ogTitle?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(ogImagePath(ogTitle ?? title, path));

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: SITE_NAME,
    category: "personality quiz",
    manifest: "/manifest.json?v=20260808",
    icons: {
      icon: [
        { url: "/favicon.ico", type: "image/x-icon" },
        { url: "/favicon-32x32.png?v=20260808", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png?v=20260808", sizes: "16x16", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png?v=20260808",
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "What Career Fits free career quiz",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        },
  };
}

export function getPublicPage(path: string) {
  const page = publicPages.find((item) => item.path === path);
  if (!page) {
    throw new Error(`Missing SEO registry entry for ${path}`);
  }
  return page;
}

export function publicPageMetadata(path: string): Metadata {
  const page = getPublicPage(path);
  return pageMetadata({
    path: page.path,
    title: page.title,
    description: page.description,
  });
}

export function noIndexMetadata(
  path: string,
  title = "What Career Fits",
  description = "A free career quiz. No account or name needed.",
  ogTitle?: string,
): Metadata {
  return pageMetadata({
    path,
    title,
    description,
    index: false,
    ogTitle,
  });
}

export function baseJsonLd() {
  const url = SITE_URL;

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${url}/#organization`,
      name: SITE_NAME,
      url,
      logo: absoluteUrl("/knowyourrole-target.png?v=20260808"),
      description: "What Career Fits is a free career-exploration website for students, parents, educators, and counselors. It uses work-style questions to suggest directions to explore.",
      email: "info@whatcareerfits.com",
      sameAs: [],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${url}/#website`,
      name: SITE_NAME,
      url,
      publisher: {
        "@id": `${url}/#organization`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": ["EducationalApplication", "WebApplication"],
      "@id": `${url}/#webapplication`,
      name: SITE_NAME,
      url,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      description:
        "A free, fixed-question work-style reflection and career-exploration tool. It is designed for self-reflection and guided discussion, not diagnosis, hiring, admissions, or automated decision-making.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      publisher: {
        "@id": `${url}/#organization`,
      },
    },
  ];
}
