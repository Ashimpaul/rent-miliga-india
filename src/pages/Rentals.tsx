import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase, type Listing } from "@/lib/supabase";
import { Home, Search, MapPin, LogOut, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeaderComponent from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import SearchFilters from "@/components/SearchFilters";
import { useCountry } from "../contexts/CountryContext";

const defaultFilters = { city: "", area: "", propertyType: "", minRent: "", maxRent: "" };

const Rentals = () => {
  const [searchParams] = useSearchParams();
  const { location } = useParams();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { country } = useCountry();
  
  const [filters, setFilters] = useState(() => {
    const q = searchParams.get("q") || location || "";
    const type = searchParams.get("type") || "";
    return { ...defaultFilters, city: q, propertyType: type };
  });

  useEffect(() => {
    // Update filters if location parameter changes (e.g. via direct link)
    if (location) {
      setFilters(prev => ({ ...prev, city: location }));
    }
  }, [location]);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setListings(data || []);
        setLoading(false);
      });
  }, [country]);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      // Country Filter
      const listingCountry = (l as any).country || "India";
      if (listingCountry !== country) return false;

      if (filters.city) {
        const query = filters.city.toLowerCase();
        const matchesCity = l.city.toLowerCase().includes(query);
        const matchesArea = l.area.toLowerCase().includes(query);
        const matchesState = l.state.toLowerCase().includes(query);
        const matchesTitle = l.title.toLowerCase().includes(query);
        
        if (!matchesCity && !matchesArea && !matchesState && !matchesTitle) return false;
      }
      if (filters.area && !l.area.toLowerCase().includes(filters.area.toLowerCase())) return false;
      if (filters.propertyType && filters.propertyType !== "all" && l.property_type !== filters.propertyType) return false;
      if (filters.minRent && l.rent < Number(filters.minRent)) return false;
      if (filters.maxRent && l.rent > Number(filters.maxRent)) return false;
      return true;
    });
  }, [listings, filters, country]);

  const pageTitle = filters.city 
    ? `Rent Houses, Rooms & PGs in ${filters.city.charAt(0).toUpperCase() + filters.city.slice(1)} | RentMilega`
    : `Browse Rental Properties in ${country} | RentMilega`;

  return (
    <div className="flex min-h-screen flex-col">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={filters.city ? `Find the best houses, rooms, and PGs for rent in ${filters.city}. Browse verified listings on RentMilega.` : `Search through our extensive list of rental properties in ${country}. Filter by city, area, rent, and property type.`} />
      </Helmet>
      <HeaderComponent />
      <main className="flex-1 pb-20 sm:pb-0">
        <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
          <h1 className="text-lg font-bold text-foreground sm:text-2xl">Find Rentals in {country}</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Browse rental listings across {country}</p>

          <div className="mt-3 sm:mt-4">
            <SearchFilters filters={filters} onChange={setFilters} />
          </div>

          {loading ? (
            <div className="flex justify-center py-12 sm:py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground sm:py-20">
              No listings found. Be the first to post one!
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-2 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
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
        <Link to="/admin" className="flex flex-col items-center gap-1 text-muted-foreground">
          <LogOut className="h-5 w-5" />
          <span className="text-[10px] font-medium">ADMIN</span>
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

export default Rentals;
