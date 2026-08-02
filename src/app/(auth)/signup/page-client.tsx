"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SignupForm } from "./signup-form";

interface SignupPageProps {
    googleClientId: string;
}

export default function SignupPage({ googleClientId }: SignupPageProps) {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-primary size-6" />
                </div>
            }
        >
            <SignupForm googleClientId={googleClientId} />
        </Suspense>
    );
}
