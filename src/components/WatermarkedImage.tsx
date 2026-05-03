import React from "react";
import { cn } from "@/lib/utils";

interface WatermarkedImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
}

const WatermarkedImage = ({ src, alt, className, imageClassName }: WatermarkedImageProps) => {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className={cn("relative overflow-hidden group select-none", className)}
      onContextMenu={handleContextMenu}
    >
      <img
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover pointer-events-none", imageClassName)}
        loading="lazy"
        draggable="false"
        crossOrigin="anonymous"
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
