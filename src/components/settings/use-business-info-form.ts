"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { BusinessSettingsRecord } from "@/types/components";
import { businessFormSchema, type BusinessFormValues } from "./business-info-form-schema";

export function useBusinessInfoForm(business: BusinessSettingsRecord) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<BusinessFormValues>({
        resolver: zodResolver(businessFormSchema),
        defaultValues: {
            name: business.name || "",
            sender_name: business.sender_name || "",
            phone: business.phone || "",
            email: business.email || "",
            address_line1: business.address_line1 || "",
            city: business.city || "",
            state: business.state || "",
            zip: business.zip || "",
            timezone: business.timezone || "America/New_York",
            category: business.category || "other",
        },
    });

    async function onSubmit(data: BusinessFormValues) {
        setIsLoading(true);
        try {
            const payload = {
                ...data,
                sender_name: data.sender_name?.trim() ? data.sender_name.trim() : null,
            };
            const response = await fetch(`/api/businesses/${business.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to update business info");
            }

            toast.success("Business information updated");
            form.reset(data);
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    return { form, isLoading, onSubmit };
}
