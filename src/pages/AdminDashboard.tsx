import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  LogOut, 
  RefreshCw, 
  FileImage, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DonationTable } from "@/components/admin/DonationTable";
import { DonationDetails } from "@/components/admin/DonationDetails";
import logo from "@/assets/logo-white.png";
import type { Database } from "@/integrations/supabase/types";

type Donation = Database["public"]["Tables"]["donations"]["Row"];

const AdminDashboard = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchDonations();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (!roles) {
      await supabase.auth.signOut();
      navigate("/admin");
    }
  };

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Failed to load donations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const stats = {
    total: donations.length,
    pending: donations.filter(d => d.status === "pending").length,
    approved: donations.filter(d => d.status === "approved").length,
    issued: donations.filter(d => d.status === "issued").length,
  };

  const filteredDonations = statusFilter === "all" 
    ? donations 
    : donations.filter(d => d.status === statusFilter);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar text-sidebar-foreground p-6 hidden lg:flex flex-col">
        <div className="mb-10">
          <img src={logo} alt="Street Cause" className="h-12 object-contain" />
        </div>

        <nav className="flex-1 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent">
            <Users className="w-4 h-4 mr-3" />
            Manage Admins
          </Button>
        </nav>

        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent mt-auto"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Donation Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Verify donations and issue official supporter posters
            </p>
          </div>
          <Button onClick={fetchDonations} variant="outline" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-soft transition-shadow" onClick={() => setStatusFilter("all")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-soft transition-shadow" onClick={() => setStatusFilter("pending")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-soft transition-shadow" onClick={() => setStatusFilter("approved")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-soft transition-shadow" onClick={() => setStatusFilter("issued")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Issued</CardTitle>
              <FileImage className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.issued}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Badges */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Badge 
            variant={statusFilter === "all" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Badge>
          <Badge 
            variant={statusFilter === "pending" ? "warning" : "outline"} 
            className="cursor-pointer"
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Badge>
          <Badge 
            variant={statusFilter === "approved" ? "success" : "outline"} 
            className="cursor-pointer"
            onClick={() => setStatusFilter("approved")}
          >
            Approved
          </Badge>
          <Badge 
            variant={statusFilter === "issued" ? "issued" : "outline"} 
            className="cursor-pointer"
            onClick={() => setStatusFilter("issued")}
          >
            Issued
          </Badge>
        </div>

        {/* Donations Table */}
        <DonationTable 
          donations={filteredDonations} 
          isLoading={isLoading}
          onSelect={setSelectedDonation}
        />

        {/* Donation Details Modal */}
        <DonationDetails 
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          onUpdate={fetchDonations}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
