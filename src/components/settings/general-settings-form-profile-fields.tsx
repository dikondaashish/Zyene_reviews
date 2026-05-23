import { Mail, User } from "lucide-react";

import { Input } from "@/components/ui/input";

export function GeneralSettingsFormProfileFields({
    fullName,
    onFullNameChange,
    userEmail,
    isLoading,
}: {
    fullName: string;
    onFullNameChange: (value: string) => void;
    userEmail: string;
    isLoading: boolean;
}) {
    return (
        <>
            <div className="border-b px-6 py-4">
                <h4 className="text-sm font-semibold">Your Profile</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Update your personal information visible to your team.
                </p>
            </div>

            <div className="px-6 py-5 space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Full Name
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                        <Input
                            value={fullName}
                            onChange={(e) => onFullNameChange(e.target.value)}
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
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                        <Input value={userEmail} disabled readOnly className="pl-9 bg-muted/50" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Email cannot be changed. If you want to change it, contact customer support.
                    </p>
                </div>
            </div>
        </>
    );
}
