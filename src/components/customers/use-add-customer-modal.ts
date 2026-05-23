"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
    addCustomerSchema,
    type AddCustomerFormValues,
    type AddCustomerModalProps,
} from "./add-customer-modal-schema";

export function useAddCustomerModal({
    onOpenChange,
    businessId,
    onSuccess,
}: Pick<AddCustomerModalProps, "onOpenChange" | "businessId" | "onSuccess">) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<AddCustomerFormValues>({
        resolver: zodResolver(addCustomerSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            notes: "",
        },
    });

    const onSubmit = async (values: AddCustomerFormValues) => {
        setIsLoading(true);
        try {
            const nameParts = values.fullName.trim().split(/\s+/);
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(" ") || null;

            const response = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessId,
                    firstName,
                    lastName,
                    email: values.email.trim(),
                    phone: values.phone?.trim() || undefined,
                    tags: [],
                    notes: values.notes?.trim() || undefined,
                }),
            });

            if (!response.ok) {
                const body = (await response.json().catch(() => ({}))) as {
                    error?: string;
                    message?: string;
                };
                throw new Error(body.error || body.message || "Failed to add customer");
            }

            toast.success("Customer added successfully");
            onOpenChange(false);
            form.reset();
            await onSuccess?.();
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to add customer";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return { form, isLoading, onSubmit };
}
