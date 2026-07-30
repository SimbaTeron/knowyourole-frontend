import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("/checkout-success", "Checkout Success | KnowYouRole");

export default function CheckoutSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
