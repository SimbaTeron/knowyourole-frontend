"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  X, 
  Loader2, 
  Check,
  Share2,
  Copy,
  Link2,
  MessageCircle,
  Sparkles
} from "lucide-react";
import { SiX, SiFacebook, SiLinkerd, SiWhatsapp } from "react-icons/si";

interface SharePDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  result: {
    mbtiType: string;
    discStyle: string;
    bigFiveProfile: { O: number; C: number; E: number; A: number; N: number };
    title: string;
    spark: string;
  };
  mood: string;
  tier: string;
}

const MBTI_SHARE_MESSAGES: Record<string, { emoji: string; tagline: string; trait: string }> = {
  "INTJ": { emoji: "chess", tagline: "Strategic Mastermind", trait: "visionary thinking" },
  "INTP": { emoji: "brain", tagline: "Logical Innovator", trait: "analytical depth" },
  "ENTJ": { emoji: "crown", tagline: "Natural Commander", trait: "decisive leadership" },
  "ENTP": { emoji: "lightbulb", tagline: "Creative Debater", trait: "innovative ideas" },
  "INFJ": { emoji: "crystal_ball", tagline: "Insightful Advocate", trait: "deep empathy" },
  "INFP": { emoji: "rainbow", tagline: "Dreamy Idealist", trait: "creative passion" },
  "ENFJ": { emoji: "star", tagline: "Inspiring Leader", trait: "uplifting energy" },
  "ENFP": { emoji: "sparkles", tagline: "Enthusiastic Campaigner", trait: "infectious optimism" },
  "ISTJ": { emoji: "shield", tagline: "Reliable Guardian", trait: "steadfast dedication" },
  "ISFJ": { emoji: "heart", tagline: "Caring Protector", trait: "nurturing warmth" },
  "ESTJ": { emoji: "briefcase", tagline: "Efficient Executive", trait: "organized drive" },
  "ESFJ": { emoji: "handshake", tagline: "Supportive Host", trait: "community spirit" },
  "ISTP": { emoji: "wrench", tagline: "Skilled Craftsperson", trait: "practical expertise" },
  "ISFP": { emoji: "art", tagline: "Artistic Explorer", trait: "creative flair" },
  "ESTP": { emoji: "rocket", tagline: "Bold Adventurer", trait: "action-oriented spirit" },
  "ESFP": { emoji: "confetti", tagline: "Vibrant Entertainer", trait: "spontaneous joy" },
};

const DISC_TRAITS: Record<string, string> = {
  "D": "decisive and results-driven",
  "I": "enthusiastic and people-oriented",
  "S": "patient and dependable",
  "C": "analytical and detail-focused",
};

export function SharePDFModal({ isOpen, onClose, sessionId, result, mood, tier }: SharePDFModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://knowyourole.com';
  
  const mbtiInfo = MBTI_SHARE_MESSAGES[result.mbtiType] || MBTI_SHARE_MESSAGES["INTP"];
  const discTrait = DISC_TRAITS[result.discStyle] || DISC_TRAITS["C"];
  
  const topBigFive = useMemo(() => {
    const entries = Object.entries(result.bigFiveProfile);
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0];
  }, [result.bigFiveProfile]);
  
  const bigFiveLabels: Record<string, string> = {
    O: "creative & open-minded",
    C: "organized & disciplined",
    E: "energetic & outgoing",
    A: "warm & cooperative",
    N: "emotionally aware",
  };

  const personalizedMessage = useMemo(() => {
    return `I just discovered I'm a ${result.mbtiType} (${mbtiInfo.tagline}) with ${mbtiInfo.trait}! My personality blend is ${discTrait} and ${bigFiveLabels[topBigFive[0]]}. Discover your unique personality at KnowYouRole!`;
  }, [result.mbtiType, mbtiInfo, discTrait, topBigFive]);

  const shortMessage = `I'm a ${result.mbtiType} - ${mbtiInfo.tagline}! Discover your personality type:`;

  const generatePDF = async (): Promise<Blob> => {
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, result, mood, tier }),
    });

    if (!response.ok) throw new Error("Failed to generate PDF");
    return await response.blob();
  };

  const handleNativeShare = async () => {
    setIsLoading(true);
    try {
      const pdfBlob = await generatePDF();
      const pdfFile = new File([pdfBlob], `KnowYouRole-Results-${sessionId.slice(-6)}.pdf`, { 
        type: 'application/pdf' 
      });

      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: `I'm a ${result.mbtiType} - ${mbtiInfo.tagline}`,
          text: personalizedMessage,
          files: [pdfFile]
        });
        
        setSuccess(true);
        toast({
          title: "Shared!",
          description: "Your results have been shared successfully.",
        });
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      } else {
        await handleDownload(pdfBlob);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error("Share error:", error);
      toast({
        title: "Share Failed",
        description: "Unable to share. Try downloading instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (existingBlob?: Blob) => {
    setIsLoading(true);
    try {
      const blob = existingBlob || await generatePDF();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `KnowYouRole-Results-${sessionId.slice(-6)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      toast({
        title: "PDF Downloaded!",
        description: "Your personality report has been saved.",
      });
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast({
        title: "Link Copied!",
        description: "Share this link with friends to try the quiz.",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(`${personalizedMessage} ${shareUrl}`);
      setMessageCopied(true);
      toast({
        title: "Message Copied!",
        description: "Your personalized share message is ready to paste.",
      });
      setTimeout(() => setMessageCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedMessage = encodeURIComponent(shortMessage);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let shareLink = "";
    
    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, "_blank", "noopener,noreferrer,width=600,height=400");
    }
  };

  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        data-testid="modal-share-pdf"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
        >
          <div className="bg-gradient-to-r from-terracotta to-sage-green p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
              data-testid="button-close-share-modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Share Your Discovery</h2>
                <p className="text-sm text-white/80">Let friends know your unique personality</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-terracotta" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Your Personality</span>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-terracotta">{result.mbtiType}</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{mbtiInfo.tagline}</div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  <span className="px-2 py-1 bg-terracotta/10 text-terracotta text-xs rounded-full font-medium">
                    {mbtiInfo.trait}
                  </span>
                  <span className="px-2 py-1 bg-sage-green/10 text-sage-green text-xs rounded-full font-medium">
                    {discTrait}
                  </span>
                  <span className="px-2 py-1 bg-dusty-blue/10 text-dusty-blue text-xs rounded-full font-medium">
                    {bigFiveLabels[topBigFive[0]]}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700"
            >
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Your personalized message:</p>
              <p className="text-sm text-gray-800 dark:text-gray-200 italic">"{personalizedMessage}"</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyMessage}
                className="mt-2 w-full"
                data-testid="button-copy-message"
              >
                {messageCopied ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {messageCopied ? "Message Copied!" : "Copy Message"}
              </Button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">Share on Social Media</p>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare("twitter")}
                  className="h-12 hover:bg-gray-100 dark:hover:bg-gray-800"
                  data-testid="button-share-twitter"
                >
                  <SiX className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare("facebook")}
                  className="h-12 hover:bg-gray-100 dark:hover:bg-gray-800"
                  data-testid="button-share-facebook"
                >
                  <SiFacebook className="w-5 h-5 text-blue-600" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare("linkedin")}
                  className="h-12 hover:bg-gray-100 dark:hover:bg-gray-800"
                  data-testid="button-share-linkedin"
                >
                  <SiLinkerd className="w-5 h-5 text-blue-700" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare("whatsapp")}
                  className="h-12 hover:bg-gray-100 dark:hover:bg-gray-800"
                  data-testid="button-share-whatsapp"
                >
                  <SiWhatsapp className="w-5 h-5 text-green-500" />
                </Button>
              </div>
            </motion.div>

            {canNativeShare ? (
              <Button
                onClick={handleNativeShare}
                disabled={isLoading || success}
                className="w-full bg-gradient-to-r from-terracotta to-sage-green hover:opacity-90 text-white py-6"
                data-testid="button-share-native"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : success ? (
                  <Check className="w-5 h-5 mr-2" />
                ) : (
                  <Share2 className="w-5 h-5 mr-2" />
                )}
                {isLoading ? "Preparing PDF..." : success ? "Shared!" : "Share with PDF Report"}
              </Button>
            ) : (
              <Button
                onClick={() => handleDownload()}
                disabled={isLoading || success}
                className="w-full bg-gradient-to-r from-terracotta to-sage-green hover:opacity-90 text-white py-6"
                data-testid="button-download-pdf"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : success ? (
                  <Check className="w-5 h-5 mr-2" />
                ) : (
                  <Download className="w-5 h-5 mr-2" />
                )}
                {isLoading ? "Generating PDF..." : success ? "Downloaded!" : "Download PDF Report"}
              </Button>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleDownload()}
                disabled={isLoading}
                className="flex-1"
                data-testid="button-download-fallback"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                disabled={linkCopied}
                className="flex-1"
                data-testid="button-copy-link"
              >
                {linkCopied ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Link2 className="w-4 h-4 mr-2" />
                )}
                {linkCopied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>

          <div className="px-6 pb-6">
            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
              Help friends discover their unique personality - share your journey!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
