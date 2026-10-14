import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata("/faq");

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
