"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, User, Mail, Building2 } from "lucide-react";

interface GeneralSettingsFormProps {
    user: any;
    organization: any;
}

export function GeneralSettingsForm({ user, organization }: GeneralSettingsFormProps) {
    const router = useRouter();
    const supabase = createClient();

    const [fullName, setFullName] = useState(user.user_metadata?.full_name || "");
    const [orgName, setOrgName] = useState(organization?.name || "");
    const [isLoading, setIsLoading] = useState(false);

    const hasChanges = fullName !== (user.user_metadata?.full_name || "") ||
        (organization && orgName !== organization.name);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!hasChanges) return;

        setIsLoading(true);
        try {
            // Update Profile if changed
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

            // Update Organization if changed
            if (organization && orgName !== organization.name) {
                const trimmed = orgName.trim();
                if (!trimmed) {
                    throw new Error("Organization name cannot be empty");
                }
                const { error } = await supabase
                    .from("organizations")
                    .update({ name: trimmed })
                    .eq("id", organization.id);

                if (error) throw error;
            }

            toast.success("Settings updated successfully");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to update settings");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="rounded-lg border bg-white shadow-sm flex flex-col">
            {/* Profile Header */}
            <div className="border-b px-6 py-4">
                <h4 className="text-sm font-semibold">Your Profile</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Update your personal information visible to your team.
                </p>
            </div>

            {/* Profile Fields */}
            <div className="px-6 py-5 space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Full Name
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className="pl-9"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={user.email}
                            disabled
                            readOnly
                            className="pl-9 bg-muted/50"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Email cannot be changed.
                    </p>
                </div>
            </div>

            {/* Organization Section */}
            {organization && (
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
                                onChange={(e) => setOrgName(e.target.value)}
                                placeholder="Enter organization name"
                                className="pl-9"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Submit Button Area */}
            <div className="px-6 pb-6 pt-2 flex justify-end">
                <Button
                    type="submit"
                    disabled={isLoading || !hasChanges}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white"
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
