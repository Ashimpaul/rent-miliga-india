import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase, type Listing } from "@/lib/supabase";
import { Home, Search, MapPin, LogOut, Plus, Loader2, BookOpen, AlertCircle, Navigation } from "lucide-react";
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
  
  const searchError = searchParams.get("error");
  const isNearbySearch = searchParams.get("nearMe") === "true";

  const [filters, setFilters] = useState(() => {
    const q = searchParams.get("q") || location || "";
    const type = searchParams.get("type") || "";
    
    const propertyTypes = ["room", "apartment", "house", "pg", "hostel", "homestay", "commercial"];
    const lowercaseQ = q.toLowerCase().trim();
    
    if (propertyTypes.includes(lowercaseQ)) {
      return { ...defaultFilters, city: "", propertyType: lowercaseQ };
    }
    
    return { ...defaultFilters, city: q, propertyType: type };
  });

  useEffect(() => {
    const q = searchParams.get("q") || location || "";
    const type = searchParams.get("type") || "";
    
    const propertyTypes = ["room", "apartment", "house", "pg", "hostel", "homestay", "commercial"];
    const lowercaseQ = q.toLowerCase().trim();
    
    if (propertyTypes.includes(lowercaseQ)) {
      setFilters(prev => ({ ...prev, city: "", propertyType: lowercaseQ }));
    } else {
      setFilters(prev => ({ ...prev, city: q, propertyType: type }));
    }
  }, [searchParams, location]);

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
    // If the search specifically failed to find a location, don't show any results 
    // to avoid confusing the user with results from other cities.
    if (searchError) return [];

    return listings.filter((l) => {
      // Country Filter
      const listingCountry = (l as any).country || "India";
      if (listingCountry !== country) return false;

      if (filters.city) {
        const query = filters.city.toLowerCase().trim();
        const matchesCity = l.city.toLowerCase() === query;
        const matchesArea = l.area.toLowerCase() === query;
        
        // Don't match the entire state unless the query IS the state name
        const matchesState = l.state.toLowerCase() === query;
        
        // Also allow partial matches but ONLY if they are very specific to the city name
        const partialCity = l.city.toLowerCase().includes(query) && query.length > 3;
        
        if (!matchesCity && !matchesArea && !matchesState && !partialCity) return false;
      }
      if (filters.area && !l.area.toLowerCase().includes(filters.area.toLowerCase())) return false;
      if (filters.propertyType && filters.propertyType !== "all" && l.property_type !== filters.propertyType) return false;
      if (filters.minRent && l.rent < Number(filters.minRent)) return false;
      if (filters.maxRent && l.rent > Number(filters.maxRent)) return false;
      return true;
    });
  }, [listings, filters, country, searchError]);

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

          {(filters.city || filters.propertyType) && (
            <div className="mt-4 flex flex-wrap gap-2 animate-fade-up">
              {filters.city && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary uppercase tracking-wider">
                  <MapPin className="h-3 w-3" />
                  {filters.city}
                </div>
              )}
              {filters.propertyType && filters.propertyType !== "all" && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-muted border border-border rounded-full text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <Home className="h-3 w-3" />
                  {filters.propertyType}
                </div>
              )}
              {isNearbySearch && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                  <Navigation className="h-3 w-3" />
                  Near My Location
                </div>
              )}
            </div>
          )}

          {searchError && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 animate-fade-up">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-destructive">Location Error</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {searchError === "location_denied" 
                    ? "Location access was denied. Please type your city name manually in the filter above."
                    : "We couldn't determine your exact location. Please enter your city manually."}
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12 sm:py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center sm:py-20">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No listings found</h3>
              <p className="text-muted-foreground mt-1 max-w-xs mx-auto">
                We couldn't find any {filters.propertyType || 'rentals'} in {filters.city || 'your current area'}.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setFilters(defaultFilters)}
                >
                  Clear all filters
                </Button>
                {!filters.city && (
                  <Button 
                    className="gap-2"
                    onClick={() => {
                      const searchFiltersElement = document.querySelector('button[title="Search near my current location"]');
                      if (searchFiltersElement instanceof HTMLButtonElement) {
                        searchFiltersElement.click();
                      }
                    }}
                  >
                    <Navigation className="h-4 w-4" />
                    Search Near Me
                  </Button>
                )}
              </div>
            </div>
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

export default Rentals;
