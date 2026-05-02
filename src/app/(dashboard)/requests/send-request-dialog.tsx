"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, Copy, Download, Loader2, QrCode, Send } from "lucide-react";

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

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

const formSchema = z.object({
    customerName: z.string().optional(),
    customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
    channel: z.enum(["sms", "email"]),
    scheduledFor: z.boolean().default(false),
    // scheduleDate: z.date().optional(), // For future
});

interface SendRequestDialogProps {
    businessId: string;
    businessSlug?: string;
    businessName?: string;
    initialCustomer?: { name: string; phone: string };
    autoOpen?: boolean;
}

export function SendRequestDialog({ businessId, businessSlug, businessName, initialCustomer, autoOpen }: SendRequestDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(autoOpen || false);
    const [isLoading, setIsLoading] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [qrLoading, setQrLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            customerName: initialCustomer?.name || "",
            customerPhone: initialCustomer?.phone || "",
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
            router.refresh();
        } catch (error: unknown) {
            toast.error("Failed to send", {
                description: error instanceof Error ? error.message : "Something went wrong.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol =
        typeof window !== "undefined"
            ? window.location.protocol
            : rootDomain.includes("localhost")
                ? "http:"
                : "https:";

    const reviewLink = businessSlug
        ? `${protocol}//${rootDomain}/${businessSlug}`
        : "";

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(reviewLink);
            setLinkCopied(true);
            toast.success("Link copied!");
            setTimeout(() => setLinkCopied(false), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    const loadQR = async () => {
        if (qrDataUrl) return;
        setQrLoading(true);
        try {
            const res = await fetch(`/api/businesses/${businessId}/qr-code`);
            if (res.ok) {
                const data = await res.json();
                setQrDataUrl(data.qrCodeDataUrl);
            }
        } catch { } finally {
            setQrLoading(false);
        }
    };

    const handleDownloadQR = () => {
        if (!qrDataUrl) return;
        const link = document.createElement("a");
        link.href = qrDataUrl;
        link.download = `${businessSlug}-qr-code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                    <Send className="h-4 w-4 shrink-0 md:mr-2" />
                    <span className="md:hidden">Send request</span>
                    <span className="hidden md:inline">Send Review Request</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[min(90dvh,720px)] overflow-y-auto sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Send Review Request</DialogTitle>
                    <DialogDescription>
                        Send via SMS or share your review link.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="sms">
                    <TabsList variant="line" className="grid w-full grid-cols-2 gap-0 border-b border-border p-0">
                        <TabsTrigger value="sms">Send SMS</TabsTrigger>
                        <TabsTrigger value="link" onClick={loadQR}>QR Code / Link</TabsTrigger>
                    </TabsList>
                    <TabsContent value="sms">
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
                                                <label className={`flex items-center justify-center border rounded-lg p-3 w-1/2 cursor-pointer transition-all ${field.value === 'sms' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-input hover:bg-muted/50'}`}>
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
                                                            <label className={`flex items-center justify-center border rounded-lg p-3 w-1/2 cursor-not-allowed opacity-60 bg-muted/50`}>
                                                                <span className="font-medium text-sm text-muted-foreground">Email</span>
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
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
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
                                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
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
                    </TabsContent>
                    <TabsContent value="link" className="space-y-4 pt-2">
                        {businessSlug ? (
                            <>
                                <div className="flex min-w-0 items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                                    <span className="min-w-0 flex-1 truncate font-mono text-xs bg-muted px-2 py-1 rounded" title={reviewLink}>
                                        {rootDomain}/{businessSlug}
                                    </span>
                                    <button
                                        onClick={handleCopyLink}
                                        className="flex-shrink-0 rounded-md p-2 hover:bg-border transition-colors"
                                    >
                                        {linkCopied ? (
                                            <Check className="h-4 w-4 text-chart-2" />
                                        ) : (
                                            <Copy className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                                <div className="flex justify-center">
                                    {qrLoading ? (
                                        <div className="h-[160px] w-[160px] bg-muted rounded-lg animate-pulse" />
                                    ) : qrDataUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={qrDataUrl}
                                            alt="QR code"
                                            className="h-[160px] w-[160px] rounded-lg"
                                        />
                                    ) : (
                                        <div className="h-[160px] w-[160px] flex items-center justify-center bg-muted/30 rounded-lg border border-dashed">
                                            <QrCode className="h-8 w-8 text-muted-foreground/40" />
                                        </div>
                                    )}
                                </div>
                                {qrDataUrl && (
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1" onClick={handleCopyLink}>
                                            <Copy className="h-3.5 w-3.5 mr-1" /> Copy Link
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1" onClick={handleDownloadQR}>
                                            <Download className="h-3.5 w-3.5 mr-1" /> Download QR
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Set a business slug in Settings to enable link sharing.
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
