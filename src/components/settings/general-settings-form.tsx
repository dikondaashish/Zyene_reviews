"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AppUserSummary, OrganizationSettingsRecord } from "@/types/components";
import { GeneralSettingsFormOrganizationSection } from "./general-settings-form-organization-section";
import { GeneralSettingsFormProfileFields } from "./general-settings-form-profile-fields";
import { useGeneralSettingsForm } from "./use-general-settings-form";

interface GeneralSettingsFormProps {
    user: AppUserSummary;
    organization: OrganizationSettingsRecord | null;
    canEditOrganizationName?: boolean;
}

export function GeneralSettingsForm({
    user,
    organization,
    canEditOrganizationName = false,
}: GeneralSettingsFormProps) {
    const f = useGeneralSettingsForm(user, organization, canEditOrganizationName);

    return (
        <form onSubmit={f.handleSave} className="rounded-lg border border-border bg-card flex flex-col">
            <GeneralSettingsFormProfileFields
                fullName={f.fullName}
                onFullNameChange={f.setFullName}
                userEmail={f.userEmail}
                isLoading={f.isLoading}
            />

            {organization && (
                <GeneralSettingsFormOrganizationSection
                    orgName={f.orgName}
                    onOrgNameChange={f.setOrgName}
                    isLoading={f.isLoading}
                    canEditOrganizationName={f.canEditOrganizationName}
                />
            )}

            <div className="flex flex-col gap-2 px-4 pb-6 pt-2 max-lg:items-stretch sm:px-6 lg:flex-row lg:justify-end">
                <Button
                    type="submit"
                    disabled={f.isLoading || !f.hasChanges}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    {f.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
