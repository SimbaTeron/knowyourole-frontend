import { useCallback, useEffect, useState } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export default function NebulaCanvas() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    const initParticles = async () => {
      const { tsParticles } = await import("@tsparticles/engine");
      await loadSlim(tsParticles);
      setInit(true);
    };
    initParticles();
  }, []);

  const particlesLoaded = useCallback(async () => {}, []);

  const options: ISourceOptions = {
    fullScreen: false,
    background: { color: { value: "transparent" } },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "grab" },
      },
      modes: {
        grab: { distance: 140, links: { opacity: 0.3, color: "#B19CD9" } },
      },
    },
    particles: {
      color: { value: ["#E8F0FE", "#B19CD9", "#FFD700", "#FF9FF3"] },
      links: {
        color: "#B19CD9",
        distance: 150,
        enable: true,
        opacity: 0.1,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "out" },
        random: true,
        speed: 0.6,
        straight: false,
        attract: { enable: true, rotate: { x: 600, y: 1200 } },
      },
      number: { density: { enable: true, width: 1920, height: 1080 }, value: 40 },
      opacity: {
        value: { min: 0.1, max: 0.5 },
        animation: { enable: true, speed: 0.5, startValue: "random" },
      },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 4 } },
    },
    detectRetina: true,
  };

  if (!init) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0" data-testid="nebula-canvas">
      <div className="floating-orb w-96 h-96 bg-violet-echo/40 -top-20 -left-20" style={{ animationDelay: "0s" }} />
      <div className="floating-orb w-80 h-80 bg-pink-tide/30 top-1/3 -right-20" style={{ animationDelay: "-5s" }} />
      <div className="floating-orb w-72 h-72 bg-spark-gold/20 bottom-10 left-1/4" style={{ animationDelay: "-10s" }} />
      <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={options} className="w-full h-full opacity-40" />
    </div>
  );
}
