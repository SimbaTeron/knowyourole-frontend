import type { Metadata } from "next";
import { EmailActionPage } from "@/components/email/EmailActionPage";

export const metadata: Metadata = { title: "Confirm updates | KnowYouRole", robots: { index: false, follow: false } };

export default function Page() {
  return <EmailActionPage purpose="confirm" />;
}
