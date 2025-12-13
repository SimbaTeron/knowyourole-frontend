import { useState } from "react";
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
  Link2
} from "lucide-react";

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

export function SharePDFModal({ isOpen, onClose, sessionId, result, mood, tier }: SharePDFModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://knowyourole.com';

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
          title: `I'm a ${result.mbtiType} - My KnowYouRole Results`,
          text: `I discovered my personality type is ${result.mbtiType}! Take the quiz and discover yours: ${shareUrl}`,
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
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700"
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
                <h2 className="text-xl font-bold">Share Your Results</h2>
                <p className="text-sm text-white/80">Share your personality discovery with friends</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                You're a <span className="font-bold text-terracotta">{result.mbtiType}</span> personality type!
              </p>
            </div>

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
                {isLoading ? "Preparing..." : success ? "Shared!" : "Share Results"}
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
                {isLoading ? "Generating..." : success ? "Downloaded!" : "Download PDF"}
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
              Share the quiz link with friends so they can discover their personality too!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
