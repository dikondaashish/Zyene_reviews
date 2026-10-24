"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { updateBusinessCategory } from "@/app/actions/onboarding";
import { stepCategorySchema, type StepCategoryFormData } from "@/lib/validations/onboarding";
import { knownIndustry } from "./step3-form-categories";

export function useStep3Form(
    businessId: string,
    initialCategory: string | undefined,
    onNext: (category: string) => void,
    externalIsLoading = false,
    defaultSupportEmail = "",
) {
    const [isLoading, setIsLoading] = useState(externalIsLoading);

    // "uncategorized" (every new account) and anything else that isn't a tile leaves the grid empty.
    const startCategory = knownIndustry(initialCategory) ?? undefined;
    const form = useForm<StepCategoryFormData>({
        resolver: zodResolver(stepCategorySchema),
        defaultValues: {
            category: startCategory as StepCategoryFormData["category"],
            supportEmail: defaultSupportEmail,
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (startCategory) {
            form.setValue("category", startCategory as StepCategoryFormData["category"]);
            form.trigger("category");
        }
    }, [startCategory, form]);

    const selectedCategory = form.watch("category");

    // No auto-continue on pick: the owner should see and confirm the reply email below the grid.

    /** Saves the industry and support email; true when saved (and `onNext` has run). */
    const onSubmit = async (data: StepCategoryFormData): Promise<boolean> => {
        setIsLoading(true);
        try {
            const result = await updateBusinessCategory(businessId, data);
            if (result.success) {
                toast.success("Saved");
                onNext(data.category);
                return true;
            }
            toast.error(result.error || "Failed to save category");
            return false;
        } catch {
            toast.error("Something went wrong. Please try again.");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { form, isLoading, selectedCategory, onSubmit };
}
