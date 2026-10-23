"use client";

import { useState } from "react";
import type { LeadWizardGoal, LeadWizardIndustry } from "@/lib/marketing/lead-wizard-personalization";
import { rememberConverted } from "@/lib/marketing/lead-wizard-storage";
import { trackLeadWizard, type LeadWizardSession } from "@/lib/marketing/track-lead-wizard-client";

export type LeadWizardSubmitStatus = "idle" | "loading" | "success" | "error";
const FALLBACK_DOWNLOAD = "/zyene-overview.pdf";

/** Posts the lead, then records the conversion so the wizard never interrupts this visitor again. */
export function useHomeLeadWizardSubmit(session: LeadWizardSession, onConverted: () => void) {
    const [status, setStatus] = useState<LeadWizardSubmitStatus>("idle");
    const [message, setMessage] = useState("");
    const [downloadUrl, setDownloadUrl] = useState(FALLBACK_DOWNLOAD);
    const [emailSent, setEmailSent] = useState(false);

    async function submit(input: { email: string; industry?: LeadWizardIndustry; goal?: LeadWizardGoal }) {
        if (status === "loading") return;
        setStatus("loading");
        setMessage("");
        try {
            const response = await fetch("/api/marketing/book-lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...input, email: input.email.trim(), trigger: session.trigger, pagePath: session.pagePath }),
            });
            const data: { error?: string; downloadUrl?: string; emailSent?: boolean } = await response.json().catch(() => ({}));
            if (!response.ok) {
                setStatus("error");
                setMessage(data.error ?? "Something went wrong. Please try again.");
                return;
            }
            setDownloadUrl(data.downloadUrl ?? FALLBACK_DOWNLOAD);
            setEmailSent(data.emailSent === true);
            setStatus("success");
            rememberConverted();
            onConverted();
            trackLeadWizard("lead_wizard_convert", session, { industry: input.industry ?? "", goal: input.goal ?? "" });
            const w = window as unknown as { dataLayer?: unknown[] };
            w.dataLayer = w.dataLayer || [];
            w.dataLayer.push({ event: "guide_download", lead_wizard_trigger: session.trigger });
        } catch {
            setStatus("error");
            setMessage("Network error. Please try again.");
        }
    }

    return { status, message, downloadUrl, emailSent, submit };
}
