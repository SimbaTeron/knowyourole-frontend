import type { ReactNode } from "react";
import { ForSchoolsEvents } from "./ForSchoolsEvents";

export default function ForSchoolsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ForSchoolsEvents />
    </>
  );
}
