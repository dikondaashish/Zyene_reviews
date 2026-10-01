import { LockKeyhole, Mail } from "lucide-react";
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
        <section aria-labelledby="profile-section-heading" className="grid gap-6 p-5 sm:p-7 xl:grid-cols-[200px_minmax(0,1fr)] xl:gap-10">
            <div className="space-y-2">
                <h2 id="profile-section-heading" className="text-base font-semibold tracking-tight">Your profile</h2>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                    How your name appears to the people you work with.
                </p>
            </div>
            <div className="w-full max-w-xl space-y-6">
                <div className="space-y-2">
                    <label htmlFor="settings-full-name" className="text-sm font-medium">Full name</label>
                    <Input
                        id="settings-full-name"
                        name="fullName"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => onFullNameChange(e.target.value)}
                        placeholder="Enter your full name"
                        className="h-11 bg-background"
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                        <label htmlFor="settings-email" className="text-sm font-medium">Email address</label>
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <LockKeyhole className="size-3" aria-hidden="true" /> Read only
                        </span>
                    </div>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                        <Input
                            id="settings-email"
                            type="email"
                            value={userEmail}
                            readOnly
                            aria-describedby="settings-email-help"
                            className="h-11 bg-muted/40 pl-10 text-muted-foreground shadow-none"
                        />
                    </div>
                    <p id="settings-email-help" className="text-xs leading-relaxed text-muted-foreground">
                        Need to change your email?{" "}
                        <a href="mailto:support@zyenereviews.com" className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
                            Contact support
                        </a>.
                    </p>
                </div>
            </div>
        </section>
    );
}
