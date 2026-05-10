"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Send } from "lucide-react";

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
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type CustomerSearchRow = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
};

function displayCustomerName(c: CustomerSearchRow): string {
    const n = [c.first_name, c.last_name].filter(Boolean).join(" ").trim();
    return n || c.email || c.phone || "Contact";
}

const formSchema = z
    .object({
        customerName: z.string().max(200).optional().or(z.literal("")),
        customerPhone: z.string().max(40).optional().or(z.literal("")),
        customerEmail: z.string().max(255).optional().or(z.literal("")),
        channel: z.enum(["sms", "email", "both"]),
        scheduleEnabled: z.boolean(),
        scheduleAt: z.string().optional().or(z.literal("")),
    })
    .superRefine((data, ctx) => {
        const digits = (data.customerPhone || "").replace(/\D/g, "");
        const em = (data.customerEmail || "").trim();

        if (data.channel === "sms") {
            if (digits.length < 10) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Enter a valid phone number (at least 10 digits) for SMS.",
                    path: ["customerPhone"],
                });
            }
        } else if (data.channel === "email") {
            if (!z.string().email().safeParse(em).success) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Enter a valid email address for Email.",
                    path: ["customerEmail"],
                });
            }
        } else if (data.channel === "both") {
            if (digits.length < 10) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Both requires a valid phone number (at least 10 digits).",
                    path: ["customerPhone"],
                });
            }
            if (!z.string().email().safeParse(em).success) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Both requires a valid email address.",
                    path: ["customerEmail"],
                });
            }
        }
        if (data.scheduleEnabled) {
            const raw = (data.scheduleAt || "").trim();
            if (!raw) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Pick a date and time to schedule.",
                    path: ["scheduleAt"],
                });
                return;
            }
            const t = new Date(raw).getTime();
            if (Number.isNaN(t)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Invalid schedule date.",
                    path: ["scheduleAt"],
                });
                return;
            }
            if (t < Date.now() + 60_000) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Schedule time must be at least one minute from now.",
                    path: ["scheduleAt"],
                });
            }
        }
    });

type FormValues = z.infer<typeof formSchema>;

interface SendRequestDialogProps {
    businessId: string;
    businessSlug?: string;
    businessName?: string;
    initialCustomer?: { name: string; phone: string; email?: string };
    autoOpen?: boolean;
    /** Custom trigger (e.g. customer profile). Omit to use the default “Send Review Request” button. */
    trigger?: ReactNode;
}

export function SendRequestDialog({
    businessId,
    initialCustomer,
    autoOpen,
    trigger,
}: SendRequestDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(autoOpen || false);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<CustomerSearchRow[]>([]);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const [suggestOpen, setSuggestOpen] = useState(false);
    const nameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const nameWrapRef = useRef<HTMLDivElement>(null);

    const initialDigits = (initialCustomer?.phone ?? "").replace(/\D/g, "");
    const initialEmail = (initialCustomer?.email || "").trim();
    const initialEmailValid = z.string().email().safeParse(initialEmail).success;
    const defaultChannel: "sms" | "email" | "both" =
        initialDigits.length >= 10 && initialEmailValid
            ? "both"
            : initialDigits.length >= 10
              ? "sms"
              : initialEmailValid
                ? "email"
                : "sms";

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: {
            customerName: initialCustomer?.name || "",
            customerPhone: initialCustomer?.phone || "",
            customerEmail: initialCustomer?.email || "",
            channel: defaultChannel,
            scheduleEnabled: false,
            scheduleAt: "",
        },
    });

    const watchName = form.watch("customerName");

    useEffect(() => {
        if (!open || !initialCustomer) return;
        const digits = (initialCustomer.phone || "").replace(/\D/g, "").length;
        const em = (initialCustomer.email || "").trim();
        const emailOk = z.string().email().safeParse(em).success;
        const ch: "sms" | "email" | "both" =
            digits >= 10 && emailOk ? "both" : digits >= 10 ? "sms" : emailOk ? "email" : "sms";
        form.reset({
            customerName: initialCustomer.name || "",
            customerPhone: initialCustomer.phone || "",
            customerEmail: initialCustomer.email || "",
            channel: ch,
            scheduleEnabled: false,
            scheduleAt: "",
        });
    }, [open, initialCustomer?.name, initialCustomer?.phone, initialCustomer?.email, form]);

    useEffect(() => {
        const q = (watchName || "").trim();
        if (nameDebounceRef.current) clearTimeout(nameDebounceRef.current);
        if (q.length < 2) {
            setSuggestions([]);
            setSuggestOpen(false);
            return;
        }
        nameDebounceRef.current = setTimeout(async () => {
            setSuggestLoading(true);
            try {
                const res = await fetch(
                    `/api/customers?businessId=${encodeURIComponent(businessId)}&search=${encodeURIComponent(q)}&limit=20`,
                );
                if (!res.ok) {
                    setSuggestions([]);
                    return;
                }
                const json = await res.json();
                const payload = json.data ?? json;
                const list = (payload.customers ?? []) as CustomerSearchRow[];
                setSuggestions(list);
                setSuggestOpen(list.length > 0);
            } catch {
                setSuggestions([]);
            } finally {
                setSuggestLoading(false);
            }
        }, 280);
        return () => {
            if (nameDebounceRef.current) clearTimeout(nameDebounceRef.current);
        };
    }, [watchName, businessId]);

    useEffect(() => {
        if (!suggestOpen) return;
        const onDown = (e: MouseEvent) => {
            if (nameWrapRef.current && !nameWrapRef.current.contains(e.target as Node)) {
                setSuggestOpen(false);
            }
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [suggestOpen]);

    function applyCustomerPick(c: CustomerSearchRow) {
        form.setValue("customerName", displayCustomerName(c));
        if (c.phone?.trim()) form.setValue("customerPhone", c.phone.trim());
        if (c.email?.trim()) form.setValue("customerEmail", c.email.trim());
        const digits = (c.phone || "").replace(/\D/g, "").length;
        const em = (c.email || "").trim();
        const emailOk = z.string().email().safeParse(em).success;
        if (digits >= 10 && emailOk) {
            form.setValue("channel", "both");
        } else if (digits >= 10) {
            form.setValue("channel", "sms");
        } else if (emailOk) {
            form.setValue("channel", "email");
        }
        setSuggestOpen(false);
        setSuggestions([]);
    }

    async function onSubmit(values: FormValues) {
        setIsLoading(true);
        try {
            let phone = (values.customerPhone || "").replace(/\D/g, "");
            if (phone.length === 10) phone = "+1" + phone;
            else if (phone.length > 0 && !phone.startsWith("+")) phone = "+" + phone;

            const email = (values.customerEmail || "").trim();

            const body: Record<string, unknown> = {
                businessId,
                customerName: (values.customerName || "").trim() || undefined,
                channel: values.channel,
            };
            if (values.channel === "sms") {
                body.customerPhone = phone;
            } else if (values.channel === "email") {
                body.customerEmail = email;
                if (phone) body.customerPhone = phone;
            } else {
                body.customerPhone = phone;
                body.customerEmail = email;
            }

            if (values.scheduleEnabled && values.scheduleAt) {
                body.scheduledFor = new Date(values.scheduleAt).toISOString();
            }

            const response = await fetch("/api/requests/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const raw = await response.text();
            if (!response.ok) {
                let msg = raw;
                try {
                    const j = JSON.parse(raw) as { error?: string };
                    if (typeof j.error === "string") msg = j.error;
                } catch {
                    /* keep raw */
                }
                throw new Error(msg);
            }

            let partialNote: string | null = null;
            try {
                const j = JSON.parse(raw) as { data?: { error_message?: string | null } };
                const em = j.data?.error_message;
                if (typeof em === "string" && em.trim()) partialNote = em.trim();
            } catch {
                /* ignore */
            }

            if (values.scheduleEnabled) {
                toast.success("Request scheduled", {
                    description:
                        "It stays queued until your send time, then a background job sends it within a few minutes after that.",
                });
            } else if (partialNote) {
                toast.success("Request sent (one channel failed)", {
                    description: partialNote,
                });
            } else {
                toast.success("Request sent!", {
                    description:
                        values.channel === "both"
                            ? "SMS and email were sent with the same review link."
                            : values.channel === "email"
                              ? "The review request email was sent successfully."
                              : "The SMS review request was sent successfully.",
                });
            }
            setOpen(false);
            form.reset({
                customerName: "",
                customerPhone: "",
                customerEmail: "",
                channel: "sms",
                scheduleEnabled: false,
                scheduleAt: "",
            });
            router.refresh();
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Something went wrong.";
            toast.error("Could not send request", { description: msg });
        } finally {
            setIsLoading(false);
        }
    }

    const channel = form.watch("channel");
    const scheduleEnabled = form.watch("scheduleEnabled");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button className="w-full sm:w-auto">
                        <Send className="h-4 w-4 shrink-0 md:mr-2" />
                        <span className="md:hidden">Send request</span>
                        <span className="hidden md:inline">Send Review Request</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[min(90dvh,720px)] overflow-y-auto sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Send Review Request</DialogTitle>
                    <DialogDescription>Send via SMS or Email.</DialogDescription>
                </DialogHeader>
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
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {scheduleEnabled ? "Scheduling…" : "Sending…"}
                                    </>
                                ) : scheduleEnabled ? (
                                    "Schedule request"
                                ) : (
                                    "Send now"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
