"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    displayCustomerName,
    formSchema,
    type CustomerSearchRow,
    type FormValues,
    type SendRequestDialogProps,
} from "./send-request-dialog-schema";
import { submitSendRequest } from "./send-request-dialog-submit";
import { useSendRequestCustomerSearch } from "./use-send-request-customer-search";

export function useSendRequestDialog({
    businessId,
    initialCustomer,
    autoOpen,
}: Pick<SendRequestDialogProps, "businessId" | "initialCustomer" | "autoOpen">) {
    const router = useRouter();
    const [open, setOpen] = useState(autoOpen || false);
    const [isLoading, setIsLoading] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const initialDigits = (initialCustomer?.phone ?? "").replace(/\D/g, "");
    const initialEmail = (initialCustomer?.email || "").trim();
    const initialEmailValid = z.string().email().safeParse(initialEmail).success;
    const defaultChannel: "sms" | "email" | "both" =
        initialDigits.length >= 10 && initialEmailValid
            ? "both"
            : initialDigits.length >= 10
              ? "sms"
              : initialEmailValid
                ? "email"
                : "sms";

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: {
            customerName: initialCustomer?.name || "",
            customerPhone: initialCustomer?.phone || "",
            customerEmail: initialCustomer?.email || "",
            channel: defaultChannel,
            scheduleEnabled: false,
            scheduleAt: "",
        },
    });

    const watchName = form.watch("customerName");
    const {
        suggestions,
        suggestLoading,
        suggestOpen,
        setSuggestOpen,
        setSuggestions,
        nameWrapRef,
    } = useSendRequestCustomerSearch(businessId, watchName);

    useEffect(() => {
        if (!open || !initialCustomer) return;
        const digits = (initialCustomer.phone || "").replace(/\D/g, "").length;
        const em = (initialCustomer.email || "").trim();
        const emailOk = z.string().email().safeParse(em).success;
        const ch: "sms" | "email" | "both" =
            digits >= 10 && emailOk ? "both" : digits >= 10 ? "sms" : emailOk ? "email" : "sms";
        form.reset({
            customerName: initialCustomer.name || "",
            customerPhone: initialCustomer.phone || "",
            customerEmail: initialCustomer.email || "",
            channel: ch,
            scheduleEnabled: false,
            scheduleAt: "",
        });
    }, [open, initialCustomer?.name, initialCustomer?.phone, initialCustomer?.email, form]);

    function applyCustomerPick(c: CustomerSearchRow) {
        form.setValue("customerName", displayCustomerName(c));
        if (c.phone?.trim()) form.setValue("customerPhone", c.phone.trim());
        if (c.email?.trim()) form.setValue("customerEmail", c.email.trim());
        const digits = (c.phone || "").replace(/\D/g, "").length;
        const em = (c.email || "").trim();
        const emailOk = z.string().email().safeParse(em).success;
        if (digits >= 10 && emailOk) {
            form.setValue("channel", "both");
        } else if (digits >= 10) {
            form.setValue("channel", "sms");
        } else if (emailOk) {
            form.setValue("channel", "email");
        }
        setSuggestOpen(false);
        setSuggestions([]);
    }

    async function onSubmit(values: FormValues) {
        await submitSendRequest(
            values,
            businessId,
            form,
            router,
            setOpen,
            setShowUpgradeModal,
            setIsLoading,
        );
    }

    const channel = form.watch("channel");
    const scheduleEnabled = form.watch("scheduleEnabled");

    return {
        form,
        open,
        setOpen,
        isLoading,
        suggestions,
        suggestLoading,
        suggestOpen,
        showUpgradeModal,
        setShowUpgradeModal,
        nameWrapRef,
        channel,
        scheduleEnabled,
        applyCustomerPick,
        onSubmit,
    };
}
