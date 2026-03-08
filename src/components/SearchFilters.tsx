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
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

const PROPERTY_TYPES = ["room", "apartment", "house", "pg", "hostel", "commercial"];

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

  const update = (key: keyof Filters, value: string) =>
    onChange({ ...filters, [key]: value });

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
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      {/* Top row: search + toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by city or area..."
            value={filters.city}
            onChange={(e) => update("city", e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={expanded ? "default" : "outline"}
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 gap-1.5"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-xs font-bold text-primary">
              {activeCount}
            </span>
          )}
        </Button>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="shrink-0 gap-1 text-muted-foreground">
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Area / Locality</Label>
            <Input
              placeholder="e.g. Koramangala"
              value={filters.area}
              onChange={(e) => update("area", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Property Type</Label>
            <Select
              value={filters.propertyType || "all"}
              onValueChange={(v) => update("propertyType", v)}
            >
              <SelectTrigger>
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
              <SelectTrigger>
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
              />
              <Input
                type="number"
                placeholder="Max ₹"
                value={filters.maxRent}
                onChange={(e) => update("maxRent", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
