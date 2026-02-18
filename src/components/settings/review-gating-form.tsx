"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const gatingSchema = z.object({
    min_stars_for_google: z.number().min(1).max(5),
    welcome_message: z.string().optional(),
    apology_message: z.string().optional(),
});

type GatingFormValues = z.infer<typeof gatingSchema>;

interface ReviewGatingFormProps {
    business: {
        id: string;
        min_stars_for_google?: number;
        welcome_message?: string;
        apology_message?: string;
    };
    onValuesChange?: (values: Partial<GatingFormValues>) => void;
}

export function ReviewGatingForm({ business, onValuesChange }: ReviewGatingFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const form = useForm<GatingFormValues>({
        // @ts-ignore
        resolver: zodResolver(gatingSchema),
        defaultValues: {
            min_stars_for_google: business.min_stars_for_google || 4,
            welcome_message: business.welcome_message || "",
            apology_message: business.apology_message || "",
        },
    });

    useEffect(() => {
        if (business) {
            form.reset({
                min_stars_for_google: business.min_stars_for_google || 4,
                welcome_message: business.welcome_message || "",
                apology_message: business.apology_message || "",
            });
        }
    }, [business, form]);

    const watchedValues = form.watch(); // Added

    useEffect(() => { // Added useEffect
        onValuesChange?.(watchedValues);
    }, [JSON.stringify(watchedValues), onValuesChange]);

    const onSubmit = async (data: GatingFormValues) => { // Changed GatingFormValues to ReviewGatingFormValues
        setIsLoading(true);
        try {
            const response = await fetch(`/api/businesses/${business.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to update");
            }

            toast.success("Settings updated");
            router.refresh();
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-slate-900">Review Gates & Messaging</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Control who sees public review links and what they see.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
                    <FormField
                        control={form.control as any}
                        name="min_stars_for_google"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum Stars for Public Review</FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={String(field.value)}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select stars" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1">1 Star & Up</SelectItem>
                                        <SelectItem value="2">2 Stars & Up</SelectItem>
                                        <SelectItem value="3">3 Stars & Up</SelectItem>
                                        <SelectItem value="4">4 Stars & Up (Recommended)</SelectItem>
                                        <SelectItem value="5">5 Stars Only</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    {form.watch("min_stars_for_google") === 1
                                        ? "All ratings will be directed to public review flow."
                                        : "Customers rating below this threshold will be asked for private feedback instead."}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control as any}
                        name="welcome_message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Welcome Message</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Thanks for visiting! How was your experience?"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Displayed at the top of the review page.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control as any}
                        name="apology_message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Private Feedback Request</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="We're sorry to hear that. Please tell us how we can improve."
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Displayed when a customer rates below the threshold.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 h-10 w-full md:w-auto"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Settings
                    </Button>
                </form>
            </Form>
        </div>
    );
}
