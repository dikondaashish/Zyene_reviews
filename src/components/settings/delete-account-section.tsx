"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DeleteAccountSection() {
    const handleDeleteAccount = () => {
        if (!confirm("Are you sure? This action cannot be undone.")) return;
        toast.error("Account deletion is not yet available, please contact support.");
    };

    return (
        <div className="space-y-4 pt-6">
            <h4 className="text-sm font-medium text-destructive uppercase tracking-wider">Danger Zone</h4>
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <p className="font-medium text-destructive">Delete Account</p>
                    <p className="text-sm text-destructive/80">
                        Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                </div>
                <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="shrink-0"
                >
                    Delete Account
                </Button>
            </div>
        </div>
    );
}
