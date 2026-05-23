"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { updateBusinessCategory } from "@/app/actions/onboarding";
import { stepCategorySchema, type StepCategoryFormData } from "@/lib/validations/onboarding";

export function useStep3Form(
    businessId: string,
    initialCategory: string | undefined,
    onNext: () => void,
    externalIsLoading = false,
) {
    const [isLoading, setIsLoading] = useState(externalIsLoading);
    const autoSubmitTriggered = useRef(false);

    const form = useForm<StepCategoryFormData>({
        resolver: zodResolver(stepCategorySchema),
        defaultValues: {
            category:
                (initialCategory as StepCategoryFormData["category"]) ||
                (undefined as unknown as StepCategoryFormData["category"]),
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (initialCategory) {
            form.setValue("category", initialCategory as StepCategoryFormData["category"]);
            form.trigger("category");
        }
    }, [initialCategory, form]);

    const selectedCategory = form.watch("category");

    useEffect(() => {
        if (!selectedCategory || isLoading || autoSubmitTriggered.current) return;
        if (initialCategory && selectedCategory === initialCategory) return;

        const timer = setTimeout(() => {
            autoSubmitTriggered.current = true;
            form.handleSubmit(onSubmit)();
        }, 600);

        return () => clearTimeout(timer);
    }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

    const onSubmit = async (data: StepCategoryFormData) => {
        setIsLoading(true);
        try {
            const result = await updateBusinessCategory(businessId, data);
            if (result.success) {
                toast.success("Category saved!");
                onNext();
            } else {
                toast.error(result.error || "Failed to save category");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return { form, isLoading, selectedCategory, onSubmit };
}
