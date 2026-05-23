import { Building2, MapPin, LayoutGrid, PartyPopper, Gem } from "lucide-react";

export interface OnboardingOrganization {
    id: string;
    name: string;
}

export interface OnboardingBusiness {
    id: string;
    name: string;
    city: string | null;
    category: string | null;
    address_line1?: string | null;
    state?: string | null;
    phone?: string | null;
}

export interface OnboardingUser {
    id: string;
    email?: string | null;
    user_metadata?: {
        full_name?: string;
    };
}

export const ONBOARDING_STEPS = [
    { label: "Organization", icon: Building2 },
    { label: "Business", icon: MapPin },
    { label: "Category", icon: LayoutGrid },
    { label: "Plan", icon: Gem },
    { label: "All Set", icon: PartyPopper },
] as const;
