import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("subscribers")
        .insert([{ email }]);

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
        } else if (error.message?.includes("schema cache")) {
          toast.error("Database sync in progress. Please try again in 1 minute.", {
            description: "If this persists, please run the SQL migration in your Supabase dashboard."
          });
        } else {
          throw error;
        }
      } else {
        toast.success("Subscribed successfully!");
        setEmail("");
      }
    } catch (err: any) {
      console.error("Newsletter error:", err);
      toast.error(err.message || "Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="animate-fade-in border-t border-border bg-card py-8 sm:py-12">
      <div className="container mx-auto px-4 text-center">
        {/* Newsletter Section */}
        <div className="mb-12 max-w-md mx-auto">
          <h3 className="text-lg font-bold text-foreground sm:text-xl mb-2">Subscribe to our Newsletter</h3>
          <p className="text-sm text-muted-foreground mb-6">Get the latest rental listings and property news delivered to your inbox.</p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-xl bg-background border-border"
            />
            <Button type="submit" disabled={loading} className="h-11 px-6 rounded-xl gap-2 font-bold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Subscribe
            </Button>
          </form>
        </div>

        <div className="text-xs text-muted-foreground sm:text-sm">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="RentMilega Logo" 
              className="h-20 w-auto object-contain opacity-90 hover:opacity-100 transition-all mix-blend-multiply dark:brightness-0 dark:invert dark:mix-blend-normal sm:h-40" 
            />
          </div>
          <p className="text-base font-bold text-foreground sm:text-lg">RentMilega</p>
          <p className="mt-1 text-sm">India's simple rental listing platform</p>
          
          <div className="mt-6 flex flex-col items-center gap-2 text-xs sm:text-sm">
            <p>Email: <a href="mailto:rentmilega@gmail.com" className="text-primary hover:underline font-medium">rentmilega@gmail.com</a></p>
            <p>Phone: <a href="tel:9612963394" className="text-primary hover:underline font-medium">+91 96129 63394</a></p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 px-4">
            <Link to="/help" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
              Help
            </Link>
            <span className="text-border hidden sm:inline">•</span>
            <Link to="/about" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
              About Us
            </Link>
            <span className="text-border hidden sm:inline">•</span>
            <Link to="/blogs" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
              Blog
            </Link>
            <span className="text-border hidden sm:inline">•</span>
            <Link to="/contact" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
              Contact Us
            </Link>
            <span className="text-border hidden sm:inline">•</span>
            <Link to="/terms" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
              Terms & Conditions
            </Link>
            <span className="text-border hidden sm:inline">•</span>
            <Link to="/privacy" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
              Privacy Policy
            </Link>
            <span className="text-border hidden sm:inline">•</span>
            <Link to="/cancellation-refund" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
              Cancellation & Refunds
            </Link>
          </div>
          <p className="mt-6 text-[10px] sm:text-xs">
            © {new Date().getFullYear()} <span className="font-bold text-foreground">RentMilega</span>. All Rights Reserved.
          </p>
          
          <div className="mt-10 pt-8 border-t border-border/50">
            <p className="text-sm font-bold text-foreground mb-4">Popular Rental Searches</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] sm:text-xs px-2">
              <Link to="/rentals?q=House for rent in Silchar" className="hover:text-primary transition-colors">House for rent in Silchar</Link>
              <span className="text-border hidden sm:inline">•</span>
              <Link to="/rentals?q=PG in Guwahati" className="hover:text-primary transition-colors">PG in Guwahati</Link>
              <span className="text-border hidden sm:inline">•</span>
              <Link to="/rentals?q=Room for rent in Assam" className="hover:text-primary transition-colors">Room for rent in Assam</Link>
              <span className="text-border hidden sm:inline">•</span>
              <Link to="/rentals?q=Flats for rent in Guwahati" className="hover:text-primary transition-colors">Flats for rent in Guwahati</Link>
              <span className="text-border hidden sm:inline">•</span>
              <Link to="/rentals?q=Rental listings in Silchar Assam" className="hover:text-primary transition-colors">Rental listings in Silchar Assam</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
