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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NotificationFormFieldHelpTip } from "./notification-form-field-help-tip";
import type { NotificationFormValues } from "./notification-form-schema";

export function NotificationFormSmsDetailsFields({ form }: { form: UseFormReturn<NotificationFormValues> }) {
    return (
        <div className="space-y-4 border-l-2 border-border pl-4 animate-in slide-in-from-top-2">
            <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center gap-2">
                            <FormLabel>Phone number</FormLabel>
                            <NotificationFormFieldHelpTip label="Why we need your phone number">
                                <p>
                                    Used <strong>only</strong> for SMS alerts to you (the business). We do not use
                                    this number for customer review-request messages. Include your country code so
                                    texts can be delivered.
                                </p>
                            </NotificationFormFieldHelpTip>
                        </div>
                        <FormControl>
                            <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormDescription>Include country code (e.g., +1 for US).</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="min_urgency_score"
                render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center gap-2">
                            <FormLabel>Minimum urgency score</FormLabel>
                            <NotificationFormFieldHelpTip label="What urgency score means for SMS">
                                <p>
                                    We text you when a review’s urgency is <strong>at least</strong> this number,
                                    or when it is <strong>1–2 stars</strong> (so you still hear about very unhappy
                                    customers). A <strong>higher</strong> score means <strong>fewer</strong> texts;
                                    a lower score means more texts.
                                </p>
                            </NotificationFormFieldHelpTip>
                        </div>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select score" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {[5, 6, 7, 8, 9, 10].map((score) => (
                                    <SelectItem key={score} value={score.toString()}>
                                        {score}{" "}
                                        {score >= 9
                                            ? "(Critical only)"
                                            : score >= 7
                                              ? "(Urgent)"
                                              : "(Moderate)"}
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

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium leading-none">Quiet hours</span>
                    <NotificationFormFieldHelpTip label="What quiet hours do">
                        <p>
                            During this window we <strong>do not send SMS</strong> alerts. Instant emails and the
                            weekly digest are <strong>not</strong> affected—only texts. If your quiet period
                            crosses midnight, both times are still used correctly.
                        </p>
                    </NotificationFormFieldHelpTip>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="quiet_hours_start"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-muted-foreground">Start</FormLabel>
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
                                <FormLabel className="text-muted-foreground">End</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
            <FormDescription>SMS alerts will be paused during these hours.</FormDescription>
        </div>
    );
}
