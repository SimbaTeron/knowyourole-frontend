import type { Metadata } from "next";
import { EmailActionPage } from "@/components/email/EmailActionPage";

export const metadata: Metadata = { title: "Delete my email | KnowYouRole", robots: { index: false, follow: false } };

export default function Page() {
  return <EmailActionPage purpose="delete" />;
}
