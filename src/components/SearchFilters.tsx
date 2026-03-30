import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PROPERTY_TYPES = ["room", "apartment", "house", "pg", "hostel", "homestay", "commercial"];

const RENT_RANGES = [
  { label: "Any", min: "", max: "" },
  { label: "Under ₹5,000", min: "", max: "5000" },
  { label: "₹5,000 – ₹10,000", min: "5000", max: "10000" },
  { label: "₹10,000 – ₹20,000", min: "10000", max: "20000" },
  { label: "₹20,000 – ₹50,000", min: "20000", max: "50000" },
  { label: "₹50,000+", min: "50000", max: "" },
];

export type Filters = {
  city: string;
  area: string;
  propertyType: string;
  minRent: string;
  maxRent: string;
};

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

const SearchFilters = ({ filters, onChange }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [locating, setLocating] = useState(false);

  const update = (key: keyof Filters, value: string) => {
    const query = value.toLowerCase();
    const nearMeKeywords = ["near me", "nearby", "around me", "my location"];
    const containsNearMe = nearMeKeywords.some(k => query.includes(k));

    if (key === "city" && containsNearMe) {
      // Extract property type from the query if present
      let propertyType = filters.propertyType;
      let cleanQuery = query;
      nearMeKeywords.forEach(k => { cleanQuery = cleanQuery.replace(k, "").trim(); });

      if (cleanQuery.includes("pg")) propertyType = "pg";
      else if (cleanQuery.includes("room")) propertyType = "room";
      else if (cleanQuery.includes("house")) propertyType = "house";
      else if (cleanQuery.includes("apartment") || cleanQuery.includes("flat")) propertyType = "apartment";
      else if (cleanQuery.includes("hostel")) propertyType = "hostel";
      else if (cleanQuery.includes("homestay")) propertyType = "homestay";
      else if (cleanQuery.includes("commercial")) propertyType = "commercial";

      handleNearMe(propertyType);
    } else {
      onChange({ ...filters, [key]: value });
    }
  };

  const handleNearMe = (propertyTypeOverride?: string) => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported");
      return;
    }

    setLocating(true);
    toast.info("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
          const data = await res.json();
          const addr = data.address || {};
          const locationName = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.state_district || "";
          
          if (locationName) {
            toast.success(`Found: ${locationName}`);
            onChange({ 
              ...filters, 
              city: locationName,
              propertyType: propertyTypeOverride || filters.propertyType 
            });
          } else {
            toast.error("Could not determine your city accurately.");
          }
        } catch (err) {
          toast.error("Location detection failed");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        toast.error("Location access denied");
      },
      { timeout: 10000 }
    );
  };

  const activeCount = [
    filters.city,
    filters.area,
    filters.propertyType && filters.propertyType !== "all" ? filters.propertyType : "",
    filters.minRent,
    filters.maxRent,
  ].filter(Boolean).length;

  const clearAll = () =>
    onChange({ city: "", area: "", propertyType: "", minRent: "", maxRent: "" });

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-sm sm:rounded-xl sm:p-4">
      {/* Top row: search + toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search city or type 'near me'..."
            value={filters.city}
            onChange={(e) => update("city", e.target.value)}
            className="pl-10 pr-10 text-sm"
          />
          <button
            onClick={handleNearMe}
            disabled={locating}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            title="Search near my current location"
          >
            <MapPin className={`h-4 w-4 ${locating ? 'animate-bounce' : ''}`} />
          </button>
        </div>
        <Button
          variant={expanded ? "default" : "outline"}
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 gap-1 px-2.5 sm:gap-1.5 sm:px-3"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-[10px] font-bold text-primary sm:h-5 sm:w-5 sm:text-xs">
              {activeCount}
            </span>
          )}
        </Button>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="shrink-0 gap-1 px-2 text-muted-foreground sm:px-3">
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:mt-4 sm:grid-cols-2 sm:gap-4 sm:pt-4 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Area / Locality</Label>
            <Input
              placeholder="e.g. Koramangala"
              value={filters.area}
              onChange={(e) => update("area", e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Property Type</Label>
            <Select
              value={filters.propertyType || "all"}
              onValueChange={(v) => update("propertyType", v)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {PROPERTY_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Budget Range</Label>
            <Select
              value={`${filters.minRent}-${filters.maxRent}`}
              onValueChange={(v) => {
                const [min, max] = v.split("-");
                onChange({ ...filters, minRent: min, maxRent: max });
              }}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Any budget" />
              </SelectTrigger>
              <SelectContent>
                {RENT_RANGES.map((r) => (
                  <SelectItem key={r.label} value={`${r.min}-${r.max}`}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Custom Rent</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min ₹"
                value={filters.minRent}
                onChange={(e) => update("minRent", e.target.value)}
                className="text-sm"
              />
              <Input
                type="number"
                placeholder="Max ₹"
                value={filters.maxRent}
                onChange={(e) => update("maxRent", e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
