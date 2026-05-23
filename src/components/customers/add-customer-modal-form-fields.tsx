"use client";

import type { UseFormReturn } from "react-hook-form";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AddCustomerFormValues } from "./add-customer-modal-schema";

export function AddCustomerModalFormFields({
    form,
    isLoading,
}: {
    form: UseFormReturn<AddCustomerFormValues>;
    isLoading: boolean;
}) {
    return (
        <>
            <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="John Doe" disabled={isLoading} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="john@example.com" disabled={isLoading} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                            <Input
                                type="tel"
                                placeholder="(555) 123-4567"
                                disabled={isLoading}
                                {...field}
                                value={field.value || ""}
                            />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                            Format: (555) 123-4567 or any format you prefer
                        </p>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Add any notes about this customer..."
                                disabled={isLoading}
                                className="resize-none"
                                rows={3}
                                {...field}
                                value={field.value || ""}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}
