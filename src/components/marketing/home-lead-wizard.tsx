"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { BookOpen, X } from "lucide-react";
import { HomeLeadWizardEmailStep } from "@/components/marketing/home-lead-wizard-email-step";
import { HomeLeadWizardProgress } from "@/components/marketing/home-lead-wizard-progress";
import { HomeLeadWizardQuestionStep } from "@/components/marketing/home-lead-wizard-question-step";
import { HomeLeadWizardSuccess } from "@/components/marketing/home-lead-wizard-success";
import { HomeLeadWizardVisual } from "@/components/marketing/home-lead-wizard-visual";
import { Dialog as DialogPrimitive } from "radix-ui";

export function HomeLeadWizard() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [industry, setIndustry] = useState("");
    const [goal, setGoal] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    useEffect(() => {
        if (new URLSearchParams(window.location.search).get("qa") === "wizard") setOpen(true);
    }, []);

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
        } catch {
            setStatus("error");
            setMessage("Network error. Please try again.");
        }
    }

    return (
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <section className="home-guide-offer" aria-labelledby="home-guide-heading">
                <div>
                    <p className="text-sm font-medium text-primary">The local business guide</p>
                    <h2 id="home-guide-heading" className="mt-2 text-2xl font-semibold tracking-tight">
                        A stronger reputation starts with a simple routine.
                    </h2>
                    <p className="mt-3 max-w-xl text-muted-foreground">
                        Practical steps to collect useful feedback, reply with care, and make every customer feel heard.
                    </p>
                </div>
                <DialogPrimitive.Trigger className="marketing-button shrink-0">
                    <BookOpen className="size-4" aria-hidden="true" /> Get the free guide
                </DialogPrimitive.Trigger>
            </section>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="home-lead-wizard-backdrop" />
                <DialogPrimitive.Content
                    className="home-lead-wizard home-lead-wizard-dialog"
                    data-home-lead-wizard
                    data-state={status}
                >
                    <button
                        type="button"
                        className="home-lead-wizard-close"
                        aria-label="Close guide offer"
                        onClick={() => setOpen(false)}
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
                                onClose={() => setOpen(false)}
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
