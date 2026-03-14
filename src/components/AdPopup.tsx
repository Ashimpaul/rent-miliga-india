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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[1px] p-6 animate-in fade-in duration-500">
      <div className="relative w-full max-w-[450px] overflow-hidden rounded-xl bg-card border border-border/50 shadow-2xl animate-in zoom-in-95 duration-500">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-2 top-2 z-50 rounded-full bg-black/20 p-1 text-white backdrop-blur-md transition-all hover:bg-black/40 active:scale-95"
          aria-label="Close advertisement"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Ad Content */}
        <div className="relative aspect-video w-full bg-muted">
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
                className="absolute bottom-2 left-2 z-20 rounded-full bg-black/30 p-1 text-white backdrop-blur-md transition-all hover:bg-black/50"
              >
                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              </button>
            </div>
          ) : (
            <img src={src} alt="Advertisement" className="h-full w-full object-cover" />
          )}
          
          {/* Ad Badge */}
          <div className="absolute left-2 top-2 z-20 rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-white/90 bg-black/40 backdrop-blur-md border border-white/10">
            Ad
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-card px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-left">
              <h3 className="text-xs font-bold tracking-tight text-foreground line-clamp-1">Featured Partner</h3>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">Exclusive community offer.</p>
            </div>
            {link && (
              <Button asChild size="sm" className="h-8 rounded-lg px-4 text-[10px] font-bold shadow-md transition-all hover:translate-y-[-1px] active:translate-y-0">
                <a href={link} target="_blank" rel="noopener noreferrer">
                  Visit Site <ExternalLink className="ml-1.5 h-2.5 w-2.5" />
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
