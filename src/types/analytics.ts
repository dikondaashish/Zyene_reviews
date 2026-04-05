export interface OnboardingCompletionData {
    businessId?: string;
    organizationId?: string;
    completedSteps?: number;
    [key: string]: unknown;
}
