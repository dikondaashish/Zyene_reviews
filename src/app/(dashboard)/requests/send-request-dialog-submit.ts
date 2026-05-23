import { toast } from "sonner";
import type { useRouter } from "next/navigation";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "./send-request-dialog-schema";

export async function submitSendRequest(
    values: FormValues,
    businessId: string,
    form: UseFormReturn<FormValues>,
    router: ReturnType<typeof useRouter>,
    setOpen: (open: boolean) => void,
    setShowUpgradeModal: (open: boolean) => void,
    setIsLoading: (loading: boolean) => void,
) {
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
        const limitHit = /monthly limit/i.test(msg) || /upgrade your plan/i.test(msg);
        if (limitHit) {
            setShowUpgradeModal(true);
        }
        toast.error("Could not send request", { description: msg });
    } finally {
        setIsLoading(false);
    }
}
