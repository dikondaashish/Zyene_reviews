"use client";

import { Suspense } from "react";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { SignupForm } from "./signup-form";

interface SignupPageProps {
    googleClientId: string;
}

export default function SignupPage({ googleClientId }: SignupPageProps) {
    return (
        <Suspense fallback={<AuthFormSkeleton fields={3} />}>
            <SignupForm googleClientId={googleClientId} />
        </Suspense>
    );
}
