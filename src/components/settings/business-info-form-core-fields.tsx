"use client";

import type { UseFormReturn } from "react-hook-form";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { BusinessFormValues } from "./business-info-form-schema";

export function BusinessInfoFormCoreFields({ form }: { form: UseFormReturn<BusinessFormValues> }) {
    return (
        <>
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="sender_name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sender Name (review emails)</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. Sam" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormDescription>
                            The first name shown as the email sender (e.g. <em>Sam &lt;hello@zyenereviews.com&gt;</em>)
                            and used to sign off the message. Leave empty to send as your business name. A real
                            first name dramatically improves Gmail Primary placement.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}
