"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/db/supabase/client";
import type { AppUserSummary, OrganizationSettingsRecord } from "@/types/components";

export function useGeneralSettingsForm(
    user: AppUserSummary,
    organization: OrganizationSettingsRecord | null,
    canEditOrganizationName: boolean,
) {
    const router = useRouter();
    const supabase = createClient();

    const [fullName, setFullName] = useState(user.user_metadata?.full_name || "");
    const [orgName, setOrgName] = useState(organization?.name || "");
    const [isLoading, setIsLoading] = useState(false);

    const orgNameChanged =
        Boolean(organization && canEditOrganizationName && orgName !== organization.name);
    const hasChanges =
        fullName !== (user.user_metadata?.full_name || "") || orgNameChanged;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!hasChanges) return;

        setIsLoading(true);
        try {
            if (fullName !== (user.user_metadata?.full_name || "")) {
                const response = await fetch("/api/users/me", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ full_name: fullName }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Failed to update profile");
                }
            }

            if (organization && orgName !== organization.name) {
                const trimmed = orgName.trim();
                if (!trimmed) {
                    throw new Error("Organization name cannot be empty");
                }
                const { data, error } = await supabase
                    .from("organizations")
                    .update({ name: trimmed })
                    .select("id")
                    .eq("id", organization.id);

                if (error) throw error;
                if (!data || data.length === 0) {
                    throw new Error("Organization update was not applied. Please check your permissions.");
                }
            }

            toast.success("Settings updated successfully");
            router.refresh();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to update settings");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        fullName,
        setFullName,
        orgName,
        setOrgName,
        isLoading,
        hasChanges,
        handleSave,
        userEmail: user.email ?? "",
        canEditOrganizationName,
    };
}
