import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Users, Shield, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonationForm } from "@/components/DonationForm";
import { HeroImageCarousel } from "@/components/HeroImageCarousel";
import logo from "@/assets/logo-color.png";

const Index = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <img src={logo} alt="Street Cause" className="h-12 object-contain" />
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              Admin Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section with Background Carousel */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image Carousel */}
        <HeroImageCarousel />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 bg-accent/50 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              16+ Years of Impact
            </span>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
              A Life Without a Cause is a{" "}
              <span className="text-primary">Life Without an Effect</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Street Cause VIIT is a student-driven initiative transforming compassion 
              into action across education, health, environment, and social impact.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="xl" 
                onClick={() => setShowForm(true)}
                className="group"
              >
                Submit Your Donation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="xl">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "16+", label: "Years of Service" },
              { number: "8+", label: "Cities Across India" },
              { number: "4,000+", label: "Active Volunteers" },
              { number: "45,000+", label: "Alumni Network" },
            ].map((stat, index) => (
              <div key={index} className="text-center animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Causes Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Our Focus Areas
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We channel student energy and community support into meaningful change
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: "Orphanage Support", desc: "Providing care, education, and hope to children in need" },
              { icon: Users, title: "Education & Health", desc: "Building foundations for brighter futures" },
              { icon: Shield, title: "Women Empowerment", desc: "Creating opportunities for independence and growth" },
            ].map((cause, index) => (
              <div 
                key={index}
                className="group p-8 rounded-2xl bg-card shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <cause.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                  {cause.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {cause.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="gradient-hero rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Ready to Make a Difference?
              </h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">
                Your contribution helps us continue our mission. Submit your donation 
                and receive an official supporter poster from Street Cause VIIT.
              </p>
              <Button 
                variant="secondary" 
                size="xl" 
                onClick={() => setShowForm(true)}
                className="bg-white text-primary hover:bg-white/90"
              >
                Submit Donation Details
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-border">
        <div className="container mx-auto text-center">
          <img src={logo} alt="Street Cause" className="h-10 mx-auto mb-4 object-contain" />
          <p className="text-sm text-muted-foreground mb-2">
            Street Cause VIIT — A Campus Unit of Street Cause India
          </p>
          <p className="text-xs text-muted-foreground">
            © 2026 Street Cause. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Donation Form Modal */}
      <DonationForm open={showForm} onOpenChange={setShowForm} />
    </div>
  );
};

export default Index;
