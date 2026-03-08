import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROPERTY_TYPES = ["room", "apartment", "house", "pg", "hostel", "commercial"];

type Filters = {
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
  const update = (key: keyof Filters, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      <Input
        placeholder="City"
        value={filters.city}
        onChange={(e) => update("city", e.target.value)}
      />
      <Input
        placeholder="Area"
        value={filters.area}
        onChange={(e) => update("area", e.target.value)}
      />
      <Select
        value={filters.propertyType}
        onValueChange={(v) => update("propertyType", v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Property type" />
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
      <Input
        type="number"
        placeholder="Min rent"
        value={filters.minRent}
        onChange={(e) => update("minRent", e.target.value)}
      />
      <Input
        type="number"
        placeholder="Max rent"
        value={filters.maxRent}
        onChange={(e) => update("maxRent", e.target.value)}
      />
    </div>
  );
};

export default SearchFilters;
