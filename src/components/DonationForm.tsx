import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, CheckCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const donationSchema = z.object({
  donorName: z.string().min(2, "Name must be at least 2 characters").max(100),
  donorEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  donorPhone: z.string().min(10, "Phone must be at least 10 digits").max(15).optional().or(z.literal("")),
  amount: z.string().optional(),
  showAmount: z.boolean().default(false),
  cause: z.enum(["orphanage", "education", "health", "women_empowerment", "environment", "social_impact", "general"]),
});

type DonationFormData = z.infer<typeof donationSchema>;

interface DonationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DonationForm({ open, onOpenChange }: DonationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      cause: "general",
      showAmount: false,
    },
  });

  const causeLabels: Record<string, string> = {
    orphanage: "Orphanage Support",
    education: "Education",
    health: "Health",
    women_empowerment: "Women Empowerment",
    environment: "Environment",
    social_impact: "Social Impact",
    general: "General Contribution",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setScreenshotFile(file);
    }
  };

  const onSubmit = async (data: DonationFormData) => {
    setIsSubmitting(true);
    try {
      let screenshotUrl = null;

      // Upload screenshot if provided
      if (screenshotFile) {
        const fileExt = screenshotFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("donation-screenshots")
          .upload(fileName, screenshotFile);

        if (uploadError) {
          console.error("Upload error:", uploadError);
        } else {
          screenshotUrl = fileName;
        }
      }

      // Insert donation record
      const { error } = await supabase.from("donations").insert({
        donor_name: data.donorName,
        donor_email: data.donorEmail || null,
        donor_phone: data.donorPhone || null,
        amount: data.amount ? parseFloat(data.amount) : null,
        show_amount: data.showAmount,
        cause: data.cause,
        screenshot_url: screenshotUrl,
        status: "pending",
      });

      if (error) throw error;

      setIsSuccess(true);
      reset();
      setScreenshotFile(null);
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onOpenChange(false);
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-3">
              Thank You!
            </h3>
            <p className="text-muted-foreground mb-6">
              Your donation details have been submitted successfully. Our team will verify 
              your contribution and send you an official supporter poster soon.
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Submit Your Donation</DialogTitle>
          <DialogDescription>
            Fill in your details below. Our team will verify and issue your official supporter poster.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="donorName">Your Name *</Label>
            <Input
              id="donorName"
              placeholder="Enter your full name"
              {...register("donorName")}
              className={errors.donorName ? "border-destructive" : ""}
            />
            {errors.donorName && (
              <p className="text-sm text-destructive">{errors.donorName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="donorEmail">Email</Label>
              <Input
                id="donorEmail"
                type="email"
                placeholder="your@email.com"
                {...register("donorEmail")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="donorPhone">Phone</Label>
              <Input
                id="donorPhone"
                type="tel"
                placeholder="Your phone number"
                {...register("donorPhone")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cause">Cause / Event *</Label>
            <Select
              defaultValue="general"
              onValueChange={(value: DonationFormData["cause"]) => setValue("cause", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a cause" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(causeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Donation Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Optional"
              {...register("amount")}
            />
            <div className="flex items-center gap-2 mt-2">
              <Checkbox
                id="showAmount"
                checked={watch("showAmount")}
                onCheckedChange={(checked) => setValue("showAmount", checked as boolean)}
              />
              <Label htmlFor="showAmount" className="text-sm text-muted-foreground cursor-pointer">
                Display amount on my supporter poster
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Screenshot (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="screenshot"
              />
              <label htmlFor="screenshot" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                {screenshotFile ? (
                  <p className="text-sm text-foreground font-medium">{screenshotFile.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click to upload payment screenshot
                  </p>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Donation"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
