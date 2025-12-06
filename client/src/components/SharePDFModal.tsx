import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Mail, 
  Smartphone, 
  X, 
  Loader2, 
  Check,
  FileText,
  Share2
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
  const [activeTab, setActiveTab] = useState<"download" | "email" | "sms">("download");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, result, mood, tier }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `KnowRole-Results-${sessionId.slice(-6)}.pdf`;
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

  const handleEmail = async () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/share/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sessionId, result, mood, tier }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send email");

      setSuccess(true);
      toast({
        title: "Email Sent!",
        description: `Your results have been sent to ${email}`,
      });
      setTimeout(() => {
        setSuccess(false);
        setEmail("");
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Email error:", error);
      toast({
        title: "Email Failed",
        description: error.message || "Unable to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSMS = async () => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/share/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, sessionId, result }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send SMS");

      setSuccess(true);
      toast({
        title: "SMS Sent!",
        description: `A link to your results has been sent to ${phone}`,
      });
      setTimeout(() => {
        setSuccess(false);
        setPhone("");
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("SMS error:", error);
      toast({
        title: "SMS Failed",
        description: error.message || "Unable to send SMS. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                <p className="text-sm text-white/80">Download or send your personality report</p>
              </div>
            </div>
          </div>

          <div className="p-1 bg-gray-100 dark:bg-gray-800 flex gap-1">
            {[
              { id: "download", icon: Download, label: "Download" },
              { id: "email", icon: Mail, label: "Email" },
              { id: "sms", icon: Smartphone, label: "SMS" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-700 text-terracotta shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "download" && (
                <motion.div
                  key="download"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-start gap-4">
                    <FileText className="w-10 h-10 text-terracotta flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                        Download PDF Report
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Get a beautifully designed PDF with your MBTI type, Big Five scores, 
                        mood insights, and personalized recommendations.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleDownload}
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
                </motion.div>
              )}

              {activeTab === "email" && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="py-6"
                      data-testid="input-email"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      We'll send your PDF report to this address. Your email is not stored.
                    </p>
                  </div>
                  <Button
                    onClick={handleEmail}
                    disabled={isLoading || success || !email}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 text-white py-6"
                    data-testid="button-send-email"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : success ? (
                      <Check className="w-5 h-5 mr-2" />
                    ) : (
                      <Mail className="w-5 h-5 mr-2" />
                    )}
                    {isLoading ? "Sending..." : success ? "Sent!" : "Send Email"}
                  </Button>
                </motion.div>
              )}

              {activeTab === "sms" && (
                <motion.div
                  key="sms"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="py-6"
                      data-testid="input-phone"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      We'll text you a link to view your results. Your number is not stored.
                    </p>
                  </div>
                  <Button
                    onClick={handleSMS}
                    disabled={isLoading || success || !phone}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white py-6"
                    data-testid="button-send-sms"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : success ? (
                      <Check className="w-5 h-5 mr-2" />
                    ) : (
                      <Smartphone className="w-5 h-5 mr-2" />
                    )}
                    {isLoading ? "Sending..." : success ? "Sent!" : "Send SMS"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-6 pb-6">
            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
              Your contact information is used only to send this report and is not stored.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
