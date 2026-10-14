import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata("/about");

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
