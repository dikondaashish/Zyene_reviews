"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/db/supabase/client";
import { getAppSiteOrigin } from "@/lib/routing/platform-routes";
import { safeNextPath } from "@/lib/routing/safe-next-path";

export function useLoginForm() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const inviteToken = searchParams.get("invite");
    const nextPath = safeNextPath(searchParams.get("next"));
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

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(event.currentTarget);
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                toast.error("Error", { description: signInError.message });
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
            window.location.href = `${getAppSiteOrigin(rootDomain, process.env.NEXT_PUBLIC_APP_URL)}${nextPath}`;
        } catch {
            toast.error("Sign-in failed", { description: "Please try again." });
        } finally {
            setIsLoading(false);
        }
    }

    return {
        isLoading,
        showPassword,
        setShowPassword,
        inviteToken,
        nextPath,
        onSubmit,
    };
}
