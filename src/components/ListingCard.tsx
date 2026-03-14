import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Phone, MapPin, IndianRupee, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import WatermarkedImage from "./WatermarkedImage";

const ListingCard = ({ listing, onDelete }: { listing: Listing; onDelete?: (id: string) => void }) => {
  const images = [listing.image1, listing.image2, listing.image3].filter(Boolean) as string[];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl active:scale-[0.98]">
      <Link to={`/listing/${listing.id}`} aria-label={`View details for ${listing.title}`}>
        <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[4/3]">
          {images.length > 0 ? (
            images.map((img, index) => (
              <div
                key={img}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <WatermarkedImage
                  src={img}
                  alt={`Rental property: ${listing.title} in ${listing.area}, ${listing.city}`}
                  imageClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            ))
          ) : (
            <WatermarkedImage
              src="/placeholder.svg"
              alt="Placeholder"
              imageClassName="h-full w-full object-cover"
            />
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-20 pointer-events-none" />
          
          {/* Rent Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md opacity-0 transition-all duration-500 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 z-30 pointer-events-none">
            <IndianRupee className="h-3 w-3" />
            {listing.rent.toLocaleString("en-IN")}
          </div>

          {/* Image Counter Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 flex gap-1 z-30 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              {images.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 w-3 rounded-full transition-all duration-300 ${
                    i === currentImageIndex ? "bg-white w-5" : "bg-white/40"
                  }`} 
                />
              ))}
            </div>
          )}
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
