import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("/callback", "Auth Callback | KnowYouRole");

export default function CallbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
