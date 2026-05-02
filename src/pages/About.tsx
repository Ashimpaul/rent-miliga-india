import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home, Shield, Users, Heart, Zap, Star } from "lucide-react";

const About = () => (
  <div className="flex min-h-screen flex-col bg-background">
    <Header />
    <main className="flex-1 py-12 sm:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Hero Section */}
        <div className="text-center sm:text-left mb-16">
          <div className="flex justify-center sm:justify-start mb-8">
            <img 
              src="/logo.png" 
              alt="RentMilega Logo" 
              className="h-32 w-auto object-contain mix-blend-multiply dark:brightness-0 dark:invert dark:mix-blend-normal sm:h-40" 
            />
          </div>
          <h1 className="animate-fade-up text-4xl font-black tracking-tight text-foreground sm:text-6xl">
            About <span className="text-primary italic">RentMilega</span>
          </h1>
          <p className="mt-6 animate-fade-up text-lg leading-relaxed text-muted-foreground opacity-0 stagger-1 sm:text-xl max-w-3xl">
            RentMilega is a simple and transparent rental listing platform for India. We connect property owners directly with tenants — reducing unnecessary middlemen and making the process faster and more efficient.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { 
              icon: Zap, 
              title: "Simple Listings", 
              desc: "Post or find rentals in just a few clicks with an easy-to-use interface." 
            },
            { 
              icon: Users, 
              title: "Direct Connections", 
              desc: "Communicate directly with property owners — no brokerage involved in most listings." 
            },
            { 
              icon: Shield, 
              title: "Community First", 
              desc: "Built for tenants and owners across India, focused on accessibility and ease." 
            },
            { 
              icon: Heart, 
              title: "Free to Use", 
              desc: "Browsing and posting basic listings is completely free." 
            },
            { 
              icon: Star, 
              title: "Optional Premium Features", 
              desc: "We offer paid features for enhanced visibility and better reach — giving users more control without forcing costs." 
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className={`animate-fade-up group rounded-3xl border border-border bg-card p-8 opacity-0 transition-all duration-300 hover:border-primary hover:shadow-xl active:scale-95 stagger-${i + 2}`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-black text-foreground">{item.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Closing Statement */}
        <div className="mt-20 rounded-[2.5rem] bg-zinc-950 p-10 text-center text-white sm:p-20">
          <h2 className="text-3xl font-black sm:text-5xl">Our Mission</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-white/70 sm:text-xl">
            To make renting simple, accessible, and stress-free for everyone in India. Whether you're looking for a room, apartment, PG, or commercial space — RentMilega has you covered.
          </p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
