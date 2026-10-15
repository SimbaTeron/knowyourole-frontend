import type { Metadata } from "next";
import { EmailActionPage } from "@/components/email/EmailActionPage";

export const metadata: Metadata = { title: "Unsubscribe | KnowYouRole", robots: { index: false, follow: false } };

export default function Page() {
  return <EmailActionPage purpose="unsubscribe" />;
}
