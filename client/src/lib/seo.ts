import type { Metadata, MetadataRoute } from "next";
import { allSeoPages } from "@/lib/seo-pages";

export const SITE_URL = "https://knowyourole.com";
export const SITE_NAME = "KnowYouRole";
export const DEFAULT_OG_IMAGE = "/og-image.png";

export type PublicPage = {
  path: string;
  title: string;
  description: string;
  changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"];
  priority: number;
};

const foundationPages: PublicPage[] = [
  {
    path: "/",
    title: "Free Personality Quiz for Work Style & Career Fit | KnowYouRole",
    description:
      "Take a free personality quiz that blends Big Five traits, MBTI-style patterns, DISC work behavior, and career-fit guidance into one practical result.",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/quiz",
    title: "Take a Free Personality Quiz | Big Five, Work Style & Career Fit",
    description:
      "Take a free personality quiz and get a practical result for Big Five traits, MBTI-style patterns, DISC work style, communication, and career fit.",
    changeFrequency: "weekly",
    priority: 0.95,
  },
  {
    path: "/careers",
    title: "Career Paths by Personality & Work Style | KnowYouRole",
    description:
      "Explore career paths by personality and work style, then take the KnowYouRole quiz for practical career-fit guidance tailored to how you work.",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/about",
    title: "About KnowYouRole | Personality Quiz for Work & Career Clarity",
    description:
      "Learn how KnowYouRole helps people turn personality quiz results into clearer self-understanding, communication language, and career reflection.",
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    path: "/faq",
    title: "Personality Quiz FAQ | KnowYouRole",
    description:
      "Answers about KnowYouRole's free personality quiz, accuracy, Big Five, MBTI-style patterns, DISC-style communication insights, privacy, and career-fit results.",
    changeFrequency: "monthly",
    priority: 0.65,
  },
  {
    path: "/methodology",
    title: "Personality Quiz Methodology | KnowYouRole",
    description:
      "How KnowYouRole combines Big Five traits, MBTI-style personality language, DISC-style communication insights, and career-fit guidance for self-reflection.",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/privacy",
    title: "Privacy Policy | KnowYouRole",
    description:
      "Read how KnowYouRole handles personality quiz answers, result data, analytics preferences, cookies, account data, export requests, and deletion requests.",
    changeFrequency: "yearly",
    priority: 0.35,
  },
  {
    path: "/terms",
    title: "Terms of Service | KnowYouRole",
    description:
      "Review the terms for using KnowYouRole's personality quiz, career-fit guidance, self-reflection tools, accounts, content, and results.",
    changeFrequency: "yearly",
    priority: 0.35,
  },
  {
    path: "/contact",
    title: "Contact KnowYouRole | Personality Quiz Support",
    description:
      "Contact KnowYouRole for questions about the personality quiz, privacy, methodology, career-fit results, partnerships, or support.",
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
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  path,
  title,
  description,
  index = true,
}: {
  path: string;
  title: string;
  description: string;
  index?: boolean;
}): Metadata {
  const url = absoluteUrl(path);

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
          url: absoluteUrl(DEFAULT_OG_IMAGE),
          width: 1200,
          height: 630,
          alt: "KnowYouRole personality quiz for work style and career fit",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(DEFAULT_OG_IMAGE)],
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

export function noIndexMetadata(path: string, title = "KnowYouRole"): Metadata {
  return pageMetadata({
    path,
    title,
    description: "This KnowYouRole utility page is not intended for search indexing.",
    index: false,
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
      "@type": "WebApplication",
      "@id": `${url}/#webapplication`,
      name: SITE_NAME,
      url,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Any",
      description:
        "A free personality quiz that blends Big Five traits, MBTI-style patterns, DISC-style work behavior, and career-fit guidance into one practical result.",
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
