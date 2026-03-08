import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home, Shield, Users, Heart } from "lucide-react";

const About = () => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <main className="flex-1 py-8 sm:py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="animate-fade-up text-2xl font-bold text-foreground sm:text-4xl">
          About <span className="text-primary">RentMiliga</span>
        </h1>
        <p className="mt-4 animate-fade-up text-sm leading-relaxed text-muted-foreground opacity-0 stagger-1 sm:text-base">
          RentMiliga is India's simple and transparent rental listing platform. We connect property owners directly with tenants — no middlemen, no hidden fees.
        </p>

        <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6">
          {[
            { icon: Home, title: "Simple Listings", desc: "Post or find rentals in just a few clicks." },
            { icon: Shield, title: "Trusted Platform", desc: "Verified listings and direct owner contact." },
            { icon: Users, title: "Community First", desc: "Built for tenants and owners across India." },
            { icon: Heart, title: "Free to Use", desc: "No charges for browsing or posting basic listings." },
          ].map((item, i) => (
            <div
              key={item.title}
              className={`animate-fade-up rounded-xl border border-border bg-card p-5 opacity-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-md stagger-${i + 2}`}
            >
              <item.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 text-sm font-semibold text-foreground sm:text-base">{item.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 animate-fade-up text-sm leading-relaxed text-muted-foreground opacity-0 stagger-6 sm:mt-12 sm:text-base">
          Our mission is to make renting simple, accessible, and stress-free for everyone in India. Whether you're looking for a room, apartment, PG, or commercial space — RentMiliga has you covered.
        </p>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
