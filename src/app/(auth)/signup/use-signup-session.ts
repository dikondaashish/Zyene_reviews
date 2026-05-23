"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/db/supabase/client";
import { toast } from "sonner";

export function useSignupSession(inviteToken: string | null) {
    const [checkingExistingSession, setCheckingExistingSession] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function handleExistingSession() {
            const supabase = createClient();
            const { data } = await supabase.auth.getUser();
            const user = data.user;

            if (!user) {
                if (!cancelled) setCheckingExistingSession(false);
                return;
            }

            if (inviteToken) {
                try {
                    const acceptRes = await fetch("/api/team/accept-invite", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token: inviteToken }),
                    });
                    if (!acceptRes.ok) {
                        const payload = (await acceptRes.json().catch(() => ({}))) as {
                            error?: string;
                        };
                        toast.error("Invite acceptance failed", {
                            description: payload?.error || "Please ask for a new invite.",
                        });
                    }
                } catch {
                    toast.error("Invite acceptance failed");
                }
            }

            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
            const protocol = rootDomain.includes("localhost") ? "http" : "https";
            window.location.href = `${protocol}://app.${rootDomain}/dashboard`;
        }

        void handleExistingSession();
        return () => {
            cancelled = true;
        };
    }, [inviteToken]);

    return { checkingExistingSession };
}
