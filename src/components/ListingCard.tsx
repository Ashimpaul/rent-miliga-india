import { Link } from "react-router-dom";
import { Phone, MapPin, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/supabase";

const ListingCard = ({ listing }: { listing: Listing }) => {
  const imageUrl = listing.image1 || "/placeholder.svg";

  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link to={`/listing/${listing.id}`}>
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center gap-1 text-lg font-bold text-primary">
          <IndianRupee className="h-4 w-4" />
          {listing.rent.toLocaleString("en-IN")}/mo
        </div>
        <Link to={`/listing/${listing.id}`}>
          <h3 className="mt-1 font-semibold text-foreground line-clamp-1 hover:underline">
            {listing.title}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {listing.area}, {listing.city}
        </div>
        <p className="mt-1 text-xs text-muted-foreground capitalize">{listing.property_type}</p>
        {listing.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
        )}
        <Button size="sm" className="mt-3 w-full" asChild>
          <a href={`tel:${listing.phone_number}`}>
            <Phone className="mr-1 h-3 w-3" /> Call Owner
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ListingCard;
