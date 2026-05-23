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
        <>
            <div className="border-y px-6 py-4">
                <h4 className="text-sm font-semibold">Organization</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                    The name shown across your dashboard and team invitations.
                </p>
            </div>

            <div className="px-6 py-5 space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Organization Name
                </label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={orgName}
                        onChange={(e) => onOrgNameChange(e.target.value)}
                        placeholder="Enter organization name"
                        className="pl-9"
                        disabled={isLoading || !canEditOrganizationName}
                        readOnly={!canEditOrganizationName}
                    />
                </div>
                {!canEditOrganizationName ? (
                    <p className="text-xs text-muted-foreground">
                        Only the organization owner can change this name. Ask your owner to update it if needed.
                    </p>
                ) : null}
            </div>
        </>
    );
}
