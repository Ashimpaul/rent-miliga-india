import { Link } from "react-router-dom";
import { Phone, MapPin, IndianRupee, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const ListingCard = ({ listing, onDelete }: { listing: Listing; onDelete?: (id: string) => void }) => {
  const imageUrl = listing.image1 || "/placeholder.svg";
  const { isAdmin } = useAuth();

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl active:scale-[0.98]">
      <Link to={`/listing/${listing.id}`}>
        <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[4/3]">
          <img
            src={imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md opacity-0 transition-all duration-500 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
            <IndianRupee className="h-3 w-3" />
            {listing.rent.toLocaleString("en-IN")}
          </div>
        </div>
      </Link>
      <div className="p-4 transition-colors duration-300 group-hover:bg-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-base font-bold text-primary sm:text-lg">
            <IndianRupee className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {listing.rent.toLocaleString("en-IN")}/mo
          </div>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            {listing.property_type}
          </span>
        </div>
        <Link to={`/listing/${listing.id}`}>
          <h3 className="mt-2 text-sm font-bold text-foreground line-clamp-1 transition-colors duration-200 hover:text-primary sm:text-base">
            {listing.title}
          </h3>
        </Link>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">{listing.area}, {listing.city}</span>
        </div>
        {listing.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed sm:text-sm">{listing.description}</p>
        )}
        <div className="mt-4 flex gap-2">
          <Button size="sm" className="flex-1 text-xs font-bold transition-all duration-300 active:scale-95 hover:shadow-lg sm:text-sm" asChild>
            <a href={`tel:${listing.phone_number}`}>
              <Phone className="mr-1.5 h-3.5 w-3.5" /> Call Owner
            </a>
          </Button>
          {isAdmin && onDelete && (
            <Button
              size="sm"
              variant="destructive"
              className="px-3 text-xs font-bold transition-all duration-300 active:scale-95 hover:shadow-lg sm:text-sm"
              onClick={() => onDelete(listing.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
