"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Schema for Form Interface (what the inputs use)
const formSchema = z.object({
    sms_enabled: z.boolean().default(false),
    phone_number: z.string().optional(),
    min_urgency_score: z.string(), // Kept as string for Select compatibility
    quiet_hours_start: z.string().optional(),
    quiet_hours_end: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NotificationForm({ initialPrefs, userId }: { initialPrefs: any; userId: string }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sms_enabled: initialPrefs?.sms_enabled || false,
            phone_number: initialPrefs?.phone_number || "",
            min_urgency_score: (initialPrefs?.min_urgency_score || 7).toString(),
            quiet_hours_start: initialPrefs?.quiet_hours_start || "",
            quiet_hours_end: initialPrefs?.quiet_hours_end || "",
        },
    });

    async function onSubmit(data: FormValues) {
        setIsSaving(true);
        try {
            // Convert string to number for API
            const payload = {
                ...data,
                min_urgency_score: parseInt(data.min_urgency_score),
            };

            const res = await fetch("/api/settings/notifications", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save settings");

            toast.success("Notification settings saved");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-lg">
                <FormField
                    control={form.control}
                    name="sms_enabled"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">SMS Alerts</FormLabel>
                                <FormDescription>
                                    Receive text messages for urgent reviews.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {form.watch("sms_enabled") && (
                    <div className="space-y-4 border-l-2 border-slate-100 pl-4 animate-in slide-in-from-top-2">
                        <FormField
                            control={form.control}
                            name="phone_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1234567890" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Include country code (e.g., +1 for US).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="min_urgency_score"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Minimum Urgency Score</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select score" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {[5, 6, 7, 8, 9, 10].map(score => (
                                                <SelectItem key={score} value={score.toString()}>
                                                    {score} {score >= 9 ? "(Critical only)" : score >= 7 ? "(Urgent)" : "(Moderate)"}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Only alert for reviews with this urgency score or higher.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quiet_hours_start"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quiet Hours Start</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="quiet_hours_end"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quiet Hours End</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormDescription>
                            SMS alerts will be paused during these hours.
                        </FormDescription>
                    </div>
                )}

                <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
            </form>
        </Form>
    );
}
