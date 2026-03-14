import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase, type Listing } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import AdPopup from "@/components/AdPopup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Home, Building2, Hotel, Building, Store, Loader2, ArrowRight } from "lucide-react";

const CATEGORIES = [
  { label: "Rooms", icon: Home, type: "room" },
  { label: "Apartments", icon: Building2, type: "apartment" },
  { label: "Houses", icon: Home, type: "house" },
  { label: "PG", icon: Hotel, type: "pg" },
  { label: "Hostels", icon: Building, type: "hostel" },
  { label: "Commercial", icon: Store, type: "commercial" },
];

const STEPS = [
  { num: 1, title: "Search", desc: "Browse thousands of rental listings by city, budget, or property type." },
  { num: 2, title: "Explore", desc: "View detailed information, photos, and amenities of properties you like." },
  { num: 3, title: "Connect", desc: "Contact the property owner directly and move into your new home!" },
];

const Index = () => {
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setListings(data || []);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/rentals?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Helmet>
        <title>RentMilega - Find & Post Rental Listings in India | No Signup Required</title>
        <meta name="description" content="Discover thousands of rental properties across India on RentMilega. Find rooms, apartments, houses, PGs, and commercial spaces. Post your property for free with no signup needed." />
      </Helmet>
      <Header />
      <AdPopup 
        type="image" 
        src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80" 
        link="https://rentmilega.in/post"
        delay={3000}
      />
      <main className="flex-1 bg-background">
        {/* Hero */}
        <section 
          className="relative flex min-h-[65vh] items-center justify-center overflow-hidden bg-foreground sm:min-h-[500px] md:min-h-[650px] bg-fixed bg-cover bg-center"
          style={{ 
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80")' 
          }}
        >
          <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-12 text-center sm:py-0">
            <h1 className="animate-fade-up text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-7xl">
              Find Your Perfect{" "}
              <span className="text-primary italic">Rental Home</span>
            </h1>
            <p className="mt-6 animate-fade-up text-lg text-white/80 opacity-0 stagger-2 sm:text-xl md:text-2xl font-light">
              Search thousands of premium rental listings across India
            </p>
            <form onSubmit={handleSearch} className="mt-10 flex animate-fade-up flex-col gap-3 opacity-0 stagger-3 sm:mt-12 sm:flex-row backdrop-blur-md bg-white/5 p-2 rounded-2xl border border-white/10 shadow-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by city, area..."
                  className="h-14 bg-transparent border-none text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg pl-12"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 w-full gap-2 rounded-xl px-10 text-lg font-bold shadow-xl transition-all duration-300 active:scale-95 hover:scale-[1.02] sm:w-auto">
                Search
              </Button>
            </form>
          </div>
        </section>

        {/* Recent Listings */}
        <section className="py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-end justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-center">
              <div>
                <h2 className="animate-fade-up text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                  Featured Properties
                </h2>
                <p className="mt-3 text-base text-muted-foreground sm:text-lg">Our handpicked selection of the latest rentals</p>
              </div>
              <Button variant="link" size="lg" className="group text-lg font-bold p-0 h-auto" asChild>
                <a href="/rentals" className="flex items-center">
                  View All <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary/50" />
              </div>
            ) : listings.length === 0 ? (
              <p className="animate-fade-in py-20 text-center text-muted-foreground text-lg italic">
                No listings yet. Be the first to post one!
              </p>
            ) : (
              <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {listings.map((l, i) => (
                  <div key={l.id} className="animate-slide-up opacity-0" style={{ animationDelay: `${i * 0.1}s` }}>
                    <ListingCard listing={l} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Browse by Category */}
        <section className="py-20 sm:py-32 border-t border-border/50 bg-muted/5">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="animate-fade-up text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Browse by Category
              </h2>
              <p className="mt-4 text-muted-foreground sm:text-lg">Find the specific type of property that fits your needs</p>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat.type}
                  onClick={() => navigate(`/rentals?type=${cat.type}`)}
                  className={`group flex animate-scale-up flex-col items-center gap-6 rounded-3xl border border-border bg-card p-8 opacity-0 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-xl hover:bg-primary/[0.02] stagger-${i + 1}`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-6 sm:h-20 sm:w-20">
                    <cat.icon className="h-8 w-8 transition-transform duration-500 group-hover:scale-110 sm:h-10 sm:w-10" />
                  </div>
                  <span className="text-base font-bold tracking-tight text-foreground sm:text-lg">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 sm:py-32 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="animate-fade-up text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Experience <span className="text-primary">Simplicity</span>
              </h2>
              <p className="mt-4 text-muted-foreground sm:text-lg">Getting your next home has never been easier</p>
            </div>
            <div className="mt-20 grid gap-12 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <div
                  key={s.num}
                  className={`group relative flex animate-fade-up flex-col items-center text-center opacity-0 stagger-${i + 1}`}
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-primary/5 text-2xl font-black text-primary shadow-inner transition-all duration-500 group-hover:rounded-2xl group-hover:bg-primary group-hover:text-white">
                    {s.num}
                  </div>
                  <h3 className="mt-8 text-xl font-bold tracking-tight text-foreground sm:text-2xl">{s.title}</h3>
                  <p className="mt-4 text-base text-muted-foreground leading-relaxed font-light sm:text-lg">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Promotional Banner */}
        <section className="container mx-auto px-4 py-12 sm:py-24">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground px-8 py-16 text-center sm:px-16 sm:py-24">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80')] bg-cover bg-center opacity-10 grayscale" />
            <div className="relative z-10">
              <h2 className="animate-fade-up text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-6xl">
                Ready to find your <span className="text-primary italic">dream home?</span>
              </h2>
              <p className="mx-auto mt-8 max-w-2xl animate-fade-up text-lg text-white/60 opacity-0 stagger-1 sm:text-xl leading-relaxed font-light">
                Join thousands of happy tenants who found their perfect rental through RentMilega. Post your property or start browsing — it's completely free!
              </p>
              <div className="mt-12 flex animate-fade-up flex-col items-center justify-center gap-4 opacity-0 stagger-2 sm:flex-row">
                <Button
                  onClick={() => navigate("/rentals")}
                  size="lg"
                  className="h-14 w-full rounded-2xl bg-primary px-10 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 sm:w-auto"
                >
                  Browse Rentals
                </Button>
                <Button
                  onClick={() => navigate("/post")}
                  variant="outline"
                  size="lg"
                  className="h-14 w-full rounded-2xl border-white/20 bg-white/5 px-10 text-lg font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/40 active:scale-95 sm:w-auto"
                >
                  Post Free Listing
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Ad Space */}
        <section className="pb-20 sm:pb-32">
          <div className="container mx-auto px-4">
            <div className="flex min-h-[150px] items-center justify-center rounded-[2rem] border border-border bg-muted/30 p-8 sm:min-h-[250px]">
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/40 sm:text-base">
                  Partnership Opportunities
                </p>
                <p className="mt-3 text-base text-muted-foreground/30 font-light italic">
                  Showcase your brand to thousands of property seekers
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
