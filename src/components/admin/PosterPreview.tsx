import { useRef, useState } from "react";
import { Download, Send, Loader2, Heart } from "lucide-react";
import html2canvas from "html2canvas";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-color.png";
import vision2030 from "@/assets/vision-2030.jpeg";
import streetCause16 from "@/assets/street-cause-16years.jpeg";
import donationQR from "@/assets/donation-qr.png";
import type { Database } from "@/integrations/supabase/types";

type Donation = Database["public"]["Tables"]["donations"]["Row"];

interface PosterPreviewProps {
  open: boolean;
  onClose: () => void;
  donation: Donation;
  message: string;
  onConfirm?: () => void;
  isViewOnly?: boolean;
}

const causeLabels: Record<string, string> = {
  orphanage: "Orphanage Support",
  education: "Education Initiative",
  health: "Healthcare Mission",
  women_empowerment: "Women Empowerment",
  environment: "Green Earth Initiative",
  social_impact: "Social Impact Drive",
  general: "Community Support",
};

export function PosterPreview({ open, onClose, donation, message, onConfirm, isViewOnly = false }: PosterPreviewProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) return;
    setIsConfirming(true);
    await onConfirm();
    setIsConfirming(false);
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = `StreetCause-Poster-${donation.donor_name.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Thank You Note Preview</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Poster Preview */}
          <div 
            ref={posterRef}
            className="bg-gradient-to-br from-blue-50 via-white to-amber-50 rounded-2xl p-6 shadow-lg border relative overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 space-y-3">
              {/* Top Logos Row */}
              <div className="flex items-start justify-between">
                <img src={vision2030} alt="Vision 2030 Street Cause" className="h-14 object-contain" />
                <img src={streetCause16} alt="Street Cause 16 Years" className="h-12 object-contain" />
              </div>

              {/* Main Logo + Thank You */}
              <div className="text-center space-y-2">
                <img src={logo} alt="Street Cause" className="h-12 mx-auto object-contain" />
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4 text-primary fill-primary" />
                  <h2 className="text-xl md:text-2xl font-display font-bold text-primary">
                    Thank You!
                  </h2>
                  <Heart className="w-4 h-4 text-primary fill-primary" />
                </div>
              </div>

              {/* Donor Name */}
              <div className="text-center">
                <h3 className="text-lg md:text-xl font-display font-bold text-foreground">
                  {donation.donor_name}
                </h3>
                <p className="text-[11px] italic text-foreground/70 mt-1 max-w-xs mx-auto">
                  "{message}"
                </p>
              </div>

              {/* Cause Badge */}
              <div className="flex justify-center gap-2">
                <div className="bg-primary/10 px-3 py-1 rounded-full">
                  <span className="text-[10px] font-medium text-primary">
                    {causeLabels[donation.cause] || donation.cause}
                  </span>
                </div>
                {donation.show_amount && donation.amount && (
                  <div className="bg-accent px-3 py-1 rounded-full">
                    <span className="text-[10px] font-medium text-accent-foreground">
                      ₹{donation.amount}
                    </span>
                  </div>
                )}
              </div>

              {/* QR Code & Footer */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <img src={donationQR} alt="Donate QR" className="w-14 h-14 rounded border bg-white p-0.5" />
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground">Scan to support</p>
                  <p className="text-[10px] font-medium text-primary">#StreetCauseVIIT</p>
                  <p className="text-[9px] text-muted-foreground italic mt-0.5">
                    "A life without a cause..."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {isViewOnly ? (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Close
                </Button>
                <Button 
                  variant="hero" 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex-1"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Poster
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Edit Message
                </Button>
                <Button 
                  variant="hero" 
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="flex-1"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Issuing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Confirm & Issue
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          {!isViewOnly && (
            <p className="text-xs text-center text-muted-foreground mt-4">
              The poster will be saved and can be sent to the donor via WhatsApp or Email
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
