import React, { useState } from "react";
import { cn, optimizeImage } from "@/lib/utils";

interface WatermarkedImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
}

const WatermarkedImage = ({ 
  src, 
  alt, 
  className, 
  imageClassName,
  width = 800,
  height,
  quality = 80,
  format = 'webp'
}: WatermarkedImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>(optimizeImage(src, width, height, quality, format));
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleImageError = () => {
    // Fall back to original image if optimized version fails
    if (imageSrc !== src) {
      console.log("Falling back to original image:", src);
      setImageSrc(src);
    } else if (src !== '/placeholder.svg') {
      setImageSrc('/placeholder.svg');
    }
  };

  return (
    <div 
      className={cn("relative overflow-hidden group select-none", className)}
      onContextMenu={handleContextMenu}
    >
      <img
        src={imageSrc}
        alt={alt}
        className={cn("h-full w-full object-cover pointer-events-none", imageClassName)}
        loading="lazy"
        draggable="false"
        decoding="async"
        onError={handleImageError}
      />
      
      {/* Watermark Overlays */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-20 rotate-[-30deg]">
        <div className="grid grid-cols-3 gap-20 whitespace-nowrap">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="text-sm font-bold tracking-widest uppercase text-white/50">
              RentMilega
            </span>
          ))}
        </div>
      </div>

      {/* Main Center Watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 z-20">
        <span className="text-xl font-black tracking-[0.2em] uppercase text-white/40 border-2 border-white/20 px-4 py-2 rounded-lg rotate-[-15deg] scale-150 sm:text-2xl">
          RentMilega
        </span>
      </div>

      {/* Protective Transparent Overlay to block direct image interactions */}
      <div className="absolute inset-0 bg-transparent z-10" />
    </div>
  );
};

export default WatermarkedImage;
