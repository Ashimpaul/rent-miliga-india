import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, type Listing } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
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
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section 
          className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-foreground sm:min-h-[500px] md:min-h-[700px] bg-fixed bg-cover bg-center"
          style={{ 
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80")' 
          }}
        >
          <div className="relative z-10 mx-auto w-full max-w-2xl px-4 py-8 text-center sm:py-0">
            <h1 className="animate-fade-up text-3xl font-bold text-white sm:text-4xl md:text-6xl drop-shadow-lg">
              Find Your Perfect{" "}
              <span className="text-primary drop-shadow-none">Rental Home</span>{" "}
              in India
            </h1>
            <p className="mt-4 animate-fade-up text-base text-white/90 opacity-0 stagger-2 sm:mt-6 sm:text-lg md:text-xl drop-shadow-md">
              Search thousands of rental listings across every city and town in India
            </p>
            <form onSubmit={handleSearch} className="mt-8 flex animate-fade-up flex-col gap-3 opacity-0 stagger-3 sm:mt-10 sm:flex-row backdrop-blur-sm bg-white/10 p-2 rounded-2xl sm:rounded-full border border-white/20 shadow-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by city, area..."
                  className="h-12 bg-transparent border-none text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:ring-offset-0 text-base pl-12"
                />
              </div>
              <Button type="submit" className="h-12 w-full gap-2 rounded-full px-8 text-base font-bold shadow-xl transition-all duration-300 active:scale-95 hover:scale-105 sm:w-auto">
                <Search className="h-5 w-5" />
                Search Now
              </Button>
            </form>
          </div>
        </section>

        {/* Browse by Category */}
        <section className="bg-secondary/50 py-12 sm:py-20">
          <div className="container mx-auto px-3 sm:px-4">
            <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              Browse by Category
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:mt-16 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat.type}
                  onClick={() => navigate(`/rentals?type=${cat.type}`)}
                  className={`group relative flex animate-scale-up flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 opacity-0 shadow-sm transition-all duration-500 active:scale-95 hover:-translate-y-2 hover:border-primary hover:shadow-xl hover:bg-primary/5 stagger-${i + 1}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors duration-500 group-hover:bg-primary group-hover:text-primary-foreground sm:h-16 sm:w-16">
                    <cat.icon className="h-6 w-6 transition-transform duration-500 group-hover:scale-110 sm:h-8 sm:w-8" />
                  </div>
                  <span className="text-sm font-bold text-foreground sm:text-base">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Listings */}
        <section className="py-12 sm:py-20 bg-background">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-center sm:text-left">
                <h2 className="animate-fade-up text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                  Recent Listings
                </h2>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">Discover the latest properties added to our platform</p>
              </div>
              <Button variant="outline" size="lg" className="group rounded-full border-primary/20 transition-all duration-300 hover:bg-primary hover:text-white" asChild>
                <a href="/rentals">
                  View All Properties <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
            {loading ? (
              <div className="flex justify-center py-12 sm:py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : listings.length === 0 ? (
              <p className="animate-fade-in py-12 text-center text-muted-foreground sm:py-20">
                No listings yet. Be the first to post one!
              </p>
            ) : (
              <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-8">
                {listings.map((l, i) => (
                  <div key={l.id} className="animate-slide-up opacity-0" style={{ animationDelay: `${i * 0.1}s` }}>
                    <ListingCard listing={l} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 sm:py-20 bg-gradient-to-b from-white to-secondary/30">
          <div className="container mx-auto px-3 sm:px-4">
            <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              How <span className="text-primary underline decoration-primary/30 underline-offset-8">RentMiliga</span> Works
            </h2>
            <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-3 sm:gap-8">
              {STEPS.map((s, i) => (
                <div
                  key={s.num}
                  className={`group relative flex animate-fade-up flex-col items-center rounded-2xl border border-border bg-card p-6 text-center opacity-0 shadow-sm transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl stagger-${i + 1}`}
                >
                  <div className="absolute -top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-lg transition-transform duration-500 group-hover:rotate-[360deg] sm:h-12 sm:w-12 sm:text-base">
                    {s.num}
                  </div>
                  <h3 className="mt-6 text-base font-bold text-foreground sm:mt-8 sm:text-xl">{s.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed sm:text-base">{s.desc}</p>
                  <div className="mt-6 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Promotional Banner */}
        <section className="bg-primary py-8 sm:py-14">
          <div className="container mx-auto px-4 text-center">
            <h2 className="animate-fade-up text-lg font-bold text-primary-foreground sm:text-2xl md:text-3xl">
              Ready to Find Your Dream Home?
            </h2>
            <p className="mx-auto mt-2 max-w-xl animate-fade-up text-xs text-primary-foreground/80 opacity-0 stagger-1 sm:mt-3 sm:text-sm">
              Join thousands of happy tenants who found their perfect rental through RentMiliga. Post your property or start browsing — it's completely free!
            </p>
            <div className="mt-5 flex animate-fade-up flex-col items-center justify-center gap-3 opacity-0 stagger-2 sm:mt-7 sm:flex-row">
              <Button
                onClick={() => navigate("/rentals")}
                variant="secondary"
                className="w-full gap-2 rounded-full px-6 font-semibold shadow-lg transition-all duration-300 active:scale-95 hover:shadow-xl sm:w-auto"
              >
                <Search className="h-4 w-4" /> Browse Rentals
              </Button>
              <Button
                onClick={() => navigate("/post")}
                variant="outline"
                className="w-full gap-2 rounded-full border-primary-foreground/30 px-6 font-semibold text-primary-foreground transition-all duration-300 active:scale-95 hover:bg-primary-foreground/10 sm:w-auto"
              >
                <ArrowRight className="h-4 w-4" /> Post Free Listing
              </Button>
            </div>
          </div>
        </section>

        {/* Ad Space */}
        <section className="border-t border-border bg-muted/20 py-6 sm:py-10">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex min-h-[120px] items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 p-4 sm:min-h-[200px] sm:rounded-2xl">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 sm:text-sm">
                  Advertisement
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground/40 sm:text-xs">
                  Your ad could be here — contact us for details
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
