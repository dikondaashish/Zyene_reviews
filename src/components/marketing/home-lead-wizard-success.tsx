"use client";

import Link from "next/link";
import { ArrowRight, Check, Download } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useMarketingSignupUrl } from "@/lib/growth/marketing-signup-url";
import { nextStepFor, type LeadWizardGoal } from "@/lib/marketing/lead-wizard-personalization";

type Props = {
    downloadUrl: string;
    emailSent: boolean;
    title: string;
    goal?: LeadWizardGoal;
    onClose: () => void;
};

export function HomeLeadWizardSuccess({ downloadUrl, emailSent, title, goal, onClose }: Props) {
    const next = nextStepFor(goal);
    const signupUrl = useMarketingSignupUrl();
    const href = next.kind === "trial" ? signupUrl : next.href;
    return (
        <div className="home-lead-wizard-step home-lead-wizard-success">
            <span className="home-lead-wizard-success-icon" aria-hidden="true">
                <Check size={22} strokeWidth={2.75} />
            </span>
            <DialogPrimitive.Title className="home-lead-wizard-title">Your {title} is ready.</DialogPrimitive.Title>
            <DialogPrimitive.Description className="home-lead-wizard-description">
                {emailSent ? "We also sent a copy to your inbox. " : ""}Download it now and try one idea this week.
            </DialogPrimitive.Description>
            <a className="home-lead-wizard-primary" href={downloadUrl} download="zyene-reviews-guide.pdf" data-track="guide-download">
                <Download size={17} aria-hidden="true" /> Download the guide (PDF)
            </a>
            <div className="home-lead-wizard-next">
                <p>Want to put it on autopilot?</p>
                <Link
                    href={href}
                    className="home-lead-wizard-secondary"
                    data-track={next.kind}
                    data-track-location="lead-wizard-success"
                    onClick={onClose}
                >
                    {next.label} <ArrowRight size={16} aria-hidden="true" />
                </Link>
            </div>
            <button type="button" className="home-lead-wizard-text-button" onClick={onClose}>
                Continue browsing
            </button>
        </div>
    );
}
