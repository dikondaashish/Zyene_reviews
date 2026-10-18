"use client";

import { Suspense } from "react";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { LoginForm } from "./login-form";

interface LoginPageProps {
    googleClientId: string;
}

export default function LoginPage({ googleClientId }: LoginPageProps) {
    return (
        <Suspense fallback={<AuthFormSkeleton fields={2} />}>
            <LoginForm googleClientId={googleClientId} />
        </Suspense>
    );
}
