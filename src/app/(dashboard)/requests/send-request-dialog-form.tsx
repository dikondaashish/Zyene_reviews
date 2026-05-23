"use client";

import type { RefObject } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { CustomerSearchRow, FormValues } from "./send-request-dialog-schema";
import { SendRequestDialogFormFields } from "./send-request-dialog-form-fields";

type SendRequestDialogFormProps = {
    form: UseFormReturn<FormValues>;
    onSubmit: (values: FormValues) => Promise<void>;
    channel: "sms" | "email" | "both";
    scheduleEnabled: boolean;
    isLoading: boolean;
    nameWrapRef: RefObject<HTMLDivElement | null>;
    suggestions: CustomerSearchRow[];
    suggestLoading: boolean;
    suggestOpen: boolean;
    applyCustomerPick: (c: CustomerSearchRow) => void;
};

export function SendRequestDialogForm({
    form,
    onSubmit,
    channel,
    scheduleEnabled,
    isLoading,
    nameWrapRef,
    suggestions,
    suggestLoading,
    suggestOpen,
    applyCustomerPick,
}: SendRequestDialogFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <FormLabel>Channel</FormLabel>
                    <FormField
                        control={form.control}
                        name="channel"
                        render={({ field }) => (
                            <div className="grid grid-cols-3 gap-2">
                                <label
                                    className={cn(
                                        "flex cursor-pointer items-center justify-center rounded-lg border p-3 transition-all",
                                        field.value === "sms"
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-input hover:bg-muted/50",
                                    )}
                                >
                                    <input
                                        type="radio"
                                        className="sr-only"
                                        checked={field.value === "sms"}
                                        onChange={() => field.onChange("sms")}
                                    />
                                    <span className="text-sm font-medium">SMS</span>
                                </label>
                                <label
                                    className={cn(
                                        "flex cursor-pointer items-center justify-center rounded-lg border p-3 transition-all",
                                        field.value === "email"
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-input hover:bg-muted/50",
                                    )}
                                >
                                    <input
                                        type="radio"
                                        className="sr-only"
                                        checked={field.value === "email"}
                                        onChange={() => field.onChange("email")}
                                    />
                                    <span className="text-sm font-medium">Email</span>
                                </label>
                                <label
                                    className={cn(
                                        "flex cursor-pointer items-center justify-center rounded-lg border p-3 transition-all",
                                        field.value === "both"
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-input hover:bg-muted/50",
                                    )}
                                >
                                    <input
                                        type="radio"
                                        className="sr-only"
                                        checked={field.value === "both"}
                                        onChange={() => field.onChange("both")}
                                    />
                                    <span className="text-sm font-medium">Both</span>
                                </label>
                            </div>
                        )}
                    />
                    {channel === "sms" && (
                        <p className="text-xs text-muted-foreground">
                            Sends to the customer number below. A valid mobile number is required.
                        </p>
                    )}
                    {channel === "email" && (
                        <p className="text-xs text-muted-foreground">
                            Sends to the email below. Customer number is optional for your records.
                        </p>
                    )}
                    {channel === "both" && (
                        <p className="text-xs text-muted-foreground">
                            Sends the same review link by SMS and email. Customer number and customer email are
                            both required.
                        </p>
                    )}
                </div>

                <SendRequestDialogFormFields
                    form={form}
                    nameWrapRef={nameWrapRef}
                    suggestions={suggestions}
                    suggestLoading={suggestLoading}
                    suggestOpen={suggestOpen}
                    applyCustomerPick={applyCustomerPick}
                    scheduleEnabled={scheduleEnabled}
                    isLoading={isLoading}
                />
            </form>
        </Form>
    );
}
