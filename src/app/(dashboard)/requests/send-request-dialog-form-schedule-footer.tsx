"use client";

import { Loader2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import type { FormValues } from "./send-request-dialog-schema";

type SendRequestDialogFormScheduleFooterProps = {
    form: UseFormReturn<FormValues>;
    scheduleEnabled: boolean;
    isLoading: boolean;
};

export function SendRequestDialogFormScheduleFooter({
    form,
    scheduleEnabled,
    isLoading,
}: SendRequestDialogFormScheduleFooterProps) {
    return (
        <>
            <FormField
                control={form.control}
                name="scheduleEnabled"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <FormLabel>Schedule for later</FormLabel>
                            <p className="text-xs text-muted-foreground">
                                Queues the request for the time you pick.
                            </p>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )}
            />

            {scheduleEnabled && (
                <FormField
                    control={form.control}
                    name="scheduleAt"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Send at</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            <DialogFooter className="gap-2 sm:gap-0">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 animate-spin size-4" />
                            {scheduleEnabled ? "Scheduling…" : "Sending…"}
                        </>
                    ) : scheduleEnabled ? (
                        "Schedule request"
                    ) : (
                        "Send now"
                    )}
                </Button>
            </DialogFooter>
        </>
    );
}
