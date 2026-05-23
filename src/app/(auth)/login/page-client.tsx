"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
