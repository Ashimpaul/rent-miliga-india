import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! We'll get back to you soon.");
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8 sm:py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <h1 className="animate-fade-up text-2xl font-bold text-foreground sm:text-4xl">
            Contact <span className="text-primary">Us</span>
          </h1>
          <p className="mt-2 animate-fade-up text-sm text-muted-foreground opacity-0 stagger-1 sm:text-base">
            Have questions or feedback? We'd love to hear from you.
          </p>

          <div className="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-2">
            {/* Contact Info */}
            <div className="animate-fade-up space-y-5 opacity-0 stagger-2">
              {[
                { icon: Mail, label: "Email", value: "support@rentmilega.com" },
                { icon: Phone, label: "Phone", value: "+91 98765 43210" },
                { icon: MapPin, label: "Location", value: "India" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <item.icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <form
              onSubmit={handleSubmit}
              className="animate-fade-up space-y-4 rounded-xl border border-border bg-card p-5 opacity-0 stagger-3"
            >
              <Input placeholder="Your name" required className="text-foreground" />
              <Input type="email" placeholder="Your email" required className="text-foreground" />
              <Textarea placeholder="Your message..." required className="min-h-[120px] text-foreground" />
              <Button type="submit" disabled={sending} className="w-full gap-2 rounded-full">
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
