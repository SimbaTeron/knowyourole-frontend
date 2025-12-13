import { useEffect, useState } from "react";

export default function PathCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" data-testid="path-canvas">
      <div className="absolute inset-0 bg-gradient-to-br from-soft-cream via-warm-white to-soft-cream dark:from-[#0A0A0F] dark:via-[#0D0D14] dark:to-[#0A0A0F]" />
      
      <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-terracotta/[0.03] dark:bg-[#A78BFA]/[0.08] blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-80 h-80 rounded-full bg-sage-green/[0.04] dark:bg-[#67E8F9]/[0.06] blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-dusty-blue/[0.02] dark:bg-[#A78BFA]/[0.04] blur-3xl" />
      
      <div className="hidden dark:block absolute inset-0" style={{
        backgroundImage: 'radial-gradient(rgba(167, 139, 250, 0.15) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
      
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path
          d="M-100 180 Q150 80 350 200 T700 150 T1100 280"
          stroke="url(#grad1)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="opacity-[0.15] dark:opacity-[0.25]"
          style={{ 
            strokeDasharray: 1000, 
            strokeDashoffset: mounted ? 0 : 1000, 
            transition: "stroke-dashoffset 3s ease-out" 
          }}
        />
        <path
          d="M-100 380 Q200 300 400 420 T800 350 T1100 480"
          stroke="url(#grad2)"
          strokeWidth="1"
          strokeLinecap="round"
          className="opacity-[0.12] dark:opacity-[0.20]"
          style={{ 
            strokeDasharray: 1000, 
            strokeDashoffset: mounted ? 0 : 1000, 
            transition: "stroke-dashoffset 3s ease-out 0.3s" 
          }}
        />
        <path
          d="M-100 600 Q250 520 450 650 T850 580 T1100 720"
          stroke="url(#grad1)"
          strokeWidth="1"
          strokeLinecap="round"
          className="opacity-[0.10] dark:opacity-[0.18]"
          style={{ 
            strokeDasharray: 1000, 
            strokeDashoffset: mounted ? 0 : 1000, 
            transition: "stroke-dashoffset 3s ease-out 0.6s" 
          }}
        />
        <path
          d="M-100 820 Q180 750 380 870 T750 800 T1100 920"
          stroke="url(#grad3)"
          strokeWidth="0.75"
          strokeLinecap="round"
          className="opacity-[0.08] dark:opacity-[0.15]"
          style={{ 
            strokeDasharray: 1000, 
            strokeDashoffset: mounted ? 0 : 1000, 
            transition: "stroke-dashoffset 3s ease-out 0.9s" 
          }}
        />
        
        <circle cx="350" cy="200" r="3" className="fill-[#C67B5C] dark:fill-[#A78BFA]" opacity={mounted ? 0.3 : 0} style={{ transition: "opacity 0.5s ease-out 2.5s" }} />
        <circle cx="700" cy="350" r="2.5" className="fill-[#8B9A6D] dark:fill-[#67E8F9]" opacity={mounted ? 0.3 : 0} style={{ transition: "opacity 0.5s ease-out 2.7s" }} />
        <circle cx="450" cy="650" r="3" className="fill-[#C67B5C] dark:fill-[#C4B5FD]" opacity={mounted ? 0.3 : 0} style={{ transition: "opacity 0.5s ease-out 2.9s" }} />
        <circle cx="200" cy="380" r="2" className="fill-[#7BA3B5] dark:fill-[#A78BFA]" opacity={mounted ? 0.25 : 0} style={{ transition: "opacity 0.5s ease-out 3.1s" }} />

        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className="[stop-color:#C67B5C] dark:[stop-color:#A78BFA]" stopOpacity="0" />
            <stop offset="50%" className="[stop-color:#C67B5C] dark:[stop-color:#A78BFA]" stopOpacity="1" />
            <stop offset="100%" className="[stop-color:#C67B5C] dark:[stop-color:#A78BFA]" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className="[stop-color:#8B9A6D] dark:[stop-color:#67E8F9]" stopOpacity="0" />
            <stop offset="50%" className="[stop-color:#8B9A6D] dark:[stop-color:#67E8F9]" stopOpacity="1" />
            <stop offset="100%" className="[stop-color:#8B9A6D] dark:[stop-color:#67E8F9]" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className="[stop-color:#7BA3B5] dark:[stop-color:#C4B5FD]" stopOpacity="0" />
            <stop offset="50%" className="[stop-color:#7BA3B5] dark:[stop-color:#C4B5FD]" stopOpacity="1" />
            <stop offset="100%" className="[stop-color:#7BA3B5] dark:[stop-color:#C4B5FD]" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
