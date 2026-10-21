import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";
import Providers from "../providers";

export const metadata: Metadata = noIndexMetadata("/auth", "Auth | KnowYouRole");

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
