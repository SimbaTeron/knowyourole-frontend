import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata("/privacy");

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
