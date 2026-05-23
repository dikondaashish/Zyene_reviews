"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { updateOrganizationName } from "@/app/actions/onboarding";
import { stepOrganizationSchema, type StepOrganizationFormData } from "@/lib/validations/onboarding";

export function useStep1Form(organizationId: string, initialOrgName: string, onNext: () => void) {
    const [mounted, setMounted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<StepOrganizationFormData>({
        resolver: zodResolver(stepOrganizationSchema),
        mode: "onChange",
        defaultValues: {
            organizationName: initialOrgName,
        },
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (initialOrgName) {
            form.setValue("organizationName", initialOrgName);
        }
    }, [initialOrgName, form]);

    const onSubmit = async (data: StepOrganizationFormData) => {
        setSubmitting(true);
        try {
            const result = await updateOrganizationName(organizationId, data.organizationName);
            if (result.success) {
                toast.success("Organization name saved!");
                onNext();
            } else {
                toast.error(result.error || "Failed to save");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    return { form, mounted, submitting, onSubmit };
}
