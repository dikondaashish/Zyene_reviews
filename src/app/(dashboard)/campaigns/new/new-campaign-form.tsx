"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STEPS } from "./new-campaign-constants";
import { NewCampaignBasicsStep } from "./new-campaign-basics-step";
import { NewCampaignMessageStep } from "./new-campaign-message-step";
import { NewCampaignReviewStep } from "./new-campaign-review-step";
import { NewCampaignStepIndicator } from "./new-campaign-step-indicator";
import { NewCampaignTimingStep } from "./new-campaign-timing-step";
import { useNewCampaignForm } from "./use-new-campaign-form";

export function NewCampaignForm() {
    const {
        router,
        step,
        setStep,
        saving,
        form,
        updateForm,
        preselectedCustomerCount,
        smsCharCount,
        previewSMS,
        canProceed,
        saveCampaign,
    } = useNewCampaignForm();

    return (
        <div className="mx-auto flex min-w-0 w-full max-w-3xl flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/campaigns")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Campaign</h1>
                    <p className="text-muted-foreground">
                        Set up an automated review request campaign
                    </p>
                </div>
            </div>

            {preselectedCustomerCount > 0 && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
                    <strong>{preselectedCustomerCount}</strong> customer
                    {preselectedCustomerCount === 1 ? "" : "s"} selected from the Customers page. Continue with a manual
                    batch campaign; your selection is passed in the URL as <code className="text-xs">customerIds</code> for
                    launch workflows.
                </div>
            )}

            <NewCampaignStepIndicator step={step} setStep={setStep} />

            <Card>
                <CardContent className="p-6">
                    {step === 0 && <NewCampaignBasicsStep form={form} updateForm={updateForm} />}
                    {step === 1 && (
                        <NewCampaignMessageStep
                            form={form}
                            updateForm={updateForm}
                            smsCharCount={smsCharCount}
                            previewSMS={previewSMS}
                        />
                    )}
                    {step === 2 && <NewCampaignTimingStep form={form} updateForm={updateForm} />}
                    {step === 3 && <NewCampaignReviewStep form={form} />}
                </CardContent>
            </Card>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => step > 0 ? setStep(step - 1) : router.push("/campaigns")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {step > 0 ? "Back" : "Cancel"}
                </Button>

                <div className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-end">
                    {step === STEPS.length - 1 ? (
                        <>
                            <Button variant="outline" onClick={() => saveCampaign("draft")} disabled={saving}>
                                Save as Draft
                            </Button>
                            <Button onClick={() => saveCampaign("active")} disabled={saving}>
                                {saving ? "Saving..." : "Launch Campaign"}
                                {!saving && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
