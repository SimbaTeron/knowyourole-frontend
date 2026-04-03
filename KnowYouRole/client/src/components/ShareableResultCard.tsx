import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Link2, Check, Loader2, Share2, Instagram, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SiX, SiFacebook, SiWhatsapp } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ShareableResultData {
  mbtiType: string;
  mbtiLabel: string;
  discStyle: string;
  discLabel: string;
  bigFiveProfile: { O: number; C: number; E: number; A: number; N: number };
  primaryRole: { title: string; salary: string; desc: string };
  moodBlendTitle?: string;
  moodBlendEmoji?: string;
}

interface ShareableResultCardProps {
  isOpen: boolean;
  onClose: () => void;
  result: ShareableResultData;
  sessionId?: string;
  funMode?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_W = 1080;
const CARD_H = 1080;
const STORY_W = 1080;
const STORY_H = 1920;

const BG_COLOR = "#050510";
const CARD_RADIUS = 80;
const BRAND_FONT = "Georgia, 'Times New Roman', serif";
const BODY_FONT = "Georgia, 'Times New Roman', serif";

const TRAIT_LABELS: Record<string, string> = {
  O: "Openness",
  C: "Conscientiousness",
  E: "Extraversion",
  A: "Agreeableness",
  N: "Emotional Stability",
};

const TRAIT_COLORS: Record<string, { main: string; glow: string }> = {
  O: { main: "#A78BFA", glow: "rgba(167,139,250,0.4)" },
  C: { main: "#60A5FA", glow: "rgba(96,165,250,0.4)" },
  E: { main: "#FBBF24", glow: "rgba(251,191,36,0.4)" },
  A: { main: "#34D399", glow: "rgba(52,211,153,0.4)" },
  N: { main: "#F87171", glow: "rgba(248,113,113,0.4)" },
};

const FUN_MODE_TITLES: Record<string, string> = {
  INTJ: "Supreme Overthinker",
  INTP: "Theoretical Wizard",
  ENTJ: "Chief Everything Officer",
  ENTP: "Professional Debater",
  INFJ: "Soul Reader",
  INFP: "Daydream Believer",
  ENFJ: "Cheerleader-in-Chief",
  ENFP: "Chaos Coordinator",
  ISTJ: "Rule Keeper",
  ISFJ: "Guardian Angel",
  ESTJ: "Order Commander",
  ESFJ: "Party Planner Supreme",
  ISTP: "Silent Fixer",
  ISFP: "Aesthetic Curator",
  ESTP: "Action Hero",
  ESFP: "Entertainment Director",
};

// ─── Card Renderer (Canvas) ─────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawGlassBlob(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color1: string, color2: string, alpha = 0.15
) {
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, hexToRgba(color1, alpha));
  grad.addColorStop(1, hexToRgba(color2, alpha));
  ctx.fillStyle = grad;
  roundedRect(ctx, x, y, w, h, 60);
  ctx.fill();
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  result: ShareableResultData,
  isStory: boolean,
  funMode = false
) {
  const W = isStory ? STORY_W : CARD_W;
  const H = isStory ? STORY_H : CARD_H;

  // ── Background ──────────────────────────────────────────────────────────
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, W, H);

  // ── Background glow blobs ────────────────────────────────────────────────
  // Top-right glow
  const glow1 = ctx.createRadialGradient(W * 0.75, H * 0.1, 0, W * 0.75, H * 0.1, W * 0.6);
  glow1.addColorStop(0, "rgba(167,139,250,0.18)");
  glow1.addColorStop(1, "rgba(167,139,250,0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  // Bottom-left glow
  const glow2 = ctx.createRadialGradient(W * 0.15, H * 0.85, 0, W * 0.15, H * 0.85, W * 0.5);
  glow2.addColorStop(0, "rgba(244,114,182,0.15)");
  glow2.addColorStop(1, "rgba(244,114,182,0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // Center soft glow
  const glow3 = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.4);
  glow3.addColorStop(0, "rgba(96,165,250,0.07)");
  glow3.addColorStop(1, "rgba(96,165,250,0)");
  ctx.fillStyle = glow3;
  ctx.fillRect(0, 0, W, H);

  const pad = isStory ? 80 : 60;
  const contentTop = isStory ? 180 : 100;
  const contentCenterX = W / 2;

  // ── Glass card surface ─────────────────────────────────────────────────
  const cardPadX = isStory ? 80 : 60;
  const cardPadY = isStory ? 60 : 50;
  const cardX = pad;
  const cardY = contentTop - cardPadY;
  const cardW = W - pad * 2;
  const cardH = H - cardY - pad;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 10;
  drawGlassBlob(ctx, cardX, cardY, cardW, cardH, "#1E1B4B", "#0F172A", 0.35);
  ctx.restore();

  // Card border
  ctx.save();
  ctx.strokeStyle = "rgba(167,139,250,0.2)";
  ctx.lineWidth = 2;
  roundedRect(ctx, cardX, cardY, cardW, cardH, CARD_RADIUS);
  ctx.stroke();
  ctx.restore();

  // ── Mood blend header (if available) ──────────────────────────────────
  let y = cardY + 50;

  if (result.moodBlendTitle && result.moodBlendEmoji) {
    ctx.save();
    ctx.font = `bold 48px ${BODY_FONT}`;
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${result.moodBlendEmoji}  ${result.moodBlendTitle}`, contentCenterX, y);
    ctx.restore();

    // Subtle divider
    ctx.save();
    ctx.strokeStyle = "rgba(167,139,250,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 80, y + 45);
    ctx.lineTo(W - cardPadX - 80, y + 45);
    ctx.stroke();
    ctx.restore();

    y += 70;
  }

  // ── MBTI Type ──────────────────────────────────────────────────────────
  const mbtiDisplay = funMode && FUN_MODE_TITLES[result.mbtiType]
    ? FUN_MODE_TITLES[result.mbtiType]
    : result.mbtiType;

  // Gradient text for MBTI
  ctx.save();
  const mbtiGrad = ctx.createLinearGradient(contentCenterX - 200, y, contentCenterX + 200, y);
  mbtiGrad.addColorStop(0, "#FBBF24");
  mbtiGrad.addColorStop(0.5, "#F59E0B");
  mbtiGrad.addColorStop(1, "#FB923C");
  ctx.font = `bold ${isStory ? 140 : 120}px ${BRAND_FONT}`;
  ctx.fillStyle = mbtiGrad;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(251,191,36,0.4)";
  ctx.shadowBlur = 20;
  ctx.fillText(mbtiDisplay, contentCenterX, y);
  ctx.restore();

  y += (isStory ? 80 : 65);

  // MBTI label
  ctx.save();
  ctx.font = `36px ${BODY_FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(result.mbtiLabel, contentCenterX, y);
  ctx.restore();

  y += (isStory ? 55 : 40);

  // ── DISC + Role ────────────────────────────────────────────────────────
  const tagY = y;

  // DISC tag
  ctx.save();
  const tagH = isStory ? 50 : 42;
  const tagR = tagH / 2;
  const discTagW = 160;
  const discTagX = contentCenterX - discTagW - 15;
  ctx.fillStyle = "rgba(52,211,153,0.15)";
  ctx.strokeStyle = "rgba(52,211,153,0.4)";
  ctx.lineWidth = 1.5;
  roundedRect(ctx, discTagX, tagY - tagH / 2, discTagW, tagH, tagR);
  ctx.fill();
  ctx.stroke();
  ctx.font = `bold 26px ${BODY_FONT}`;
  ctx.fillStyle = "#34D399";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(result.discStyle, contentCenterX - discTagW / 2 - 15, tagY);
  ctx.restore();

  // Role tag
  ctx.save();
  const roleTagW = 280;
  const roleTagX = contentCenterX + 15;
  ctx.fillStyle = "rgba(167,139,250,0.15)";
  ctx.strokeStyle = "rgba(167,139,250,0.4)";
  ctx.lineWidth = 1.5;
  roundedRect(ctx, roleTagX, tagY - tagH / 2, roleTagW, tagH, tagR);
  ctx.fill();
  ctx.stroke();
  ctx.font = `bold 26px ${BODY_FONT}`;
  ctx.fillStyle = "#A78BFA";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const roleText = result.primaryRole.title.length > 16
    ? result.primaryRole.title.slice(0, 15) + "…"
    : result.primaryRole.title;
  ctx.fillText(roleText, contentCenterX + roleTagW / 2 + 15, tagY);
  ctx.restore();

  y += (isStory ? 80 : 60);

  // ── Top 3 Traits with bars ─────────────────────────────────────────────
  const sortedTraits = Object.entries(result.bigFiveProfile)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const barAreaTop = y;
  const barH = isStory ? 36 : 28;
  const barGap = isStory ? 45 : 35;
  const barMaxW = cardW - cardPadX * 2 - 200;
  const barStartX = cardX + cardPadX + 180;
  const labelW = 200;

  for (let i = 0; i < sortedTraits.length; i++) {
    const [trait, value] = sortedTraits[i];
    const traitY = barAreaTop + i * barGap;
    const barW = Math.round((value / 100) * barMaxW);
    const tc = TRAIT_COLORS[trait] || { main: "#9CA3AF", glow: "rgba(156,163,175,0.4)" };
    const label = TRAIT_LABELS[trait] || trait;

    // Label
    ctx.save();
    ctx.font = `${isStory ? 32 : 26}px ${BODY_FONT}`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(label, barStartX - 16, traitY);
    ctx.restore();

    // Bar background
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundedRect(ctx, barStartX, traitY - barH / 2, barMaxW, barH, barH / 2);
    ctx.fill();
    ctx.restore();

    // Bar fill with glow
    if (barW > 0) {
      ctx.save();
      ctx.shadowColor = tc.glow;
      ctx.shadowBlur = 10;
      ctx.fillStyle = tc.main;
      roundedRect(ctx, barStartX, traitY - barH / 2, Math.max(barH, barW), barH, barH / 2);
      ctx.fill();
      ctx.restore();
    }

    // Percentage label
    ctx.save();
    ctx.font = `bold ${isStory ? 28 : 22}px ${BODY_FONT}`;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`${value}%`, barStartX + barMaxW + 12, traitY);
    ctx.restore();
  }

  y = barAreaTop + 3 * barGap + (isStory ? 50 : 35);

  // ── Career match block ─────────────────────────────────────────────────
  ctx.save();
  ctx.font = `${isStory ? 28 : 22}px ${BODY_FONT}`;
  ctx.fillStyle = "rgba(167,139,250,0.8)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Top Career Match", contentCenterX, y);
  ctx.restore();

  y += (isStory ? 40 : 30);

  ctx.save();
  ctx.font = `bold ${isStory ? 44 : 36}px ${BRAND_FONT}`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(167,139,250,0.3)";
  ctx.shadowBlur = 15;
  ctx.fillText(result.primaryRole.title, contentCenterX, y);
  ctx.restore();

  y += (isStory ? 35 : 25);

  if (result.primaryRole.salary) {
    ctx.save();
    ctx.font = `${isStory ? 28 : 22}px ${BODY_FONT}`;
    ctx.fillStyle = "rgba(52,211,153,0.9)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(result.primaryRole.salary, contentCenterX, y);
    ctx.restore();
    y += (isStory ? 30 : 22);
  }

  // ── Footer ─────────────────────────────────────────────────────────────
  const footerY = cardY + cardH - (isStory ? 55 : 45);

  ctx.save();
  ctx.font = `${isStory ? 28 : 22}px ${BODY_FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("KnowYourRole.com", contentCenterX, footerY);
  ctx.restore();

  // Subtle top accent line
  ctx.save();
  const lineGrad = ctx.createLinearGradient(cardX + 80, 0, W - cardPadX - 80, 0);
  lineGrad.addColorStop(0, "rgba(167,139,250,0)");
  lineGrad.addColorStop(0.3, "rgba(167,139,250,0.6)");
  lineGrad.addColorStop(0.7, "rgba(244,114,182,0.6)");
  lineGrad.addColorStop(1, "rgba(244,114,182,0)");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = isStory ? 4 : 3;
  ctx.beginPath();
  ctx.moveTo(cardX + 80, cardY + 2);
  ctx.lineTo(W - cardPadX - 80, cardY + 2);
  ctx.stroke();
  ctx.restore();

  // Story top badge
  if (isStory) {
    ctx.save();
    ctx.font = "bold 32px Georgia, serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("KNOWYOURROLE.COM", contentCenterX, 90);
    ctx.restore();
  }
}

// ─── Canvas → Blob helper ───────────────────────────────────────────────────

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to convert canvas to blob"));
    }, "image/png");
  });
}

// ─── Share utilities ────────────────────────────────────────────────────────

function getShareUrl(sessionId?: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "https://knowyourole.com";
  return sessionId ? `${base}?session=${sessionId}` : base;
}

function buildShareMessage(result: ShareableResultData, funMode = false): string {
  const funTitle = funMode ? FUN_MODE_TITLES[result.mbtiType] : undefined;
  const msg = funTitle
    ? `I just discovered I'm "${funTitle}" (${result.mbtiType})!\nDiscover your unique personality type:`
    : `I'm a ${result.mbtiType} — ${result.mbtiLabel}!\nDiscover your personality type:`;
  return msg;
}

async function nativeShare(
  blob: Blob,
  result: ShareableResultData,
  sessionId?: string,
  funMode = false
): Promise<boolean> {
  if (!navigator.share || !(navigator as Navigator & { canShare?: (data?: FilePropertyBag) => boolean }).canShare) {
    return false;
  }
  const file = new File(
    [blob],
    `KnowYourRole-${result.mbtiType}-${sessionId?.slice(-6) ?? "result"}.png`,
    { type: "image/png" }
  );
  if (!(navigator as Navigator & { canShare?: (data?: FilePropertyBag) => boolean }).canShare?.({ files: [file] })) {
    return false;
  }
  try {
    await navigator.share({
      title: `I'm a ${result.mbtiType}!`,
      text: buildShareMessage(result, funMode),
      url: getShareUrl(sessionId),
      files: [file],
    });
    return true;
  } catch {
    return false;
  }
}

function openSocialShare(platform: string, result: ShareableResultData, sessionId?: string, funMode = false) {
  const url = getShareUrl(sessionId);
  const text = buildShareMessage(result, funMode);
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  const links: Record<string, string> = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
  };

  if (links[platform]) {
    window.open(links[platform], "_blank", "noopener,noreferrer,width=600,height=400");
  }
}

async function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// ─── Hidden canvas component ─────────────────────────────────────────────────

function HiddenCardCanvas({
  result,
  isStory,
  funMode,
  onReady,
}: {
  result: ShareableResultData;
  isStory: boolean;
  funMode?: boolean;
  onReady: (canvas: HTMLCanvasElement) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = isStory ? STORY_W : CARD_W;
    canvas.height = isStory ? STORY_H : CARD_H;
    drawCard(ctx, result, isStory, funMode);
    onReady(canvas);
  }, [result, isStory, funMode, onReady]);

  return (
    <canvas
      ref={ref}
      className="hidden"
      style={{ display: "none" }}
    />
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ShareableResultCard({ isOpen, onClose, result, sessionId, funMode }: ShareableResultCardProps) {
  const [activeFormat, setActiveFormat] = useState<"square" | "story">("square");
  const [isRendering, setIsRendering] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeShare, setActiveShare] = useState<string | null>(null);
  const [squareCanvas, setSquareCanvas] = useState<HTMLCanvasElement | null>(null);
  const [storyCanvas, setStoryCanvas] = useState<HTMLCanvasElement | null>(null);
  const { toast } = useToast();

  const activeCanvas = activeFormat === "square" ? squareCanvas : storyCanvas;

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement, format: "square" | "story") => {
    if (format === "square") setSquareCanvas(canvas);
    else setStoryCanvas(canvas);
  }, []);

  const handleDownload = async () => {
    const canvas = activeCanvas;
    if (!canvas) {
      setIsRendering(true);
      return;
    }
    setIsDownloading(true);
    try {
      const blob = await canvasToBlob(canvas);
      const suffix = activeFormat === "story" ? "-story" : "";
      await downloadBlob(
        blob,
        `KnowYourRole-${result.mbtiType}${suffix}-${sessionId?.slice(-6) ?? "result"}.png`
      );
      toast({ title: "Image Saved!", description: "Your result card has been downloaded." });
    } catch {
      toast({ title: "Download Failed", description: "Could not generate the image. Try again.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
      setIsRendering(false);
    }
  };

  // When switching format, if canvas not ready, trigger render
  useEffect(() => {
    if (!activeCanvas) setIsRendering(true);
    else setIsRendering(false);
  }, [activeFormat, activeCanvas]);

  const handleNativeShare = async () => {
    const canvas = activeCanvas;
    if (!canvas) {
      toast({ title: "Please wait", description: "Image is still rendering…" });
      return;
    }
    setActiveShare("native");
    try {
      const blob = await canvasToBlob(canvas);
      const success = await nativeShare(blob, result, sessionId, funMode);
      if (!success) {
        // Fall back to download
        await handleDownload();
      } else {
        toast({ title: "Shared!", description: "Your results have been shared." });
      }
    } catch {
      toast({ title: "Share Failed", description: "Could not share. Try downloading instead.", variant: "destructive" });
    } finally {
      setActiveShare(null);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl(sessionId));
      setLinkCopied(true);
      toast({ title: "Link Copied!", description: "Share this link with friends!" });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast({ title: "Copy Failed", description: "Could not copy link.", variant: "destructive" });
    }
  };

  const handleSocialShare = (platform: string) => {
    setActiveShare(platform);
    openSocialShare(platform, result, sessionId, funMode);
    setTimeout(() => setActiveShare(null), 1500);
  };

  if (!isOpen) return null;

  const shareUrl = getShareUrl(sessionId);
  const shortText = buildShareMessage(result, funMode);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-terracotta to-sage-green p-5 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Share Your Results</h2>
                <p className="text-sm text-white/80">Create a stunning shareable card</p>
              </div>
            </div>
          </div>

          {/* Preview info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                {result.mbtiType}
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{result.moodBlendTitle ?? result.mbtiLabel}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{result.primaryRole.title}</p>
              </div>
            </div>
          </div>

          {/* Format toggle */}
          <div className="px-4 pt-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Image Format</p>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFormat("square")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeFormat === "square"
                    ? "bg-terracotta text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                📐 Square (1:1)
              </button>
              <button
                onClick={() => setActiveFormat("story")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeFormat === "story"
                    ? "bg-terracotta text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                📱 Story (9:16)
              </button>
            </div>
          </div>

          {/* Render canvases (hidden) */}
          <HiddenCardCanvas
            result={result}
            isStory={false}
            funMode={funMode}
            onReady={(c) => handleCanvasReady(c, "square")}
          />
          <HiddenCardCanvas
            result={result}
            isStory={true}
            funMode={funMode}
            onReady={(c) => handleCanvasReady(c, "story")}
          />

          {/* Share actions */}
          <div className="p-4 space-y-3">
            {/* Primary share buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleNativeShare}
                disabled={isRendering || !!activeShare}
                className="bg-gradient-to-r from-terracotta to-sage-green hover:opacity-90 text-white"
              >
                {activeShare === "native" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4 mr-2" />
                )}
                Share Image
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={isRendering || isDownloading}
                className="flex-1"
              >
                {isDownloading || isRendering ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {isDownloading ? "Saving…" : "Download PNG"}
              </Button>
            </div>

            {/* Social platform buttons */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 text-center">
                Share on Social
              </p>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare("twitter")}
                  disabled={!!activeShare}
                  className="h-12 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Share on X (Twitter)"
                >
                  <SiX className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare("facebook")}
                  disabled={!!activeShare}
                  className="h-12 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Share on Facebook"
                >
                  <SiFacebook className="w-5 h-5 text-blue-600" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare("linkedin")}
                  disabled={!!activeShare}
                  className="h-12 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Share on LinkedIn"
                >
                  <FaLinkedin className="w-5 h-5 text-blue-700" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare("whatsapp")}
                  disabled={!!activeShare}
                  className="h-12 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Share on WhatsApp"
                >
                  <SiWhatsapp className="w-5 h-5 text-green-500" />
                </Button>
              </div>
            </div>

            {/* Copy link */}
            <Button
              variant="outline"
              onClick={handleCopyLink}
              disabled={linkCopied}
              className="w-full"
            >
              {linkCopied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Link2 className="w-4 h-4 mr-2" />
              )}
              {linkCopied ? "Link Copied!" : "Copy Quiz Link"}
            </Button>

            {/* Tip */}
            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
              Tip: On mobile, "Share Image" opens your native share sheet with the card photo attached!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
