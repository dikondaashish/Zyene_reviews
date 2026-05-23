export interface Step4SubscriptionFormProps {
    organizationId: string;
    /** Passed from onboarding page when Google is linked; reserved for future UX hints */
    isGoogleConnected?: boolean;
    isCancelled?: boolean;
    onNext: () => void;
    isLoading?: boolean;
}
