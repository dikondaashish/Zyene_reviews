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
import { Switch } from "@/components/ui/switch";
import { PRIVACY_CATEGORY_COPY, jurisdictionNotice } from "@/components/privacy/privacy-copy";
import type { ConsentPreferences, Jurisdiction, OptionalCategory } from "@/lib/privacy/types";

/**
 * Radix Dialog gives focus trapping, Escape to close and focus restoration to
 * the control that opened it. Closing without saving keeps the previous state.
 */
export function PrivacySettingsDialog({
    open,
    onOpenChange,
    onCloseAutoFocus,
    draft,
    onDraftChange,
    jurisdiction,
    gpc,
    onReject,
    onAccept,
    onSave,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCloseAutoFocus: (event: Event) => void;
    draft: ConsentPreferences;
    onDraftChange: (next: ConsentPreferences) => void;
    jurisdiction: Jurisdiction;
    gpc: boolean;
    onReject: () => void;
    onAccept: () => void;
    onSave: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl" onCloseAutoFocus={onCloseAutoFocus}>
                <DialogHeader>
                    <DialogTitle>Privacy choices</DialogTitle>
                    <DialogDescription>{jurisdictionNotice(jurisdiction)}</DialogDescription>
                </DialogHeader>

                <ul className="space-y-3">
                    <li className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                        <div>
                            <p id="privacy-essential" className="font-medium text-foreground">Essential</p>
                            <p className="text-xs text-muted-foreground">{PRIVACY_CATEGORY_COPY.essential}</p>
                        </div>
                        <Switch checked disabled aria-labelledby="privacy-essential" aria-describedby="privacy-essential-state" />
                        <span id="privacy-essential-state" className="sr-only">Always on</span>
                    </li>
                    {(["functional", "analytics", "marketing"] as OptionalCategory[]).map((key) => {
                        const blockedByGpc = key === "marketing" && gpc;
                        return (
                            <li key={key} className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                                <div>
                                    <p id={`privacy-${key}`} className="font-medium capitalize text-foreground">{key}</p>
                                    <p id={`privacy-${key}-desc`} className="text-xs text-muted-foreground">
                                        {PRIVACY_CATEGORY_COPY[key]}
                                        {blockedByGpc && " Off because your browser sends a Global Privacy Control signal."}
                                    </p>
                                </div>
                                <Switch
                                    checked={draft[key] && !blockedByGpc}
                                    disabled={blockedByGpc}
                                    aria-labelledby={`privacy-${key}`}
                                    aria-describedby={`privacy-${key}-desc`}
                                    onCheckedChange={(checked) => onDraftChange({ ...draft, [key]: checked })}
                                />
                            </li>
                        );
                    })}
                </ul>

                <DialogFooter className="gap-2 sm:justify-between">
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                        <Button variant="outline" onClick={onReject}>Reject non-essential</Button>
                        <Button variant="outline" onClick={onAccept}>Accept all</Button>
                    </div>
                    <Button onClick={onSave}>Save my choices</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
