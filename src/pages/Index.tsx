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
        <section className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-foreground/90 sm:min-h-[420px]">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
            alt="City skyline"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
            <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-5xl">
              Find Your Perfect{" "}
              <span className="text-primary">Rental Home</span>{" "}
              in India
            </h1>
            <p className="mt-3 text-base text-white/70 sm:text-lg">
              Search thousands of rental listings across every city and town in India
            </p>
            <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by city, area, or locality..."
                  className="h-11 bg-white pl-10 text-foreground"
                />
              </div>
              <Button type="submit" size="default" className="h-9 w-full px-4 text-sm sm:h-11 sm:w-auto sm:px-6 sm:text-base">
                Search
              </Button>
            </form>
          </div>
        </section>

        {/* Browse by Category */}
        <section className="bg-secondary py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
              Browse by Category
            </h2>
            <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.type}
                  onClick={() => navigate(`/rentals?type=${cat.type}`)}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:border-primary hover:shadow-md sm:gap-3 sm:rounded-xl sm:p-5"
                >
                  <cat.icon className="h-5 w-5 text-primary sm:h-8 sm:w-8" />
                  <span className="text-xs font-medium text-foreground sm:text-sm">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Listings */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Recent Listings
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <a href="/rentals">View all <ArrowRight className="ml-1 h-4 w-4" /></a>
              </Button>
            </div>
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : listings.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">
                No listings yet. Be the first to post one!
              </p>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {listings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How It Works — at the end */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
              How <span className="text-primary">RentMiliga</span> Works
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.num} className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {s.num}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
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
