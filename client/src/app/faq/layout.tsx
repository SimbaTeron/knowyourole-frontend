import type { Metadata } from "next";
import { breadcrumbJsonLd, publicPageMetadata } from "@/lib/seo";
import { FAQ_ITEMS } from "./faqItems";

export const metadata: Metadata = publicPageMetadata("/faq");

// FAQPage only here, where every question and answer is in the page HTML.
const faqJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  },
  breadcrumbJsonLd([{ name: "FAQ", path: "/faq" }]),
];

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        id="kyr-faq-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      {children}
    </>
  );
}
