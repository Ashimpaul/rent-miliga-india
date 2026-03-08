import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase, type Listing } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import SearchFilters from "@/components/SearchFilters";
import { Loader2 } from "lucide-react";

const defaultFilters = { city: "", area: "", propertyType: "", minRent: "", maxRent: "" };

const Rentals = () => {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => {
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "";
    return { ...defaultFilters, city: q, propertyType: type };
  });

  useEffect(() => {
    supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setListings(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (filters.city && !l.city.toLowerCase().includes(filters.city.toLowerCase()) && !l.area.toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters.area && !l.area.toLowerCase().includes(filters.area.toLowerCase())) return false;
      if (filters.propertyType && filters.propertyType !== "all" && l.property_type !== filters.propertyType) return false;
      if (filters.minRent && l.rent < Number(filters.minRent)) return false;
      if (filters.maxRent && l.rent > Number(filters.maxRent)) return false;
      return true;
    });
  }, [listings, filters]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">Find Rentals</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse rental listings across India</p>

          <div className="mt-4">
            <SearchFilters filters={filters} onChange={setFilters} />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">
              No listings found. Be the first to post one!
            </p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Rentals;
