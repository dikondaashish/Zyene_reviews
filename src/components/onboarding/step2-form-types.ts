export interface Step2FormProps {
    onNext: () => Promise<void>;
    onSkip: () => Promise<void>;
    isLoading: boolean;
    businessId: string;
    businessName: string;
    city: string;
    address?: string;
    state?: string;
    phone?: string;
    /** OAuth code passed from page.tsx after Google redirects back */
    pendingGoogleCode?: string | null;
    /** Called after the pending code has been consumed so the parent can clear it */
    onGoogleCodeConsumed?: () => void;
    /** Called when Google returns business info so the parent state stays in sync */
    onBusinessUpdate?: (info: {
        name?: string;
        address_line1?: string;
        city?: string;
        state?: string;
        category?: string | null;
    }) => void;
    /** Initial connection status if already connected */
    initialConnected?: boolean;
}

export interface GoogleConnectionState {
    status: "idle" | "connecting" | "success" | "error";
    reviewCount?: number;
    averageRating?: number;
    errorMessage?: string;
}
