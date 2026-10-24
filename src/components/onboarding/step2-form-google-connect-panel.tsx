"use client";

import { ArrowRight, Check, Loader2, LockKeyhole } from "lucide-react";
import { Step2GoogleIcon } from "@/components/onboarding/step2-form-icons";

const BENEFITS = [
    "Imports your existing Google reviews",
    "Drafts replies in your tone for you to edit",
    "New reviews show up within minutes",
];

/** The recommended path: connect the Google Business Profile and everything fills itself in. */
export function Step2FormGoogleConnectPanel({ onConnectClick, pending, disabled }: {
    onConnectClick: () => void;
    pending: boolean;
    disabled: boolean;
}) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="ui-section-title flex items-center gap-2 text-foreground">
                    Connect Google Business Profile
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">Recommended</span>
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Fills in your details and brings in your reviews automatically.</p>
            </div>
            <button
                type="button"
                onClick={onConnectClick}
                disabled={pending || disabled}
                aria-busy={pending}
                className="group flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 transition-colors hover:border-primary/40 hover:bg-muted/40 disabled:cursor-wait disabled:opacity-60"
            >
                <span className="flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-md border border-border bg-white" aria-hidden><Step2GoogleIcon /></span>
                    <span className="text-sm font-medium text-foreground">{pending ? "Connecting…" : "Connect with Google"}</span>
                </span>
                {pending
                    ? <Loader2 aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
                    : <ArrowRight aria-hidden className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />}
            </button>
            <ul className="space-y-2">
                {BENEFITS.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="size-4 shrink-0 text-success" aria-hidden />{benefit}
                    </li>
                ))}
            </ul>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <LockKeyhole aria-hidden className="size-3 shrink-0" />
                We only read your profile. We never post on your behalf.
            </p>
            <p className="text-xs text-muted-foreground">Not ready? You can connect Google later in Settings → Integrations.</p>
        </div>
    );
}
