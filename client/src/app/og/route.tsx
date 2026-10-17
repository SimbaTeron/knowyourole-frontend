import { ImageResponse } from "next/og";
import { QUESTION_COUNT } from "@/lib/quiz/quizConfig";
import { resolveOgCardInput } from "@/app/og/ogCardInput";

export const runtime = "edge";

const SECTION_LABELS: [string, string][] = [
  ["/for-schools", "For schools & counselors"],
  ["/student-data", "Student data & privacy"],
  ["/methodology", "Methodology"],
  ["/faq", "FAQ"],
  ["/quiz", `Free ${QUESTION_COUNT}-question quiz`],
  ["/results", "Quiz result"],
  ["/careers", "Careers"],
  ["/learn", "Learn"],
  ["/compare", "Compare"],
  ["/resources", "Resources"],
];

function sectionLabel(path: string) {
  const match = SECTION_LABELS.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`));
  return match ? match[1] : "Free work style & career quiz";
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const card = resolveOgCardInput(searchParams);
  const title = card.title.slice(0, 110);
  const path = card.path;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#f8f3e8",
          color: "#12263a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 22, height: 22, borderRadius: 999, background: "#ffca42", border: "4px solid #12263a" }} />
          <div style={{ fontSize: 32, fontWeight: 800 }}>KnowYouRole</div>
          <div style={{ marginLeft: "auto", fontSize: 24, fontWeight: 700, color: "#315f74", textTransform: "uppercase", letterSpacing: 3 }}>
            {sectionLabel(path)}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: title.length > 60 ? 60 : 74, fontWeight: 800, lineHeight: 1.08, maxWidth: 1040 }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 26, color: "#456174" }}>
          <div>{`Free · ${QUESTION_COUNT} questions · No account or name needed`}</div>
          <div style={{ display: "flex", padding: "12px 26px", borderRadius: 999, background: "#12263a", color: "#f8f3e8", fontWeight: 800, boxShadow: "4px 4px 0 #ffca42" }}>
            knowyourole.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" } },
  );
}
