"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { GoogleLocationAccount } from "@/components/integrations/google-card-location-api";

export function GoogleIntegrationCardLocationDialog({
    open,
    onOpenChange,
    isLoadingLocations,
    accounts,
    selectedAccount,
    setSelectedAccount,
    selectedLocation,
    setSelectedLocation,
    onCancel,
    onSave,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    isLoadingLocations: boolean;
    accounts: GoogleLocationAccount[];
    selectedAccount: string;
    setSelectedAccount: (v: string) => void;
    selectedLocation: string;
    setSelectedLocation: (v: string) => void;
    onCancel: () => void;
    onSave: () => void | Promise<void>;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select Google Business Profile location</DialogTitle>
                    <DialogDescription>
                        Choose the GBP location that matches this Zyene business. This prevents mixing reviews between
                        businesses.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Account</div>
                        <Select
                            value={selectedAccount}
                            onValueChange={(v) => {
                                setSelectedAccount(v);
                                const acc = accounts.find((a) => a.resourceName === v);
                                const firstLoc = acc?.locations?.[0]?.name;
                                if (firstLoc) setSelectedLocation(firstLoc);
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((a) => (
                                    <SelectItem key={a.resourceName} value={a.resourceName}>
                                        {a.accountName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-medium">Location</div>
                        <Select
                            value={selectedLocation}
                            onValueChange={setSelectedLocation}
                            disabled={!selectedAccount || isLoadingLocations}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={isLoadingLocations ? "Loading…" : "Select location"} />
                            </SelectTrigger>
                            <SelectContent>
                                {(accounts.find((a) => a.resourceName === selectedAccount)?.locations || []).map(
                                    (l) => (
                                        <SelectItem key={l.name} value={l.name}>
                                            {l.title}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={onSave} disabled={!selectedAccount || !selectedLocation}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
