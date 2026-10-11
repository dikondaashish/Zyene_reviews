"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { X } from "lucide-react";
import { HomeLeadWizardEmailStep } from "@/components/marketing/home-lead-wizard-email-step";
import { HomeLeadWizardProgress } from "@/components/marketing/home-lead-wizard-progress";
import { HomeLeadWizardQuestionStep } from "@/components/marketing/home-lead-wizard-question-step";
import { HomeLeadWizardSuccess } from "@/components/marketing/home-lead-wizard-success";
import { HomeLeadWizardVisual } from "@/components/marketing/home-lead-wizard-visual";
import { Dialog as DialogPrimitive } from "radix-ui";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; onCloseFocus: () => void };

export function HomeLeadWizardDialog({ open, onOpenChange, onCloseFocus }: Props) {
    const [step, setStep] = useState<1 | 2>(1);
    const [industry, setIndustry] = useState("");
    const [goal, setGoal] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (status === "loading") return;
        setStatus("loading");
        setMessage("");
        try {
            const response = await fetch("/api/marketing/book-lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), industry, goal }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setStatus("error");
                setMessage(data.error ?? "Something went wrong. Please try again.");
                return;
            }
            setDownloadUrl(data.downloadUrl ?? "/zyene-overview.pdf");
            setEmailSent(data.emailSent === true);
            setStatus("success");
            if (typeof window !== "undefined") {
                const w = window as unknown as { dataLayer?: unknown[] };
                w.dataLayer = w.dataLayer || [];
                w.dataLayer.push({ event: "guide_download" });
            }
        } catch {
            setStatus("error");
            setMessage("Network error. Please try again.");
        }
    }

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="home-lead-wizard-backdrop" />
                <DialogPrimitive.Content
                    className="home-lead-wizard home-lead-wizard-dialog"
                    onCloseAutoFocus={(event) => { event.preventDefault(); onCloseFocus(); }}
                    data-home-lead-wizard
                    data-state={status}
                >
                    <button
                        type="button"
                        className="home-lead-wizard-close"
                        aria-label="Close guide offer"
                        onClick={() => onOpenChange(false)}
                    >
                        <X size={19} aria-hidden="true" />
                    </button>
                    <HomeLeadWizardVisual />
                    <div className="home-lead-wizard-content">
                        <HomeLeadWizardProgress step={step} />
                        {status === "success" ? (
                            <HomeLeadWizardSuccess
                                downloadUrl={downloadUrl}
                                emailSent={emailSent}
                                onClose={() => onOpenChange(false)}
                            />
                        ) : step === 1 ? (
                            <HomeLeadWizardQuestionStep
                                industry={industry}
                                goal={goal}
                                onIndustryChange={setIndustry}
                                onGoalChange={setGoal}
                                onNext={() => setStep(2)}
                            />
                        ) : (
                            <HomeLeadWizardEmailStep
                                email={email}
                                isLoading={status === "loading"}
                                message={message}
                                onEmailChange={setEmail}
                                onSubmit={handleSubmit}
                                onBack={() => setStep(1)}
                            />
                        )}
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
