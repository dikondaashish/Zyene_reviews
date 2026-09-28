import type { GoogleConnectionStatus } from "@/lib/google/is-google-connected";

export interface BusinessDirectoryEntry {
    id: string;
    name: string;
    category: string;
    address: string;
    logoUrl: string | null;
    status: string | null;
    googleStatus: GoogleConnectionStatus;
    rating: number | null;
    reviewCount: number;
    pendingReviews: number;
}

export type BusinessDestination = "/dashboard" | "/reviews" | "/settings/integrations" | "/settings/business-information";
