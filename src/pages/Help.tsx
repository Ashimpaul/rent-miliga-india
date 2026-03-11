import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Search, PlusCircle, Shield, CreditCard, MessageCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAQS = [
  { icon: Search, q: "How do I find a rental?", a: "Use the search bar on the homepage or browse by category. You can filter by city, area, budget, and property type." },
  { icon: PlusCircle, q: "How do I post a listing?", a: "Click 'Post Property' in the menu, fill in the details, and submit. Your listing will be live instantly." },
  { icon: Shield, q: "Is my data safe?", a: "Yes. We only collect essential information and never share your personal details with third parties." },
  { icon: CreditCard, q: "Is it free to use?", a: "Browsing and posting basic listings is completely free. Premium features are available for enhanced visibility." },
  { icon: MessageCircle, q: "How do I contact a property owner?", a: "Each listing has the owner's phone number. You can call them directly from the listing detail page." },
];

const Help = () => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <main className="flex-1 py-8 sm:py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="animate-fade-up text-center">
          <HelpCircle className="mx-auto h-10 w-10 text-primary sm:h-12 sm:w-12" />
          <h1 className="mt-3 text-2xl font-bold text-foreground sm:text-4xl">
            Help Center
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Everything you need to know about using RentMilega
          </p>
        </div>

        <div className="mt-8 space-y-4 sm:mt-12">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`animate-fade-up rounded-xl border border-border bg-card p-4 opacity-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-5 stagger-${i + 1}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <faq.icon className="h-4 w-4 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground sm:text-base">{faq.q}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 animate-fade-up text-center opacity-0 stagger-6 sm:mt-12">
          <p className="text-sm text-muted-foreground">Still have questions?</p>
          <Button asChild className="mt-3 rounded-full px-6">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Help;
