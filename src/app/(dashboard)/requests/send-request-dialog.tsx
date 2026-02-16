"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
    customerName: z.string().optional(),
    customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
    channel: z.enum(["sms", "email"]),
    scheduledFor: z.boolean().default(false),
    // scheduleDate: z.date().optional(), // For future
});

interface SendRequestDialogProps {
    businessId: string;
}

export function SendRequestDialog({ businessId }: SendRequestDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            customerName: "",
            customerPhone: "",
            channel: "sms",
            scheduledFor: false,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            // Prepend +1 if missing for US numbers, basic formatting
            let phone = values.customerPhone.replace(/\D/g, "");
            if (phone.length === 10) phone = "+1" + phone;
            else if (!phone.startsWith("+")) phone = "+" + phone;

            const response = await fetch("/api/requests/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessId,
                    customerName: values.customerName,
                    customerPhone: phone,
                    channel: values.channel,
                    // scheduledFor: values.scheduledFor ? values.scheduleDate : undefined 
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            }

            toast.success("Request Sent!", {
                description: "The review request has been sent successfully.",
            });
            setOpen(false);
            form.reset();
            // Refresh data? 
            // In a better implementation, we'd trigger a router.refresh() 
            // but for simplicity we rely on next navigation or manual reload.
            // Actually let's do router.refresh() using useRouter
            window.location.reload(); // Brute force refresh for now to see list
        } catch (error: any) {
            toast.error("Failed to send", {
                description: error.message || "Something went wrong.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Send className="mr-2 h-4 w-4" /> Send Review Request
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Send Review Request</DialogTitle>
                    <DialogDescription>
                        Send a text message invitation to your customer.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="customerName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Customer Name (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="customerPhone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Customer Phone (Required)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="(555) 123-4567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-3">
                            <FormLabel>Channel</FormLabel>
                            <FormField
                                control={form.control}
                                name="channel"
                                render={({ field }) => (
                                    <div className="flex items-center gap-4">
                                        <label className={`flex items-center justify-center border rounded-lg p-3 w-1/2 cursor-pointer transition-all ${field.value === 'sms' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-input hover:bg-slate-50'}`}>
                                            <input
                                                type="radio"
                                                className="sr-only"
                                                {...field}
                                                value="sms"
                                                checked={field.value === 'sms'}
                                            />
                                            <span className="font-medium text-sm">SMS</span>
                                        </label>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <label className={`flex items-center justify-center border rounded-lg p-3 w-1/2 cursor-not-allowed opacity-60 bg-slate-50`}>
                                                        <span className="font-medium text-sm text-slate-500">Email</span>
                                                    </label>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Coming soon</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="scheduledFor"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Schedule for Later</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={true} // Disabled for MVP
                                        />
                                    </FormControl>
                                    {/* Date picker would show here if enabled */}
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Now"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
