import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase, type Listing } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
// import AdPopup from "@/components/AdPopup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Home, Building2, Hotel, Building, Store, Loader2, ArrowRight, PlusCircle, MapPin, LogOut, Plus, Calendar, BookOpen, Bed } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const CATEGORIES = [
  { label: "Rooms", icon: Home, type: "room" },
  { label: "Apartments", icon: Building2, type: "apartment" },
  { label: "Houses", icon: Home, type: "house" },
  { label: "PG", icon: Hotel, type: "pg" },
  { label: "Hostels", icon: Building, type: "hostel" },
  { label: "Homestays", icon: Bed, type: "homestay" },
  { label: "Commercial", icon: Store, type: "commercial" },
];

const STEPS = [
  { num: 1, title: "Search", desc: "Browse thousands of rental listings by city, budget, or property type." },
  { num: 2, title: "Explore", desc: "View detailed information, photos, and amenities of properties you like." },
  { num: 3, title: "Connect", desc: "Contact the property owner directly and move into your new home!" },
];

const POPULAR_LOCATIONS_INDIA = [
  "Silchar",
  "Guwahati",
  "Dibrugarh",
  "Jorhat",
  "Tezpur",
  "Karimganj",
  "Hailakandi",
];

const POPULAR_LOCATIONS_NEPAL = [
  "Kathmandu",
  "Pokhara",
  "Lalitpur",
  "Bharatpur",
  "Biratnagar",
  "Birgunj",
  "Dharan",
];

const Index = () => {
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const navigate = useNavigate();

  const popularLocations = POPULAR_LOCATIONS_INDIA;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from("blogs")
          .select("id, title, slug, excerpt, image_url, created_at")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) {
          console.error("Error fetching blogs for home:", error);
        } else {
          setBlogs(data || []);
        }
      } catch (err) {
        console.error("Blog fetch exception:", err);
      } finally {
        setBlogsLoading(false);
      }
    };

    fetchBlogs();

    setLoading(true);
    supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setListings((data as any) || []);
        setLoading(false);
      });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    const query = search.toLowerCase();
    const nearMeKeywords = ["near me", "nearby", "around me", "my location"];
    const containsNearMe = nearMeKeywords.some(k => query.includes(k));

    if (containsNearMe) {
      toast.info("Detecting your location...", { icon: "📍" });
      
      let propertyType = "";
      let cleanQuery = query;
      nearMeKeywords.forEach(k => { cleanQuery = cleanQuery.replace(k, "").trim(); });
      
      const propertyTypes = ["pg", "room", "house", "apartment", "hostel", "homestay", "commercial"];
      propertyType = propertyTypes.find(t => cleanQuery.includes(t)) || "";

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              // Using a slightly different geocoding endpoint or parameters might help
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12`);
              const data = await res.json();
              const addr = data.address || {};
              
              // Prioritize city-level names
              const city = addr.city || addr.town || addr.village || addr.municipality;
              const district = addr.state_district || addr.county;
              const locationName = city || district || "";
              
              if (locationName) {
                // IMPORTANT: Use both q (city) and type to ensure strict filtering
                const params = new URLSearchParams();
                params.set("q", locationName);
                if (propertyType) params.set("type", propertyType);
                params.set("nearMe", "true"); // Mark this as a nearby search
                
                toast.success(`Location found: ${locationName}`);
                navigate(`/rentals?${params.toString()}`);
              } else {
                toast.error("Could not pinpoint your city. Please type it manually.");
                navigate(`/rentals?error=location_not_found&type=${propertyType}`);
              }
            } catch (err) {
              toast.error("Location service busy. Please try again.");
              navigate(`/rentals?error=location_not_found&type=${propertyType}`);
            }
          },
          (error) => {
            toast.error("Location permission required for 'near me' search.");
            navigate(`/rentals?error=location_denied&type=${propertyType}`);
          },
          { timeout: 8000, enableHighAccuracy: true }
        );
      } else {
        toast.error("Geolocation is not supported by your browser.");
        navigate(`/rentals?error=unsupported&type=${propertyType}`);
      }
    } else {
      // Normal search: if it's just "PG", search as type, not city
      const potentialType = ["pg", "room", "apartment", "house", "hostel", "homestay", "commercial"].find(t => query === t);
      if (potentialType) {
        navigate(`/rentals?type=${potentialType}`);
      } else {
        navigate(`/rentals?q=${encodeURIComponent(search.trim())}`);
      }
    }
  };

  const filteredListings = listings;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <title>RentMilega | Find & Post Rental Listings in India</title>
        <meta name="description" content={`Find the best houses, rooms, and PGs for rent in India. Verified listings with direct owner contact.`} />
      </Helmet>
      <Header />
      {/* <AdPopup 
        type="image" 
        src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80" 
        link="https://rentmilega.in/post"
        delay={3000}
      /> */}
      <main className="flex-1 pb-20 sm:pb-0 overflow-x-hidden">
        {/* Hero - Optimized for mobile/desktop split */}
        <section 
          className="relative flex min-h-[50vh] items-center justify-center overflow-hidden bg-zinc-950 sm:min-h-[500px] md:min-h-[650px] bg-fixed bg-cover bg-center"
          style={{ 
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80")' 
          }}
        >
          <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-8 text-center sm:py-0">
            <h1 className="animate-fade-up text-3xl font-extrabold tracking-tight text-white sm:text-5xl md:text-7xl leading-tight">
              Find Houses and Rooms for <span className="text-primary italic">Rent in India</span>
            </h1>
            <p className="mt-4 animate-fade-up text-sm text-white/90 opacity-0 stagger-2 sm:text-xl md:text-2xl font-light sm:mt-6 max-w-2xl mx-auto">
              RentMilega is a premier rental platform helping people find houses, rooms, flats and PG accommodations across Assam and beyond.
            </p>
            
            {/* Desktop Only Search Form */}
            <form onSubmit={handleSearch} className="hidden sm:flex mt-12 animate-fade-up flex-col gap-2 opacity-0 stagger-3 sm:flex-row backdrop-blur-md bg-white/5 p-1.5 rounded-xl border border-white/10 shadow-2xl max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by city (e.g. Silchar, Guwahati)..."
                  className="h-14 bg-transparent border-none text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg pl-12"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 w-full gap-2 rounded-xl px-10 text-lg font-bold shadow-xl transition-all duration-300 active:scale-95 hover:scale-[1.02] sm:w-auto">
                Search
              </Button>
            </form>
            
            <div className="mt-8 flex animate-fade-up flex-col items-center justify-center gap-4 opacity-0 stagger-4 sm:flex-row sm:mt-10">
              <Button
                onClick={() => navigate("/post")}
                size="lg"
                className="h-12 w-full rounded-xl bg-white text-primary px-6 text-sm font-black shadow-2xl transition-all duration-300 hover:scale-[1.05] active:scale-95 sm:h-14 sm:w-auto sm:rounded-xl sm:text-lg sm:px-8 group border-2 border-white/20 hover:bg-primary hover:text-white"
              >
                <PlusCircle className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90 sm:h-6 sm:w-6" />
                Post Your Property Free
              </Button>
            </div>
          </div>
        </section>

        {/* Mobile: Top Deals Scroller (OLX Style circular icons) */}
        {!loading && filteredListings.length > 0 && (
          <div className="bg-muted/30 py-6 sm:hidden border-b border-border">
            <div className="px-4 mb-3 flex justify-between items-center">
              <h2 className="text-sm font-bold">Top Deals in Silchar</h2>
              <Link to="/rentals" className="text-xs text-primary font-semibold">View all</Link>
            </div>
            <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar">
              {filteredListings.slice(0, 6).map((l) => (
                <Link key={l.id} to={`/listing/${l.id}`} className="flex flex-col items-center gap-1.5 w-20 shrink-0">
                  <div className="w-20 h-20 rounded-full border-2 border-primary/30 p-0.5 overflow-hidden bg-card">
                    <img 
                      src={l.image1 || "/placeholder.svg"} 
                      alt="" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-foreground truncate w-full text-center">
                    ₹{l.rent.toLocaleString("en-IN")}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Horizontal Category Scroller (OLX Style) */}
        <div className="bg-card py-4 sm:hidden overflow-x-auto no-scrollbar border-b border-border">
          <div className="flex gap-4 px-4 min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.type}
                onClick={() => navigate(`/rentals?type=${cat.type}`)}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="w-16 h-16 rounded-full bg-primary/5 border-2 border-primary/20 flex items-center justify-center transition-all active:scale-95">
                  <cat.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Locations */}
        <section className="bg-muted/30 py-8 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground sm:text-3xl">Popular Locations in India</h2>
              <Link to="/rentals" className="text-xs font-semibold text-primary hover:underline sm:text-sm">View All</Link>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              {popularLocations.map((loc) => (
                <Button
                  key={loc}
                  variant="outline"
                  className="h-10 rounded-full border-border bg-card px-4 text-xs font-medium hover:border-primary hover:bg-primary/5 hover:text-primary sm:h-12 sm:px-6 sm:text-sm"
                  asChild
                >
                  <Link to={`/rentals?q=${encodeURIComponent(loc)}`}>{loc}</Link>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Listings */}
        <section className="py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-end justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-center">
              <div>
                <h2 className="animate-fade-up text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                  Recent Rental Listings
                </h2>
                <p className="mt-3 text-base text-muted-foreground sm:text-lg">Discover the latest rental opportunities near you</p>
              </div>
              <Button variant="link" size="lg" className="group text-lg font-bold p-0 h-auto" asChild>
                <Link to="/rentals" className="flex items-center">
                  View All <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary/50" />
              </div>
            ) : filteredListings.length === 0 ? (
              <p className="animate-fade-in py-20 text-center text-muted-foreground text-lg italic">
                No listings yet in India. Be the first to post one!
              </p>
            ) : (
              <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredListings.map((l, i) => (
                  <div key={l.id} className="animate-slide-up opacity-0" style={{ animationDelay: `${i * 0.1}s` }}>
                    <ListingCard listing={l} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Latest from Blog */}
        {blogs.length > 0 && (
          <section className="py-12 sm:py-32 border-t border-border/50">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-center text-center sm:text-left">
                <div className="w-full">
                  <h2 className="animate-fade-up text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Latest News & Tips
                  </h2>
                  <p className="mt-3 text-base text-muted-foreground sm:text-lg max-w-xl mx-auto sm:mx-0">Stay updated with rental insights and real estate trends</p>
                </div>
                <Button variant="link" size="lg" className="group text-lg font-bold p-0 h-auto" asChild>
                  <Link to="/blogs" className="flex items-center">
                    View All Blog <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                {blogs.map((blog, i) => (
                  <Link 
                    key={blog.id} 
                    to={`/blog/${blog.slug}`} 
                    className="group animate-fade-up opacity-0" 
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md h-full flex flex-col">
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={blog.image_url || "/placeholder.svg"}
                          alt={blog.title}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <Calendar className="h-3 w-3" />
                          {blog.created_at ? format(new Date(blog.created_at), "MMM d, yyyy") : "Recently"}
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {blog.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                          {blog.excerpt || "Stay updated with the latest rental insights and trends from the RentMilega blog."}
                        </p>
                        <div className="mt-auto flex items-center text-primary font-bold text-sm">
                          Read More <ArrowRight className="ml-1.5 h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Browse by Category */}
        <section className="py-12 sm:py-32 border-t border-border/50 bg-muted/5">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="animate-fade-up text-2xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Browse by Category
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-lg sm:mt-4">Find the specific type of property that fits your needs</p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 sm:mt-16">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat.type}
                  onClick={() => navigate(`/rentals?type=${cat.type}`)}
                  className={`group flex animate-scale-up flex-col items-center gap-4 rounded-2xl border border-border bg-card p-5 opacity-0 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-xl hover:bg-primary/[0.02] stagger-${i + 1} sm:rounded-3xl sm:p-8 sm:gap-6`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-6 sm:h-20 sm:w-20 sm:rounded-2xl">
                    <cat.icon className="h-6 w-6 transition-transform duration-500 group-hover:scale-110 sm:h-10 sm:w-10" />
                  </div>
                  <span className="text-sm font-bold tracking-tight text-foreground sm:text-lg">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 sm:py-32 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="animate-fade-up text-2xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Experience <span className="text-primary">Simplicity</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-lg sm:mt-4">Getting your next home has never been easier</p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-3 sm:mt-20 sm:gap-12">
              {STEPS.map((s, i) => (
                <div
                  key={s.num}
                  className={`group relative flex animate-fade-up flex-col items-center text-center opacity-0 stagger-${i + 1}`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-lg font-black text-primary shadow-inner transition-all duration-500 group-hover:rounded-2xl group-hover:bg-primary group-hover:text-white sm:h-20 sm:w-20 sm:rounded-[2.5rem] sm:text-2xl">
                    {s.num}
                  </div>
                  <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground sm:text-2xl sm:mt-8">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-light sm:text-lg sm:mt-4">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Promotional Banner */}
        <section className="container mx-auto px-4 py-8 sm:py-24">
          <div className="relative overflow-hidden rounded-3xl bg-zinc-950 px-6 py-10 text-center sm:px-16 sm:py-24 sm:rounded-[2.5rem]">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80')] bg-cover bg-center opacity-20 grayscale" />
            <div className="relative z-10">
              <h2 className="animate-fade-up text-2xl font-bold tracking-tight text-white sm:text-4xl md:text-6xl">
                Post Your Property for <span className="text-primary italic">Rent</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl animate-fade-up text-sm text-white/70 opacity-0 stagger-1 sm:text-xl leading-relaxed font-light sm:mt-8">
                Whether you're in India, Nepal, or anywhere in between, join thousands of owners who found their perfect tenants through RentMilega. Post your property — it's completely free!
              </p>
              <div className="mt-8 flex animate-fade-up flex-col items-center justify-center gap-3 opacity-0 stagger-2 sm:flex-row sm:mt-12 sm:gap-4">
                <Button
                  onClick={() => navigate("/rentals")}
                  size="lg"
                  className="h-12 w-full rounded-xl bg-primary px-8 text-base font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 sm:h-14 sm:w-auto sm:rounded-2xl sm:px-10 sm:text-lg"
                >
                  Browse Rentals
                </Button>
                <Button
                  onClick={() => navigate("/post")}
                  variant="outline"
                  size="lg"
                  className="h-12 w-full rounded-xl border-white/20 bg-white/5 px-8 text-base font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/40 active:scale-95 sm:h-14 sm:w-auto sm:rounded-2xl sm:px-10 sm:text-lg"
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
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/60 sm:text-base">
                  Partnership Opportunities
                </p>
                <p className="mt-3 text-base text-muted-foreground/50 font-light italic">
                  Showcase your brand to thousands of property seekers
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      
      {/* Mobile Bottom Navigation Bar (App Style) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border sm:hidden h-16 flex items-center justify-around px-2 pb-safe">
        <Link to="/home" className="flex flex-col items-center gap-1 text-muted-foreground">
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">HOME</span>
        </Link>
        <Link to="/" className="flex flex-col items-center gap-1 text-primary">
          <Search className="h-5 w-5" />
          <span className="text-[10px] font-bold">SEARCH</span>
        </Link>
        
        {/* The Post Button is absolute and sits above this nav */}
        <div className="w-12" /> 
        
        <Link to="/rentals" className="flex flex-col items-center gap-1 text-muted-foreground">
          <MapPin className="h-5 w-5" />
          <span className="text-[10px] font-medium">LOCATIONS</span>
        </Link>
        <Link to="/blogs" className="flex flex-col items-center gap-1 text-muted-foreground">
          <BookOpen className="h-5 w-5" />
          <span className="text-[10px] font-medium">BLOG</span>
        </Link>
      </div>

      {/* Mobile Floating Action Button (Centered like OLX) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] sm:hidden">
        <Button
          onClick={() => navigate("/post")}
          className="h-14 w-14 rounded-full bg-white text-primary p-0 shadow-[0_8px_30px_rgb(0,0,0,0.3)] border-4 border-primary flex items-center justify-center transition-all duration-300 active:scale-90 hover:bg-primary hover:text-white group"
        >
          <Plus className="h-8 w-8 group-hover:rotate-90 transition-transform duration-300" />
        </Button>
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-black text-primary bg-white px-1 rounded shadow-sm">POST</span>
      </div>
    </div>
  );
};

export default Index;
