import { Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export function GeneralSettingsFormOrganizationSection({
    orgName,
    onOrgNameChange,
    isLoading,
    canEditOrganizationName,
}: {
    orgName: string;
    onOrgNameChange: (value: string) => void;
    isLoading: boolean;
    canEditOrganizationName: boolean;
}) {
    return (
        <section aria-labelledby="organization-section-heading" className="grid gap-6 border-t border-border p-5 sm:p-7 xl:grid-cols-[200px_minmax(0,1fr)] xl:gap-10">
            <div className="space-y-2">
                <h2 id="organization-section-heading" className="text-base font-semibold tracking-tight">Organization</h2>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                    The name your team sees in the dashboard and invitations.
                </p>
            </div>
            <div className="w-full max-w-xl space-y-2">
                <label htmlFor="settings-organization-name" className="text-sm font-medium">Organization name</label>
                <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                        id="settings-organization-name"
                        name="organization"
                        autoComplete="organization"
                        value={orgName}
                        onChange={(e) => onOrgNameChange(e.target.value)}
                        placeholder="Enter organization name"
                        className="h-11 bg-background pl-10 read-only:bg-muted/40 read-only:text-muted-foreground read-only:shadow-none"
                        disabled={isLoading}
                        readOnly={!canEditOrganizationName}
                        aria-describedby={!canEditOrganizationName ? "settings-organization-help" : undefined}
                    />
                </div>
                {!canEditOrganizationName && (
                    <p id="settings-organization-help" className="text-xs leading-relaxed text-muted-foreground">
                        Ask an organization owner to update this name.
                    </p>
                )}
            </div>
        </section>
    );
}
