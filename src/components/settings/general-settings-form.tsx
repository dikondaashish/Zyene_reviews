"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AppUserSummary, OrganizationSettingsRecord } from "@/types/components";
import { GeneralSettingsFormOrganizationSection } from "@/components/settings/general-settings-form-organization-section";
import { GeneralSettingsFormProfileFields } from "@/components/settings/general-settings-form-profile-fields";
import { useGeneralSettingsForm } from "@/components/settings/use-general-settings-form";

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
        <form onSubmit={f.handleSave} aria-busy={f.isLoading} className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
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

            <div className="flex flex-col gap-4 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <p role="status" className="text-xs text-muted-foreground">
                    {f.isLoading ? "Saving your changes…" : f.hasChanges ? "You have unsaved changes." : "Changes are visible to your team."}
                </p>
                <div className="flex items-center justify-end gap-2">
                    {f.hasChanges && (
                        <Button type="button" variant="ghost" disabled={f.isLoading} className="h-10" onClick={() => {
                            f.setFullName(user.user_metadata?.full_name || "");
                            f.setOrgName(organization?.name || "");
                        }}>
                            Discard
                        </Button>
                    )}
                <Button
                    type="submit"
                    disabled={f.isLoading || !f.hasChanges}
                    className="h-10 min-w-32 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    {f.isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                    {f.isLoading ? "Saving…" : "Save changes"}
                </Button>
                </div>
            </div>
        </form>
    );
}
