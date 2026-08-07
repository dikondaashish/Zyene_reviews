"use client";

import React from "react";
import { createClient } from "@/lib/db/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { GOOGLE_CONNECT_SCOPES } from "@/services/google/oauth-scopes";

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
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                toast.error("You must be logged in to add a business");
                return;
            }

            const { data: memberData } = await supabase
                .from("organization_members")
                .select("organization_id")
                .eq("user_id", user.id)
                .single();

            if (!memberData?.organization_id) {
                toast.error("No organization found");
                return;
            }

            const orgId = memberData.organization_id;
            const userId = user.id;

            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
            const redirectTo = rootDomain.includes("localhost")
                ? `http://${rootDomain}/api/auth/callback?next=/businesses&add_org=${orgId}&add_user=${userId}`
                : `https://auth.${rootDomain}/api/auth/callback?next=/businesses&add_org=${orgId}&add_user=${userId}`;

            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    scopes: GOOGLE_CONNECT_SCOPES,
                    redirectTo,
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
