import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Phone, MapPin, MessageCircle, Share2, Crown, Calendar, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import WatermarkedImage from "./WatermarkedImage";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

const ListingCard = ({ listing }: { listing: Listing }) => {
  const images = [
    listing.image1, listing.image2, listing.image3, listing.image4, listing.image5,
    listing.image6, listing.image7, listing.image8, listing.image9, listing.image10
  ].filter(Boolean) as string[];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // const { isAdmin } = useAuth(); // Hidden on card as requested

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const currencySymbol = "₹";
  const locale = "en-IN";

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `https://rentmilega.in/listing/${listing.id}`;
    const shareData: any = {
      title: `${listing.title} | RentMilega`,
      text: `Check out this rental property in ${listing.area}, ${listing.city}: ${listing.title}. Rent: ${currencySymbol}${Number(listing.rent).toLocaleString()}/mo.`,
      url: url,
    };

    try {
      if (listing.image1 && navigator.canShare && (navigator as any).canShare({ files: [new File([], "test.jpg", { type: "image/jpeg" })] })) {
        try {
          const response = await fetch(listing.image1, { mode: 'cors', cache: 'no-cache' });
          const blob = await response.blob();
          const file = new File([blob], `${listing.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`, { type: "image/jpeg" });
          if ((navigator as any).canShare({ files: [file] })) {
            await navigator.share({
              ...shareData,
              files: [file]
            });
            return;
          }
        } catch (fileErr) {
          console.error("Error preparing image for share:", fileErr);
        }
      }

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Error sharing:", err);
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    }
  };

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] flex flex-col h-auto">
      <Link 
        to={`/listing/${listing.id}`} 
        aria-label={`View details for ${listing.title}`}
        className="w-full shrink-0 overflow-hidden relative"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
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

          {listing.is_premium && (
            <div className="absolute top-2 left-2 z-30 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white shadow-lg sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
              <Crown className="h-2 w-2 sm:h-3 sm:w-3" />
              Featured
            </div>
          )}

          {/* New Badge (within 7 days) */}
          {new Date(listing.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
            <div className={`absolute top-2 z-30 flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white shadow-lg sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px] ${listing.is_premium ? 'left-20 sm:left-24' : 'left-2 sm:left-3'}`}>
              New
            </div>
          )}
          
          {/* Overlay Gradient (Hidden on mobile for clarity) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-20 pointer-events-none hidden sm:block" />
          
          {/* Rent Badge (Visible only on desktop as it's redundant on mobile right) */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md opacity-0 transition-all duration-500 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 z-30 pointer-events-none hidden sm:flex">
            <span className="text-[10px] leading-none">{currencySymbol}</span>
            {Number(listing.rent).toLocaleString(locale)}
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
      
      <div className="flex-1 p-4 transition-colors duration-300 group-hover:bg-accent/5 flex flex-col justify-between overflow-hidden">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xl font-black text-primary sm:text-2xl">
              <span className="text-sm sm:text-base font-bold">{currencySymbol}</span>
              {Number(listing.rent).toLocaleString(locale)}
              <span className="text-xs font-normal text-muted-foreground ml-1">/mo</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={handleShare}
                title="Share Listing"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                {listing.property_type}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                (listing as any).user_type === 'agent' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {(listing as any).user_type === 'agent' ? 'Agent / Broker' : 'Property Owner'}
              </span>
            </div>
          </div>
          
          <Link to={`/listing/${listing.id}`}>
            <h3 className="mt-2 text-base font-bold text-foreground line-clamp-1 transition-colors duration-200 hover:text-primary sm:text-lg">
              {listing.title}
            </h3>
          </Link>
          
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{listing.area}, {listing.city}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/80 sm:text-xs">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>Posted {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button 
            size="sm" 
            className="h-10 flex-1 text-xs font-bold transition-all duration-300 active:scale-95 hover:shadow-lg sm:text-sm" 
            asChild
          >
            <a href={`tel:${listing.phone_number.replace(/\s+/g, '')}`}>
              <Phone className="mr-1.5 h-3.5 w-3.5" /> Call
            </a>
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="h-10 flex-1 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white text-xs font-bold transition-all duration-300 active:scale-95 hover:shadow-lg sm:text-sm" 
            asChild
          >
            <a 
              href={`https://wa.me/${listing.phone_number.replace(/\s+/g, '').replace(/^\+/, '')}?text=${encodeURIComponent(`Hi, I'm interested in your property: ${listing.title} on RentMilega.`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> Chat
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
