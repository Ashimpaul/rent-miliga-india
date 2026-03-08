import { Link } from "react-router-dom";
import { Phone, MapPin, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/supabase";

const ListingCard = ({ listing }: { listing: Listing }) => {
  const imageUrl = listing.image1 || "/placeholder.svg";

  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]">
      <Link to={`/listing/${listing.id}`}>
        <div className="aspect-[16/10] overflow-hidden sm:aspect-[4/3]">
          <img
            src={imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-1 text-base font-bold text-primary sm:text-lg">
          <IndianRupee className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {listing.rent.toLocaleString("en-IN")}/mo
        </div>
        <Link to={`/listing/${listing.id}`}>
          <h3 className="mt-1 text-sm font-semibold text-foreground line-clamp-1 transition-colors duration-200 hover:text-primary hover:underline sm:text-base">
            {listing.title}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{listing.area}, {listing.city}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground capitalize">{listing.property_type}</p>
        {listing.description && (
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 sm:mt-2 sm:text-sm">{listing.description}</p>
        )}
        <Button size="sm" className="mt-2.5 w-full text-xs transition-all duration-300 active:scale-95 hover:shadow-md sm:mt-3 sm:text-sm" asChild>
          <a href={`tel:${listing.phone_number}`}>
            <Phone className="mr-1 h-3 w-3" /> Call Owner
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ListingCard;
