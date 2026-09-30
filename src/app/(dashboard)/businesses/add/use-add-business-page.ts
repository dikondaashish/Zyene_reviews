"use client";

import React from "react";
import { createClient } from "@/lib/db/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { GOOGLE_CONNECT_SCOPES } from "@/services/google/oauth-scopes";
import { prepareAddBusinessGoogleOAuth } from "./actions";

export function useAddBusinessPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [atLimit, setAtLimit] = React.useState(false);

    React.useEffect(() => {
        async function checkLimit() {
            const { businesses, organization } = await getActiveBusinessId();
            if (organization) {
                const max = organization.max_businesses || 1;
                if (businesses.length >= max) {
                    setAtLimit(true);
                }
            }
            setLoading(false);
        }
        checkLimit();
    }, [router]);

    const handleConnectGoogle = async () => {
        try {
            const prepared = await prepareAddBusinessGoogleOAuth();
            if (!prepared.redirectTo) {
                toast.error(prepared.error || "Failed to start Google connection");
                return;
            }

            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    scopes: GOOGLE_CONNECT_SCOPES,
                    redirectTo: prepared.redirectTo,
                    queryParams: {
                        access_type: "offline",
                        prompt: "consent",
                    },
                },
            });
            if (error) throw error;
        } catch (error: unknown) {
            toast.error("Failed to initiate Google connection", {
                description: error instanceof Error ? error.message : undefined,
            });
        }
    };

    return { loading, atLimit, handleConnectGoogle };
}
