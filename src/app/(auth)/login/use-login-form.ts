"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/db/supabase/client";

export function useLoginForm() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const inviteToken = searchParams.get("invite");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (error === "account_not_created") {
            toast.error("Account Not Created", {
                description: "You must connect a Google Business Profile to create an account.",
            });
        }
    }, [error]);

    async function handleGoogleLogin() {
        setIsLoading(true);
        const callbackUrl = new URL("/api/auth/callback", window.location.origin);
        if (inviteToken) callbackUrl.searchParams.set("invite", inviteToken);
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: callbackUrl.toString(),
                queryParams: {
                    access_type: "offline",
                    prompt: "consent",
                },
                scopes: "https://www.googleapis.com/auth/business.manage",
            },
        });

        if (oauthError) {
            toast.error("Error", {
                description: oauthError.message,
            });
            setIsLoading(false);
        }
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            setIsLoading(false);
            toast.error("Error", {
                description: signInError.message,
            });
            return;
        }

        if (inviteToken) {
            const acceptRes = await fetch("/api/team/accept-invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: inviteToken }),
            });
            if (!acceptRes.ok) {
                const payload = (await acceptRes.json().catch(() => ({}))) as { error?: string };
                toast.error("Invite acceptance failed", {
                    description: payload?.error || "Please ask for a new invite.",
                });
            }
        }

        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
        const protocol = rootDomain.includes("localhost") ? "http" : "https";
        window.location.href = `${protocol}://app.${rootDomain}`;
    }

    return {
        isLoading,
        showPassword,
        setShowPassword,
        handleGoogleLogin,
        onSubmit,
    };
}
