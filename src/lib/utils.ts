import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Optimizes a Supabase Storage image URL with transformations
 * @param url - Original image URL from Supabase Storage
 * @param width - Desired width (default: 800)
 * @param height - Desired height (optional)
 * @param quality - Image quality (default: 80)
 * @param format - Image format (default: webp)
 * @returns Optimized image URL
 */
export function optimizeImage(
  url: string,
  width: number = 800,
  height?: number,
  quality: number = 80,
  format: 'webp' | 'jpg' | 'png' = 'webp'
): string {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    
    // Only apply transformations to Supabase Storage URLs
    if (!urlObj.hostname.includes('supabase')) {
      return url;
    }

    const params = new URLSearchParams(urlObj.search);
    
    params.set('width', width.toString());
    if (height) {
      params.set('height', height.toString());
    }
    params.set('quality', quality.toString());
    params.set('format', format);
    
    urlObj.search = params.toString();
    return urlObj.toString();
  } catch (e) {
    return url;
  }
}
