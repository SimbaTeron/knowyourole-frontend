import React, { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// SECTION 1: Performance Monitor
// ─────────────────────────────────────────────

export function PerformanceSection() {
  const [fps, setFps] = useState(60);
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // FPS counter using requestAnimationFrame
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measure = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / (now - lastTime));
        setFps(currentFps);
        setFpsHistory((prev) => [...prev.slice(-59), currentFps]);
        frameCount = 0;
        lastTime = now;
      }
      animationId = requestAnimationFrame(measure);
    };
    animationId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Draw sparkline when fpsHistory changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (fpsHistory.length < 2) return;

    const maxFps = 60;
    const step = w / 60;
    const history = fpsHistory.length < 60
      ? [...Array(60 - fpsHistory.length).fill(fpsHistory[0] ?? 60), ...fpsHistory]
      : fpsHistory;

    // Draw background grid lines
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Draw FPS line
    ctx.beginPath();
    ctx.strokeStyle = fps >= 55 ? "#4ec9b0" : fps >= 30 ? "#dcdcaa" : "#f14c4c";
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 0;

    for (let i = 0; i < history.length; i++) {
      const x = i * step;
      const y = h - (history[i] / maxFps) * h;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }, [fpsHistory]);

  // Page load timing
  const timingData = (() => {
    if (typeof performance === "undefined") return null;
    const navEntries = performance.getEntriesByType("navigation");
    if (!navEntries.length) return null;
    return navEntries[0] as PerformanceNavigationTiming;
  })();

  const paintEntries =
    typeof performance !== "undefined" ? performance.getEntriesByType("paint") : [];
  const fcpEntry = paintEntries.find((e) => e.name === "first-contentful-paint");
  const lcpEntry = paintEntries.find(
    (e) => e.entryType === "largest-contentful-paint"
  );

  // Memory (Chrome only)
  const memory = (typeof performance !== "undefined" ? (performance as any).memory : null);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fpsColor = fps >= 55 ? "#4ec9b0" : fps >= 30 ? "#dcdcaa" : "#f14c4c";
  const fpsEmoji = fps >= 55 ? "🟢" : fps >= 30 ? "🟡" : "🔴";

  const memPercent = memory
    ? Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
    : 0;
  const memColor = memPercent > 80 ? "#f14c4c" : memPercent > 60 ? "#dcdcaa" : "#4ec9b0";

  const sectionStyle: React.CSSProperties = {
    background: "#1e1e1e",
    color: "#d4d4d4",
    padding: "12px",
    fontFamily: "monospace",
    fontSize: 12,
  };

  const labelStyle: React.CSSProperties = {
    color: "#9cdcfe",
    fontSize: 11,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const valueStyle: React.CSSProperties = {
    color: "#d4d4d4",
    fontSize: 13,
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 6,
  };

  const trStyle: React.CSSProperties = {
    borderBottom: "1px solid #333",
  };

  const tdLabelStyle: React.CSSProperties = {
    padding: "3px 0",
    color: "#858585",
  };

  const tdValueStyle: React.CSSProperties = {
    padding: "3px 0",
    textAlign: "right",
    color: "#d4d4d4",
  };

  const barContainerStyle: React.CSSProperties = {
    width: "100%",
    height: 6,
    background: "#333",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 4,
  };

  return (
    <div style={sectionStyle}>
      {/* FPS Counter */}
      <div style={labelStyle}>⚡ FPS</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 28, color: fpsColor, fontWeight: 700, lineHeight: 1 }}>
          {fpsEmoji} {fps}
        </span>
        <canvas
          ref={canvasRef}
          width={100}
          height={30}
          style={{ display: "block" }}
        />
      </div>

      {/* Page Load Timing */}
      <div style={{ ...labelStyle, marginTop: 12 }}>⏱ Page Load Timing</div>
      {timingData ? (
        <table style={tableStyle}>
          <tbody>
            <tr style={trStyle}>
              <td style={tdLabelStyle}>TTFB</td>
              <td style={tdValueStyle}>
                {(timingData.responseStart - timingData.requestStart).toFixed(0)}ms
              </td>
            </tr>
            <tr style={trStyle}>
              <td style={tdLabelStyle}>DOMContentLoaded</td>
              <td style={tdValueStyle}>
                {(timingData.domContentLoadedEventEnd - timingData.fetchStart).toFixed(0)}ms
              </td>
            </tr>
            <tr style={trStyle}>
              <td style={tdLabelStyle}>FCP</td>
              <td style={tdValueStyle}>
                {fcpEntry ? `${Math.round(fcpEntry.startTime)}ms` : "—"}
              </td>
            </tr>
            <tr style={trStyle}>
              <td style={tdLabelStyle}>LCP</td>
              <td style={tdValueStyle}>
                {lcpEntry ? `${Math.round(lcpEntry.startTime)}ms` : "—"}
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div style={{ ...valueStyle, color: "#858585" }}>Navigation timing unavailable</div>
      )}

      {/* Memory Monitor */}
      <div style={{ ...labelStyle, marginTop: 12 }}>🧠 Memory</div>
      {memory ? (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", ...valueStyle }}>
            <span>{formatBytes(memory.usedJSHeapSize)}</span>
            <span style={{ color: "#858585" }}>{formatBytes(memory.jsHeapSizeLimit)}</span>
          </div>
          <div style={barContainerStyle}>
            <div
              style={{
                width: `${memPercent}%`,
                height: "100%",
                background: memColor,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div style={{ ...valueStyle, marginTop: 3, textAlign: "right", color: memColor }}>
            {memPercent}%
          </div>
        </div>
      ) : (
        <div style={{ ...valueStyle, color: "#858585" }}>
          Memory API unavailable (Chrome only)
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 2: Utilities
// ─────────────────────────────────────────────

const LOG_MAX = 20;

export function UtilitiesSection() {
  const [logs, setLogs] = useState<string[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev].slice(0, LOG_MAX));
  }, []);

  // Expose global logging function
  useEffect(() => {
    (window as any).__devPanelLog = (msg: string) => {
      addLog(msg);
    };
    addLog("DevPanel utilities initialized");
    return () => {
      delete (window as any).__devPanelLog;
    };
  }, [addLog]);

  const handleExport = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)!;
      data[key] = sessionStorage.getItem(key)!;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kyr-state-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog("Exported sessionStorage to JSON");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (typeof json !== "object" || json === null) throw new Error("Invalid JSON");
        Object.entries(json).forEach(([k, v]) => {
          if (typeof v === "string") sessionStorage.setItem(k, v);
        });
        addLog(`Imported ${Object.keys(json).length} keys`);
      } catch {
        alert("Failed to import: invalid JSON file");
      }
      // Reset input so same file can be re-imported
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    sessionStorage.clear();
    setConfirmClear(false);
    addLog("Cleared all sessionStorage");
  };

  const handleReset = () => {
    sessionStorage.clear();
    try {
      sessionStorage.setItem("tier", "free");
    } catch {
      // ignore
    }
    addLog("Reset app state to fresh");
  };

  const handleConsoleLog = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)!;
      data[key] = sessionStorage.getItem(key)!;
    }
    console.log(JSON.parse(JSON.stringify(data)));
    addLog("Logged state to console");
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const sectionStyle: React.CSSProperties = {
    background: "#1e1e1e",
    color: "#d4d4d4",
    padding: "12px",
    fontFamily: "monospace",
    fontSize: 12,
  };

  const labelStyle: React.CSSProperties = {
    color: "#9cdcfe",
    fontSize: 11,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const btnStyle = (
    extra: React.CSSProperties = {}
  ): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 10px",
    margin: "3px 3px 3px 0",
    background: "#2d2d2d",
    color: "#d4d4d4",
    border: "1px solid #333",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 11,
    fontFamily: "monospace",
    transition: "background 0.15s",
    ...extra,
  });

  const dangerBtnStyle = (
    extra: React.CSSProperties = {}
  ): React.CSSProperties => ({
    ...btnStyle(extra),
    background: confirmClear ? "#5c1a1a" : "#2d2d2d",
    borderColor: confirmClear ? "#f14c4c" : "#333",
    color: confirmClear ? "#f14c4c" : "#d4d4d4",
  });

  const logContainerStyle: React.CSSProperties = {
    marginTop: 10,
    maxHeight: 140,
    overflowY: "auto",
    background: "#171717",
    border: "1px solid #333",
    borderRadius: 4,
    padding: "6px 8px",
  };

  const logEntryStyle: React.CSSProperties = {
    color: "#858585",
    fontSize: 11,
    lineHeight: "1.5",
    wordBreak: "break-all",
  };

  return (
    <div style={sectionStyle}>
      <div style={labelStyle}>🔧 Utilities</div>

      {/* Action Buttons */}
      <button style={btnStyle()} onClick={handleExport} title="Export sessionStorage as JSON">
        📥 Export sessionStorage JSON
      </button>

      <button
        style={btnStyle()}
        onClick={() => fileInputRef.current?.click()}
        title="Import JSON into sessionStorage"
      >
        📤 Import State JSON
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleImport}
      />

      <br />

      <button
        style={dangerBtnStyle()}
        onClick={handleClearAll}
        title="Clear all sessionStorage"
      >
        🗑️ {confirmClear ? "Confirm?" : "Clear ALL sessionStorage"}
      </button>

      <button style={btnStyle()} onClick={handleReset} title="Reset to fresh app state">
        🔄 Reset to Fresh App State
      </button>

      <button style={btnStyle()} onClick={handleConsoleLog} title="console.log full state">
        📋 console.log(state)
      </button>

      {/* Event Log */}
      <div style={{ ...labelStyle, marginTop: 12 }}>📜 Event Log</div>
      <div style={logContainerStyle}>
        {logs.length === 0 ? (
          <div style={{ ...logEntryStyle, textAlign: "center", color: "#555" }}>
            No events yet
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} style={logEntryStyle}>
              {log}
            </div>
          ))
        )}
      </div>
      <button
        style={{ ...btnStyle(), marginTop: 5 }}
        onClick={handleClearLogs}
        disabled={logs.length === 0}
      >
        🧹 Clear Log
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 3: Mini Mode Pill
// ─────────────────────────────────────────────

export function MiniModePill({
  onClick,
  fps,
  route,
  authStatus,
}: {
  onClick: () => void;
  fps: number;
  route: string;
  authStatus: string;
}) {
  return (
    <div
      onClick={onClick}
      title={`${route} | ${authStatus} | ${fps}fps`}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 48,
        height: 48,
        background: "linear-gradient(135deg, #7800FF, #00C8FF)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(120,0,255,0.4)",
        zIndex: 99999,
        fontSize: 20,
        userSelect: "none",
      }}
    >
      ⚡
    </div>
  );
}
