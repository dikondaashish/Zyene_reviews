"use client";

import { motion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Step1FormHeader } from "./step1-form-header";
import { Step1FormOrganizationField } from "./step1-form-organization-field";
import { useStep1Form } from "./use-step1-form";

interface Step1Props {
    onNext: () => void;
    isLoading: boolean;
    organizationId: string;
    initialOrgName?: string;
}

export function Step1Form({ onNext, isLoading, organizationId, initialOrgName = "" }: Step1Props) {
    const { form, mounted, submitting, onSubmit } = useStep1Form(organizationId, initialOrgName, onNext);

    if (!mounted) {
        return null;
    }

    return (
        <div className="space-y-6">
            <Step1FormHeader />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Step1FormOrganizationField form={form} submitting={submitting} isLoading={isLoading} />

                    <Button
                        type="submit"
                        disabled={!form.formState.isValid || submitting || isLoading}
                        className="w-full h-12 text-sm font-semibold cta-button"
                    >
                        {submitting || isLoading ? (
                            <>
                                <Loader2 className="mr-2 animate-spin size-5" />
                                Saving...
                            </>
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="ml-2 group-hover:translate-x-0.5 transition-transform size-5" />
                            </>
                        )}
                    </Button>
                </form>
            </Form>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 p-4 bg-primary/[0.04] border border-primary/10 rounded-2xl"
            >
                <Sparkles className="text-primary mt-0.5 shrink-0 size-4" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Quick setup</span> — Most users complete
                    onboarding in under 2 minutes. We&apos;ll guide you through each step.
                </p>
            </motion.div>
        </div>
    );
}
