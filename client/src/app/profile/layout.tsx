import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";
import Providers from "../providers";

export const metadata: Metadata = noIndexMetadata("/profile", "Profile | What Career Fits");

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
