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
        <section className="relative flex min-h-[260px] items-center justify-center overflow-hidden bg-foreground/90 sm:min-h-[420px]">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
            alt="City skyline"
            className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-[20s] hover:scale-110"
          />
          <div className="relative z-10 mx-auto w-full max-w-2xl px-4 py-8 text-center sm:py-0">
            <h1 className="animate-fade-up text-xl font-bold text-white sm:text-3xl md:text-5xl">
              Find Your Perfect{" "}
              <span className="text-primary">Rental Home</span>{" "}
              in India
            </h1>
            <p className="mt-2 animate-fade-up text-sm text-white/70 opacity-0 stagger-2 sm:mt-3 sm:text-base md:text-lg">
              Search thousands of rental listings across every city and town in India
            </p>
            <form onSubmit={handleSearch} className="mt-4 flex animate-fade-up flex-col gap-2 opacity-0 stagger-3 sm:mt-6 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by city, area..."
                  className="h-11 bg-white pl-10 !text-gray-900 placeholder:!text-gray-500 transition-shadow duration-300 focus:shadow-lg focus:shadow-primary/10"
                />
              </div>
              <Button type="submit" className="h-9 w-full gap-1.5 rounded-full px-5 text-xs font-semibold shadow-md shadow-primary/25 transition-all duration-300 active:scale-95 hover:shadow-lg hover:shadow-primary/30 sm:h-11 sm:w-auto sm:gap-2 sm:px-6 sm:text-sm">
                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Search
              </Button>
            </form>
          </div>
        </section>

        {/* Browse by Category */}
        <section className="bg-secondary py-6 sm:py-12">
          <div className="container mx-auto px-3 sm:px-4">
            <h2 className="animate-fade-up text-center text-lg font-bold text-foreground sm:text-2xl md:text-3xl">
              Browse by Category
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-4 lg:grid-cols-6">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat.type}
                  onClick={() => navigate(`/rentals?type=${cat.type}`)}
                  className={`group flex animate-scale-up flex-col items-center gap-1 rounded-lg border border-border bg-card p-2.5 opacity-0 shadow-sm transition-all duration-300 active:scale-95 hover:-translate-y-1 hover:border-primary hover:shadow-md sm:gap-3 sm:rounded-xl sm:p-5 stagger-${i + 1}`}
                >
                  <cat.icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110 sm:h-8 sm:w-8" />
                  <span className="text-[11px] font-medium text-foreground sm:text-sm">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Listings */}
        <section className="py-6 sm:py-12">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex items-center justify-between">
              <h2 className="animate-fade-up text-lg font-bold text-foreground sm:text-2xl md:text-3xl">
                Recent Listings
              </h2>
              <Button variant="ghost" size="sm" className="group transition-all duration-300" asChild>
                <a href="/rentals">
                  View all <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
            {loading ? (
              <div className="flex justify-center py-12 sm:py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : listings.length === 0 ? (
              <p className="animate-fade-in py-12 text-center text-muted-foreground sm:py-16">
                No listings yet. Be the first to post one!
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {listings.map((l, i) => (
                  <div key={l.id} className="animate-slide-up opacity-0" style={{ animationDelay: `${i * 0.08}s` }}>
                    <ListingCard listing={l} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-6 sm:py-12">
          <div className="container mx-auto px-3 sm:px-4">
            <h2 className="animate-fade-up text-center text-lg font-bold text-foreground sm:text-2xl md:text-3xl">
              How <span className="text-primary">RentMiliga</span> Works
            </h2>
            <div className="mt-4 grid gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-6">
              {STEPS.map((s, i) => (
                <div
                  key={s.num}
                  className={`group flex animate-fade-up flex-col items-center rounded-lg border border-border bg-card p-4 text-center opacity-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-xl sm:p-6 stagger-${i + 1}`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10 sm:text-sm">
                    {s.num}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground sm:mt-4 sm:text-lg">{s.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
