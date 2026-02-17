import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "") // Remove non-alphanumeric chars except hyphen
    .replace(/-+/g, "-") // Collapse detailed hyphens
    .replace(/^-|-$/g, ""); // Trim hyphens
}
