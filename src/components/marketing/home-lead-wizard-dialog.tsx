"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { HomeLeadWizardEmailStep } from "@/components/marketing/home-lead-wizard-email-step";
import { HomeLeadWizardProgress } from "@/components/marketing/home-lead-wizard-progress";
import { HomeLeadWizardQuestionStep } from "@/components/marketing/home-lead-wizard-question-step";
import { HomeLeadWizardSuccess } from "@/components/marketing/home-lead-wizard-success";
import { HomeLeadWizardPreviewChip, HomeLeadWizardVisual } from "@/components/marketing/home-lead-wizard-visual";
import { useHomeLeadWizardSubmit } from "@/components/marketing/use-home-lead-wizard-submit";
import { guidePreview, type LeadWizardGoal, type LeadWizardIndustry } from "@/lib/marketing/lead-wizard-personalization";
import { trackLeadWizard, type LeadWizardSession } from "@/lib/marketing/track-lead-wizard-client";

type Props = {
    open: boolean;
    session: LeadWizardSession;
    onClose: (step: string) => void;
    onConverted: () => void;
    onCloseFocus: () => void;
};

export function HomeLeadWizardDialog({ open, session, onClose, onConverted, onCloseFocus }: Props) {
    const [step, setStep] = useState<1 | 2>(1);
    const [industry, setIndustry] = useState<LeadWizardIndustry | undefined>(session.industry);
    const [goal, setGoal] = useState<LeadWizardGoal | undefined>(session.goal);
    const [email, setEmail] = useState("");
    const { status, message, downloadUrl, emailSent, submit } = useHomeLeadWizardSubmit(session, onConverted);
    const preview = guidePreview(industry, goal);
    const done = status === "success";
    const stepName = done ? "success" : step === 1 ? "questions" : "email";

    function goToEmail() {
        setStep(2);
        trackLeadWizard("lead_wizard_step_complete", session, { step: "questions", industry: industry ?? "", goal: goal ?? "" });
    }

    return (
        <DialogPrimitive.Root open={open} onOpenChange={(next) => (next ? undefined : onClose(stepName))}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="home-lead-wizard-backdrop" />
                <DialogPrimitive.Content
                    className="home-lead-wizard"
                    onCloseAutoFocus={(event) => {
                        event.preventDefault();
                        onCloseFocus();
                    }}
                    data-home-lead-wizard
                    data-step={stepName}
                >
                    <HomeLeadWizardVisual preview={preview} personalized={Boolean(industry || goal)} />
                    <div className="home-lead-wizard-content">
                        <div className="home-lead-wizard-topbar">
                            <HomeLeadWizardProgress step={done ? 3 : step} />
                            <DialogPrimitive.Close className="home-lead-wizard-close" aria-label="Close guide offer">
                                <X size={18} aria-hidden="true" />
                            </DialogPrimitive.Close>
                        </div>
                        <HomeLeadWizardPreviewChip preview={preview} />
                        {done ? (
                            <HomeLeadWizardSuccess
                                downloadUrl={downloadUrl}
                                emailSent={emailSent}
                                title={preview.title}
                                goal={goal}
                                onClose={() => onClose("success")}
                            />
                        ) : step === 1 ? (
                            <HomeLeadWizardQuestionStep
                                trigger={session.trigger}
                                industry={industry}
                                goal={goal}
                                suggested={{ industry: session.industry, goal: session.goal }}
                                onIndustryChange={setIndustry}
                                onGoalChange={setGoal}
                                onNext={goToEmail}
                            />
                        ) : (
                            <HomeLeadWizardEmailStep
                                email={email}
                                preview={preview}
                                isLoading={status === "loading"}
                                serverError={status === "error" ? message : ""}
                                onEmailChange={setEmail}
                                onSubmit={() => void submit({ email, industry, goal })}
                                onBack={() => setStep(1)}
                            />
                        )}
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
