import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata("/terms");

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
