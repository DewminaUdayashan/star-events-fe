import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to build full image URLs
export function getImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) {
    return "/placeholder.svg";
  }

  // If it's already a full URL, return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Build full URL with base URL
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";
  const url = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  console.log("Full Image URL:", url);
  return url;
}
