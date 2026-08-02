"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LoginForm } from "./login-form";

interface LoginPageProps {
    googleClientId: string;
}

export default function LoginPage({ googleClientId }: LoginPageProps) {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-primary size-6" />
                </div>
            }
        >
            <LoginForm googleClientId={googleClientId} />
        </Suspense>
    );
}
