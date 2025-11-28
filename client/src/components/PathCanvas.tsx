import { useEffect, useState } from "react";

export default function PathCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" data-testid="path-canvas">
      <svg
        className="w-full h-full opacity-[0.12]"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path
          d="M-50 200 Q200 100 400 250 T800 180 T1050 300"
          stroke="#C67B5C"
          strokeWidth="2"
          strokeLinecap="round"
          className={mounted ? "path-line" : ""}
          style={{ strokeDasharray: 800, strokeDashoffset: mounted ? 0 : 800, transition: "stroke-dashoffset 2.5s ease-out" }}
        />
        <path
          d="M-50 400 Q150 350 350 450 T700 380 T1050 500"
          stroke="#8B9A6D"
          strokeWidth="1.5"
          strokeLinecap="round"
          className={mounted ? "path-line path-line-delayed" : ""}
          style={{ strokeDasharray: 800, strokeDashoffset: mounted ? 0 : 800, transition: "stroke-dashoffset 2.5s ease-out 0.3s" }}
        />
        <path
          d="M-50 650 Q250 580 450 700 T850 620 T1050 750"
          stroke="#C67B5C"
          strokeWidth="1"
          strokeLinecap="round"
          className={mounted ? "path-line path-line-delayed-2" : ""}
          style={{ strokeDasharray: 800, strokeDashoffset: mounted ? 0 : 800, transition: "stroke-dashoffset 2.5s ease-out 0.6s" }}
        />
        <path
          d="M-50 850 Q200 800 400 900 T750 830 T1050 920"
          stroke="#7BA3B5"
          strokeWidth="1"
          strokeLinecap="round"
          style={{ strokeDasharray: 800, strokeDashoffset: mounted ? 0 : 800, transition: "stroke-dashoffset 2.5s ease-out 0.9s" }}
        />
        
        <circle cx="400" cy="250" r="4" fill="#C67B5C" opacity={mounted ? 0.4 : 0} style={{ transition: "opacity 0.5s ease-out 2s" }} />
        <circle cx="700" cy="380" r="3" fill="#8B9A6D" opacity={mounted ? 0.4 : 0} style={{ transition: "opacity 0.5s ease-out 2.2s" }} />
        <circle cx="450" cy="700" r="4" fill="#C67B5C" opacity={mounted ? 0.4 : 0} style={{ transition: "opacity 0.5s ease-out 2.4s" }} />
        <circle cx="200" cy="200" r="2" fill="#7BA3B5" opacity={mounted ? 0.3 : 0} style={{ transition: "opacity 0.5s ease-out 2.6s" }} />
        <circle cx="600" cy="620" r="2" fill="#8B9A6D" opacity={mounted ? 0.3 : 0} style={{ transition: "opacity 0.5s ease-out 2.8s" }} />
      </svg>
    </div>
  );
}
