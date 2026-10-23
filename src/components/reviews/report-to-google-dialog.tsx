"use client";

import { ExternalLink, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

/** Google's own reporting flow. There is no API for flagging reviews, so the owner reports there. */
export const GOOGLE_REVIEWS_MANAGEMENT_TOOL_URL = "https://support.google.com/business/workflow/9945796";
export const GOOGLE_REPORT_REVIEWS_HELP_URL = "https://support.google.com/business/answer/4596773";

const REMOVABLE = [
    "Spam or fake: the person was never a customer, or it is one of many copies",
    "Off-topic: about something other than your business",
    "Conflict of interest: written by a competitor or a current or former employee",
    "Offensive, hateful or sexually explicit language",
    "Personal information, like someone's phone number or home address",
];

/** Explains what Google removes before handing the owner off to Google's reporting tool. */
export function ReportToGoogleDialog({
    open, onOpenChange, authorName,
}: {
    open: boolean; onOpenChange: (open: boolean) => void; authorName: string;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Flag className="size-4" aria-hidden />Report {authorName || "this"}&rsquo;s review to Google</DialogTitle>
                    <DialogDescription>
                        Google only removes reviews that break its rules. An honest bad review stays up, even if it feels unfair.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                    <p className="font-medium text-foreground">Google removes reviews that are:</p>
                    <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
                        {REMOVABLE.map((reason) => <li key={reason}>{reason}</li>)}
                    </ul>
                    <p className="rounded-lg bg-muted/50 p-3 text-muted-foreground">
                        If it&rsquo;s a real customer, a calm reply usually does more good: future customers read how you respond.
                        In Google&rsquo;s tool, choose your business, then <span className="font-medium text-foreground">Report a new review for removal</span>,
                        and find this review. Google usually decides within a few days.
                    </p>
                </div>
                <DialogFooter className="gap-2 sm:justify-between">
                    <Button asChild variant="ghost" size="sm">
                        <a href={GOOGLE_REPORT_REVIEWS_HELP_URL} target="_blank" rel="noopener noreferrer">Google&rsquo;s rules</a>
                    </Button>
                    <Button asChild size="sm">
                        <a href={GOOGLE_REVIEWS_MANAGEMENT_TOOL_URL} target="_blank" rel="noopener noreferrer" onClick={() => onOpenChange(false)}>
                            Open Google&rsquo;s report tool<ExternalLink className="size-4" aria-hidden />
                        </a>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
