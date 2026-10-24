"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, Check, Copy, Handshake, Link2, MessageSquareReply, PartyPopper, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleImportStatus } from "./google-import-status";
import type { WelcomeTourData } from "./welcome-tour-types";

export type WelcomeSlide = { icon: LucideIcon; title: string; body: React.ReactNode };

function CopyLink({ url }: { url: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* Clipboard blocked: the link stays visible to copy by hand. */
        }
    };
    return (
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">{url.replace(/^https?:\/\//, "")}</span>
            <Button type="button" size="xs" variant="outline" onClick={() => void copy()}>
                {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                {copied ? "Copied" : "Copy"}
            </Button>
        </div>
    );
}

function Point({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-2 text-sm leading-6 text-foreground">
            <Check className="mt-1 size-4 shrink-0 text-success" aria-hidden />
            <span>{children}</span>
        </li>
    );
}

/** Five short slides in Zyene's voice. Everything they say is true for this business right now. */
export function buildWelcomeSlides(data: WelcomeTourData, actions: { importCustomers: () => void; replyRules: () => void }): WelcomeSlide[] {
    return [
        {
            icon: PartyPopper,
            title: `Great work, ${data.firstName}!`,
            body: (
                <div className="space-y-3">
                    <p className="text-sm leading-6 text-muted-foreground">
                        {data.businessName} is set up. Here&apos;s how Zyene gets you more reviews and keeps your replies on time. It takes 30 seconds.
                    </p>
                    {data.googleConnected ? <GoogleImportStatus businessId={data.businessId} /> : null}
                </div>
            ),
        },
        {
            icon: Link2,
            title: "Your review link",
            body: (
                <div className="space-y-3">
                    <p className="text-sm leading-6 text-muted-foreground">Every customer who opens it is sent straight to leave you a review.</p>
                    <CopyLink url={data.reviewLink} />
                    <ul className="space-y-1">
                        <Point>Text or email it after a visit</Point>
                        <Point>Print the QR code from your dashboard for receipts, tables and the door</Point>
                    </ul>
                </div>
            ),
        },
        {
            icon: Users,
            title: "Ask your past customers",
            body: (
                <div className="space-y-3">
                    <p className="text-sm leading-6 text-muted-foreground">
                        Upload a spreadsheet of past customers. Zyene invites a few each day by text or email, so nobody gets flooded, and follows up with
                        anyone who doesn&apos;t answer.
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={actions.importCustomers}>Import customers now</Button>
                </div>
            ),
        },
        {
            icon: MessageSquareReply,
            title: "Replies, with you in control",
            body: (
                <div className="space-y-3">
                    {data.replyRules.length > 0 ? (
                        <ul className="space-y-1">
                            {data.replyRules.map((line) => <Point key={line}>New {line}</Point>)}
                        </ul>
                    ) : (
                        <p className="text-sm leading-6 text-muted-foreground">
                            Right now you reply yourself. Turn on reply rules and Zyene drafts a reply to every new review for you to approve.{" "}
                            <button type="button" onClick={actions.replyRules} className="font-medium text-primary hover:underline">Set up reply rules</button>
                        </p>
                    )}
                    <p className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                        <CalendarDays className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                        Everything Zyene sends or posts shows on your activity calendar.
                    </p>
                </div>
            ),
        },
        {
            icon: Handshake,
            title: "We make a great team",
            body: (
                <ul className="space-y-1">
                    <Point>Check &ldquo;Needs you&rdquo; at the top of your dashboard. It lists only what needs you today.</Point>
                    <Point>Reviews come in as customers answer, so the first new ones often take a few days.</Point>
                    <Point>Stuck? The help button at the top right is always there.</Point>
                </ul>
            ),
        },
    ];
}
