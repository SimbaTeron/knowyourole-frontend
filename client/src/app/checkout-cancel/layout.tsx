import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("/checkout-cancel", "Checkout Cancelled | What Career Fits");

export default function CheckoutCancelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
