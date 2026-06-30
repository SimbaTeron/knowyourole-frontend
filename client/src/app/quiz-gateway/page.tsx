'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuizGatewayRedirect() {
  const router = useRouter();

  useEffect(() => {
    sessionStorage.setItem("kyr_quiz_tier", sessionStorage.getItem("kyr_quiz_tier") || "25+");
    router.replace("/quiz");
  }, [router]);

  return null;
}
