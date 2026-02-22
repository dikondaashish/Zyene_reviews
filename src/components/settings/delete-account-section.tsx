"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

export function DeleteAccountSection() {
    const handleDeleteAccount = () => {
        if (!confirm("Are you sure? This action cannot be undone.")) return;
        toast.error("Account deletion is not yet available, please contact support.");
    };

    return (
        <div className="rounded-lg border border-destructive/30 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-destructive/20 px-6 py-4 bg-destructive/5">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <h4 className="text-sm font-semibold text-destructive">Danger Zone</h4>
                </div>
            </div>
            <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                </div>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                    className="shrink-0"
                >
                    Delete Account
                </Button>
            </div>
        </div>
    );
}
