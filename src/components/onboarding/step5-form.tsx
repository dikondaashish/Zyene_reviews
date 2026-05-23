"use client";

import { Step5FormCelebration } from "./step5-form-celebration";
import { Step5FormCta } from "./step5-form-cta";
import { useStep5Form } from "./use-step5-form";

interface Step5FormProps {
    businessId: string;
    businessName: string;
    userEmail: string;
    userName: string;
    googleConnected: boolean;
    onNext: () => void;
    isLoading?: boolean;
}

export function Step5Form({
    businessId,
    businessName,
    userName,
    googleConnected,
    onNext,
    isLoading = false,
}: Step5FormProps) {
    const { mounted, isCompleting, handleGoToDashboard } = useStep5Form(businessId, onNext);
    const firstName = userName.split(" ")[0];

    if (!mounted) return null;

    return (
        <div className="text-center space-y-6 py-2">
            <Step5FormCelebration firstName={firstName} businessName={businessName} googleConnected={googleConnected} />
            <Step5FormCta isLoading={isLoading} isCompleting={isCompleting} onGoToDashboard={handleGoToDashboard} />
        </div>
    );
}
