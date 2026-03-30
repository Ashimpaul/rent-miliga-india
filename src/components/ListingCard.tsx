import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Phone, MapPin, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import WatermarkedImage from "./WatermarkedImage";
import { toast } from "sonner";

const ListingCard = ({ listing }: { listing: Listing }) => {
  const images = [listing.image1, listing.image2, listing.image3].filter(Boolean) as string[];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // const { isAdmin } = useAuth(); // Hidden on card as requested

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const isNepal = (listing as any).country === "Nepal";
  const currencySymbol = isNepal ? "NPR" : "₹";
  const locale = isNepal ? "en-NP" : "en-IN";

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/listing/${listing.id}`;
    const shareData = {
      title: `${listing.title} | RentMilega`,
      text: `Check out this rental property in ${listing.area}, ${listing.city}: ${listing.title}. Rent: ${currencySymbol}${listing.rent.toLocaleString()}/mo.`,
      url: url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] flex flex-row sm:flex-col h-[180px] sm:h-auto">
      <Link 
        to={`/listing/${listing.id}`} 
        aria-label={`View details for ${listing.title}`}
        className="w-[180px] sm:w-full h-full sm:h-auto shrink-0 overflow-hidden relative"
      >
        <div className="relative h-full sm:aspect-[16/10] overflow-hidden sm:aspect-[4/3]">
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
          
          {/* Overlay Gradient (Hidden on mobile for clarity) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-20 pointer-events-none hidden sm:block" />
          
          {/* Rent Badge (Visible only on desktop as it's redundant on mobile right) */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md opacity-0 transition-all duration-500 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 z-30 pointer-events-none hidden sm:flex">
            <span className="text-[10px] leading-none">{currencySymbol}</span>
            {listing.rent.toLocaleString(locale)}
          </div>

          {/* Image Counter Indicator (Visible on mobile) */}
          {images.length > 1 && (
            <div className="absolute bottom-1.5 right-1.5 flex gap-0.5 z-30 sm:bottom-3 sm:right-3 sm:gap-1">
              {images.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-0.5 w-2 rounded-full transition-all duration-300 sm:h-1 sm:w-3 ${
                    i === currentImageIndex ? "bg-white w-3 sm:w-5" : "bg-white/40"
                  }`} 
                />
              ))}
            </div>
          )}
        </div>
      </Link>
      
      <div className="flex-1 p-3 sm:p-4 transition-colors duration-300 group-hover:bg-accent/5 flex flex-col justify-between overflow-hidden">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5 text-lg font-black text-primary sm:gap-1 sm:text-2xl">
              <span className="text-sm sm:text-base font-bold">{currencySymbol}</span>
              {listing.rent.toLocaleString(locale)}
              <span className="text-[10px] font-normal text-muted-foreground ml-1">/mo</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={handleShare}
                title="Share Listing"
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary sm:rounded-full sm:px-2 sm:text-[10px]">
                {listing.property_type}
              </span>
            </div>
          </div>
          
          <Link to={`/listing/${listing.id}`}>
            <h3 className="mt-1 text-sm font-semibold text-foreground line-clamp-1 transition-colors duration-200 hover:text-primary sm:text-base sm:font-bold sm:mt-2">
              {listing.title}
            </h3>
          </Link>
          
          <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground sm:mt-1.5 sm:gap-1.5 sm:text-sm">
            <MapPin className="h-2.5 w-2.5 shrink-0 text-primary sm:h-3.5 sm:w-3.5" />
            <span className="truncate">{listing.area}, {listing.city}</span>
          </div>
        </div>

        <div className="mt-2 flex gap-1.5 sm:gap-2">
          <Button 
            size="sm" 
            className="h-8 flex-1 text-[10px] font-bold transition-all duration-300 active:scale-95 hover:shadow-lg sm:h-10 sm:text-sm" 
            asChild
          >
            <a href={`tel:${listing.phone_number.replace(/\s+/g, '')}`}>
              <Phone className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" /> Call
            </a>
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 flex-1 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white text-[10px] font-bold transition-all duration-300 active:scale-95 hover:shadow-lg sm:h-10 sm:text-sm" 
            asChild
          >
            <a 
              href={`https://wa.me/${listing.phone_number.replace(/\s+/g, '').replace(/^\+/, '')}?text=${encodeURIComponent(`Hi, I'm interested in your property: ${listing.title} on RentMilega.`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" /> Chat
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
