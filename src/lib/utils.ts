import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SUPABASE_URL } from "@/integrations/supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Optimizes a Supabase Storage image URL with transformations
 * Falls back to original URL if optimization fails or not a Supabase URL
 * @param url - Original image URL from Supabase Storage
 * @param width - Desired width (default: 800)
 * @param height - Desired height (optional)
 * @param quality - Image quality (default: 80)
 * @param format - Image format (default: webp)
 * @returns Optimized image URL or original URL
 */
export function optimizeImage(
  url: string,
  width: number = 800,
  height?: number,
  quality: number = 80,
  format: 'webp' | 'jpg' | 'png' = 'webp'
): string {
  if (!url) return '/placeholder.svg';
  
  try {
    const urlObj = new URL(url);
    
    // Only apply transformations to OUR Supabase Storage URLs
    const isOurSupabaseUrl = urlObj.hostname === new URL(SUPABASE_URL).hostname;
    if (!isOurSupabaseUrl) {
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
    console.error("Error optimizing image:", e);
    return url;
  }
}

/**
 * Generates a URL-friendly slug from a string
 * @param text - Input text to convert to a slug
 * @returns URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}
