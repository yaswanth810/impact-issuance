import { useRef, useState } from "react";
import { Download, Send, Loader2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-color.png";
import type { Database } from "@/integrations/supabase/types";

type Donation = Database["public"]["Tables"]["donations"]["Row"];

interface PosterPreviewProps {
  open: boolean;
  onClose: () => void;
  donation: Donation;
  message: string;
  onConfirm: () => void;
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

export function PosterPreview({ open, onClose, donation, message, onConfirm }: PosterPreviewProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    await onConfirm();
    setIsConfirming(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Official Supporter Poster Preview</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Poster Preview */}
          <div 
            ref={posterRef}
            className="bg-gradient-to-br from-blue-50 via-white to-amber-50 rounded-2xl p-8 shadow-lg border relative overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center space-y-6">
              {/* Logo */}
              <img src={logo} alt="Street Cause" className="h-16 mx-auto object-contain" />

              {/* Title */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground uppercase tracking-widest">
                  Official Supporter
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  Certificate of Appreciation
                </h2>
              </div>

              {/* Donor Name */}
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-1">This recognizes</p>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-primary">
                  {donation.donor_name}
                </h3>
              </div>

              {/* AI Message */}
              <div className="max-w-md mx-auto">
                <p className="text-lg italic text-foreground/80 leading-relaxed">
                  "{message}"
                </p>
              </div>

              {/* Cause & Amount */}
              <div className="flex flex-wrap justify-center gap-4 py-4">
                <div className="bg-primary/10 px-5 py-2 rounded-full">
                  <span className="text-sm font-medium text-primary">
                    {causeLabels[donation.cause] || donation.cause}
                  </span>
                </div>
                {donation.show_amount && donation.amount && (
                  <div className="bg-accent px-5 py-2 rounded-full">
                    <span className="text-sm font-medium text-accent-foreground">
                      ₹{donation.amount} Contributed
                    </span>
                  </div>
                )}
              </div>

              {/* Year & Stamp */}
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-display font-bold text-primary">2026</p>
                    <p className="text-xs text-muted-foreground">Year of Service</p>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center mx-auto mb-1">
                      <Check className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">Verified</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6">
                <p className="text-xs text-muted-foreground">
                  Issued by Street Cause VIIT • A Campus Unit of Street Cause India
                </p>
                <p className="text-xs text-primary mt-1 font-medium">
                  "A life without a cause is a life without an effect"
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
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
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            The poster will be saved and can be sent to the donor via WhatsApp or Email
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
