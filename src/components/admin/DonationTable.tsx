import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types";

type Donation = Database["public"]["Tables"]["donations"]["Row"];

interface DonationTableProps {
  donations: Donation[];
  isLoading: boolean;
  onSelect: (donation: Donation) => void;
}

const statusVariants: Record<string, "pending" | "success" | "issued" | "destructive"> = {
  pending: "pending",
  approved: "success",
  issued: "issued",
  rejected: "destructive",
};

const causeLabels: Record<string, string> = {
  orphanage: "Orphanage",
  education: "Education",
  health: "Health",
  women_empowerment: "Women",
  environment: "Environment",
  social_impact: "Social",
  general: "General",
};

export function DonationTable({ donations, isLoading, onSelect }: DonationTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-xl border">
        <p className="text-muted-foreground">No donations found</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Donor</TableHead>
            <TableHead>Cause</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donations.map((donation) => (
            <TableRow key={donation.id} className="group">
              <TableCell>
                <div>
                  <div className="font-medium">{donation.donor_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {donation.donor_email || donation.donor_phone || "No contact"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {causeLabels[donation.cause] || donation.cause}
                </Badge>
              </TableCell>
              <TableCell>
                {donation.amount ? (
                  <span className="font-medium">₹{donation.amount}</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariants[donation.status] || "pending"}>
                  {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(donation.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelect(donation)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
