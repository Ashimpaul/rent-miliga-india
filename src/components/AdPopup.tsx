import React, { useState, useEffect } from "react";
import { X, ExternalLink, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdPopupProps {
  type: "video" | "image";
  src: string;
  link?: string;
  delay?: number; // delay in ms before showing
  autoClose?: number; // time in ms before auto closing
}

const AdPopup = ({ type, src, link, delay = 2000, autoClose }: AdPopupProps) => {
  const [isVisible, setIsAdminVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAdminVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsAdminVisible(false);
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible]);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsAdminVisible(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-6 animate-in fade-in duration-500">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-card border border-border/50 shadow-2xl animate-in zoom-in-95 duration-500">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-50 rounded-full bg-white/10 p-1.5 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
          aria-label="Close advertisement"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Ad Content */}
        <div className="relative aspect-[4/3] w-full bg-muted">
          {type === "video" ? (
            <div className="relative h-full w-full">
              <video
                src={src}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-3 left-3 z-20 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-md transition-all hover:bg-black/50"
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          ) : (
            <img src={src} alt="Advertisement" className="h-full w-full object-cover" />
          )}
          
          {/* Ad Badge */}
          <div className="absolute left-3 top-3 z-20 rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white/90 bg-black/40 backdrop-blur-md border border-white/10">
            Ad
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-card px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-bold tracking-tight text-foreground">Featured Partner</h3>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">Exclusive offer for our community.</p>
            </div>
            {link && (
              <Button asChild size="sm" className="h-8 rounded-lg px-4 text-xs font-bold shadow-md transition-all hover:translate-y-[-1px] active:translate-y-0">
                <a href={link} target="_blank" rel="noopener noreferrer">
                  Visit Site <ExternalLink className="ml-1.5 h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdPopup;
