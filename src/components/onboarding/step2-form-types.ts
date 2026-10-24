import type { GoogleOAuthAuthorization } from "@/types/components";
import type { OnboardingBusiness } from "@/app/onboarding/onboarding-types";

export interface Step2FormProps {
    /** `viaGoogle` is true only after a real Google Business Profile connection, never for typed-in details. */
    onNext: (viaGoogle: boolean) => Promise<void>;
    onSkip: () => Promise<void>;
    isLoading: boolean;
    businessId: string;
    businessName: string;
    city: string;
    address?: string;
    state?: string;
    country?: string;
    phone?: string;
    /** OAuth code passed from page.tsx after Google redirects back */
    pendingGoogleCode?: GoogleOAuthAuthorization | null;
    /** Called after the pending code has been consumed so the parent can clear it */
    onGoogleCodeConsumed?: () => void;
    /** OAuth cancellation or failure returned by Google before a connection is created. */
    googleConnectionError?: string | null;
    /** Clears a returned OAuth error when the user chooses to retry. */
    onGoogleConnectionErrorConsumed?: () => void;
    /** Called when Google returns business info so the parent state stays in sync */
    onBusinessUpdate?: (info: Partial<OnboardingBusiness>) => void;
    /** Initial connection status if already connected */
    initialConnected?: boolean;
}

export interface GoogleConnectionState {
    status: "idle" | "connecting" | "success" | "error";
    reviewCount?: number;
    averageRating?: number;
    errorMessage?: string;
}
