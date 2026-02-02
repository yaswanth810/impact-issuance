import { useState } from "react";
import { format } from "date-fns";
import { 
  CheckCircle, 
  XCircle, 
  FileImage, 
  Loader2, 
  Mail, 
  Phone, 
  Calendar,
  DollarSign,
  Image as ImageIcon,
  Sparkles,
  Download
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PosterPreview } from "./PosterPreview";
import type { Database } from "@/integrations/supabase/types";

type Donation = Database["public"]["Tables"]["donations"]["Row"];

interface DonationDetailsProps {
  donation: Donation | null;
  onClose: () => void;
  onUpdate: () => void;
}

const causeLabels: Record<string, string> = {
  orphanage: "Orphanage Support",
  education: "Education",
  health: "Health",
  women_empowerment: "Women Empowerment",
  environment: "Environment",
  social_impact: "Social Impact",
  general: "General Contribution",
};

export function DonationDetails({ donation, onClose, onUpdate }: DonationDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPosterPreview, setShowPosterPreview] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>("");
  const { toast } = useToast();

  if (!donation) return null;

  const updateStatus = async (status: "approved" | "rejected") => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("donations")
        .update({ status })
        .eq("id", donation.id);

      if (error) throw error;

      toast({
        title: `Donation ${status}`,
        description: status === "approved" 
          ? "You can now issue the supporter poster"
          : "Donation has been rejected",
      });
      onUpdate();
      if (status === "rejected") onClose();
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update failed",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const generatePoster = async () => {
    setIsGenerating(true);
    try {
      // Generate AI appreciation message
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            donorName: donation.donor_name,
            cause: causeLabels[donation.cause] || donation.cause,
            amount: donation.amount,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate message");
      }

      const data = await response.json();
      setAiMessage(data.message);
      setShowPosterPreview(true);
    } catch (error) {
      console.error("Generation error:", error);
      // Fallback message if AI fails
      setAiMessage("Your kindness helped turn compassion into action. Thank you for being part of Street Cause VIIT's journey.");
      setShowPosterPreview(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePosterIssued = async () => {
    try {
      const { error } = await supabase
        .from("donations")
        .update({ 
          status: "issued",
          ai_message: aiMessage,
          poster_issued_at: new Date().toISOString(),
        })
        .eq("id", donation.id);

      if (error) throw error;

      toast({
        title: "Poster issued successfully!",
        description: "The supporter poster has been saved",
      });
      setShowPosterPreview(false);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Issue error:", error);
      toast({
        title: "Failed to save poster",
        variant: "destructive",
      });
    }
  };

  const getScreenshotUrl = () => {
    if (!donation.screenshot_url) return null;
    const { data } = supabase.storage
      .from("donation-screenshots")
      .getPublicUrl(donation.screenshot_url);
    return data.publicUrl;
  };

  return (
    <>
      <Dialog open={!!donation && !showPosterPreview} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-display flex items-center gap-2">
              Donation Details
              <Badge variant={
                donation.status === "pending" ? "pending" :
                donation.status === "approved" ? "success" :
                donation.status === "issued" ? "issued" : "destructive"
              }>
                {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Review and manage this donation submission
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Donor Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Donor Information
              </h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="text-lg font-semibold">{donation.donor_name}</div>
                {donation.donor_email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {donation.donor_email}
                  </div>
                )}
                {donation.donor_phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {donation.donor_phone}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Donation Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Cause
                </div>
                <div className="font-medium">
                  {causeLabels[donation.cause] || donation.cause}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Amount
                </div>
                <div className="font-medium">
                  {donation.amount ? `₹${donation.amount}` : "Not specified"}
                  {donation.show_amount && donation.amount && (
                    <span className="text-xs text-muted-foreground ml-1">(visible)</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Submitted
                </div>
                <div className="font-medium">
                  {format(new Date(donation.created_at), "PPp")}
                </div>
              </div>
              {donation.poster_issued_at && (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileImage className="w-3 h-3" />
                    Poster Issued
                  </div>
                  <div className="font-medium">
                    {format(new Date(donation.poster_issued_at), "PPp")}
                  </div>
                </div>
              )}
            </div>

            {/* Screenshot */}
            {donation.screenshot_url && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    Payment Screenshot
                  </div>
                  <div className="bg-muted rounded-lg p-2">
                    <img 
                      src={getScreenshotUrl() || ""} 
                      alt="Payment screenshot" 
                      className="max-h-48 mx-auto rounded object-contain"
                    />
                  </div>
                </div>
              </>
            )}

            {/* AI Message (if already generated) */}
            {donation.ai_message && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">AI Message</div>
                  <div className="bg-accent/50 rounded-lg p-4 italic text-sm">
                    "{donation.ai_message}"
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <Separator />
            <div className="flex gap-3">
              {donation.status === "pending" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => updateStatus("rejected")}
                    disabled={isUpdating}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => updateStatus("approved")}
                    disabled={isUpdating}
                    className="flex-1"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </>
              )}

              {donation.status === "approved" && (
                <Button
                  variant="hero"
                  onClick={generatePoster}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileImage className="w-4 h-4 mr-2" />
                      Issue Official Poster
                    </>
                  )}
                </Button>
              )}

              {donation.status === "issued" && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setAiMessage(donation.ai_message || "Your kindness helped turn compassion into action. Thank you for being part of Street Cause VIIT's journey.");
                    setShowPosterPreview(true);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  View & Download Poster
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Poster Preview Modal */}
      <PosterPreview
        open={showPosterPreview}
        onClose={() => setShowPosterPreview(false)}
        donation={donation}
        message={aiMessage}
        onConfirm={donation.status === "issued" ? undefined : handlePosterIssued}
        isViewOnly={donation.status === "issued"}
      />
    </>
  );
}
