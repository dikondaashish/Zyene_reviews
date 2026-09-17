"use client";

import type { CampaignPreviewContext } from "@/lib/campaigns/preview";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STEPS } from "./new-campaign-constants";
import { NewCampaignBasicsStep } from "./new-campaign-basics-step";
import { NewCampaignMessageStep } from "./new-campaign-message-step";
import { NewCampaignReviewStep } from "./new-campaign-review-step";
import { NewCampaignStepIndicator } from "./new-campaign-step-indicator";
import { NewCampaignTimingStep } from "./new-campaign-timing-step";
import { NewCampaignActions } from "@/app/(dashboard)/campaigns/new/new-campaign-actions";
import { useNewCampaignForm } from "./use-new-campaign-form";

export function NewCampaignForm({ context }: { context: CampaignPreviewContext }) {
    const {
        router,
        step,
        setStep,
        saving,
        createdCampaignId,
        saveError,
        form,
        updateForm,
        preselectedCustomerCount,
        smsCharCount,
        previewSMS,
        canProceed,
        saveCampaign,
    } = useNewCampaignForm(context);

    return (
        <div className="mx-auto flex min-w-0 w-full max-w-3xl flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6">
            <div className="flex items-center gap-4">
                <Button
                    aria-label="Back to campaigns"
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/campaigns")}
                >
                    <ArrowLeft className="size-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Campaign</h1>
                    <p className="text-muted-foreground">Set up an automated review request campaign</p>
                </div>
            </div>

            {preselectedCustomerCount > 0 && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
                    <strong>{preselectedCustomerCount}</strong> customer
                    {preselectedCustomerCount === 1 ? "" : "s"} selected for this campaign. Only customers with contact
                    details for your chosen channel and no opt-out will be queued.{" "}
                    {preselectedCustomerCount > 500 && <strong>Choose up to 500 customers per campaign.</strong>}
                </div>
            )}

            <fieldset disabled={saving || Boolean(createdCampaignId)} className="min-w-0 space-y-6">
                <NewCampaignStepIndicator step={step} setStep={setStep} />

                <Card>
                    <CardContent className="p-6">
                        {step === 0 && (
                            <NewCampaignBasicsStep
                                form={form}
                                updateForm={updateForm}
                                audienceSelected={preselectedCustomerCount > 0}
                            />
                        )}
                        {step === 1 && (
                            <NewCampaignMessageStep
                                form={form}
                                updateForm={updateForm}
                                smsCharCount={smsCharCount}
                                previewSMS={previewSMS}
                            />
                        )}
                        {step === 2 && <NewCampaignTimingStep form={form} updateForm={updateForm} />}
                        {step === 3 && <NewCampaignReviewStep context={context} form={form} customerCount={preselectedCustomerCount} />}
                    </CardContent>
                </Card>
            </fieldset>
            {saveError && (
                <div
                    role="alert"
                    className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
                >
                    {saveError}
                    {createdCampaignId && (
                        <p className="mt-2">
                            Your campaign is saved. Retry queueing below; it will not create another campaign.{" "}
                            <Link href={`/campaigns/${createdCampaignId}`} className="font-semibold underline">
                                View saved campaign
                            </Link>
                        </p>
                    )}
                </div>
            )}

            <NewCampaignActions
                step={step}
                lastStep={STEPS.length - 1}
                saving={saving}
                created={Boolean(createdCampaignId)}
                customerCount={preselectedCustomerCount}
                canProceed={canProceed()}
                onBack={() => (step > 0 ? setStep(step - 1) : router.push("/campaigns"))}
                onNext={() => setStep(step + 1)}
                onSave={saveCampaign}
            />
        </div>
    );
}
