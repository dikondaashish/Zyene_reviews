"use client";

import type { RefObject } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    displayCustomerName,
    type CustomerSearchRow,
    type FormValues,
} from "./send-request-dialog-schema";
import { SendRequestDialogFormScheduleFooter } from "./send-request-dialog-form-schedule-footer";

type SendRequestDialogFormFieldsProps = {
    form: UseFormReturn<FormValues>;
    nameWrapRef: RefObject<HTMLDivElement | null>;
    suggestions: CustomerSearchRow[];
    suggestLoading: boolean;
    suggestOpen: boolean;
    applyCustomerPick: (c: CustomerSearchRow) => void;
    scheduleEnabled: boolean;
    isLoading: boolean;
};

export function SendRequestDialogFormFields({
    form,
    nameWrapRef,
    suggestions,
    suggestLoading,
    suggestOpen,
    applyCustomerPick,
    scheduleEnabled,
    isLoading,
}: SendRequestDialogFormFieldsProps) {
    return (
        <>
            <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Customer name</FormLabel>
                        <div ref={nameWrapRef} className="relative">
                            <FormControl>
                                <Input
                                    autoComplete="off"
                                    placeholder="Start typing to search your contacts"
                                    {...field}
                                />
                            </FormControl>
                            {suggestOpen && (suggestions.length > 0 || suggestLoading) && (
                                <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-popover py-1 text-sm shadow-md">
                                    {suggestLoading && (
                                        <li className="px-3 py-2 text-muted-foreground">Searching…</li>
                                    )}
                                    {!suggestLoading &&
                                        suggestions.map((c) => (
                                            <li key={c.id}>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        "flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-muted",
                                                    )}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => applyCustomerPick(c)}
                                                >
                                                    <span className="font-medium text-foreground">
                                                        {displayCustomerName(c)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {[c.phone, c.email].filter(Boolean).join(" · ")}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                </ul>
                            )}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Customer number</FormLabel>
                        <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Customer email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <SendRequestDialogFormScheduleFooter
                form={form}
                scheduleEnabled={scheduleEnabled}
                isLoading={isLoading}
            />
        </>
    );
}
