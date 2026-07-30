import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata("/quiz");

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
