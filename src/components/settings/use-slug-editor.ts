"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { slugSchema, type SlugEditorProps, type SlugFormValues } from "./slug-editor-schema";

export function useSlugEditor({ businessId, initialSlug, onSlugChange }: SlugEditorProps) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [showWarning, setShowWarning] = useState(false);
    const [pendingSlug, setPendingSlug] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<SlugFormValues>({
        resolver: zodResolver(slugSchema),
        mode: "onChange",
        defaultValues: { slug: initialSlug },
    });

    const watchedSlug = form.watch("slug");

    useEffect(() => {
        onSlugChange?.(watchedSlug);
    }, [watchedSlug, onSlugChange]);

    useEffect(() => {
        form.reset({ slug: initialSlug });
    }, [initialSlug, form]);

    useEffect(() => {
        if (!watchedSlug || watchedSlug === initialSlug) {
            setIsAvailable(null);
            return;
        }

        if (watchedSlug.length < 3) {
            setIsAvailable(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsChecking(true);
            try {
                const res = await fetch(
                    `/api/businesses/check-slug?slug=${encodeURIComponent(watchedSlug)}&businessId=${encodeURIComponent(businessId)}`,
                    { credentials: "include" },
                );
                const data = (await res.json().catch(() => ({}))) as {
                    available?: boolean;
                    error?: string;
                };
                if (!res.ok) {
                    setIsAvailable(null);
                    form.setError("slug", {
                        message:
                            typeof data.error === "string" && data.error.length > 0
                                ? data.error
                                : "Could not verify link availability.",
                    });
                    return;
                }
                setIsAvailable(data.available === true);
                if (data.available === false) {
                    form.setError("slug", { message: "This link is already taken." });
                } else if (data.available === true) {
                    form.clearErrors("slug");
                }
            } catch {
                setIsAvailable(null);
            } finally {
                setIsChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [watchedSlug, businessId, initialSlug, form]);

    const onSubmit = (data: SlugFormValues) => {
        if (data.slug === initialSlug) return;
        if (isAvailable === false) return;

        setPendingSlug(data.slug);
        setShowWarning(true);
    };

    const confirmSave = async () => {
        if (!pendingSlug) return;
        setIsSaving(true);
        setShowWarning(false);

        try {
            const response = await fetch(`/api/businesses/${businessId}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: pendingSlug }),
            });

            const json = (await response.json().catch(() => ({}))) as {
                success?: boolean;
                error?: string;
            };

            if (!response.ok || json.success !== true) {
                const msg =
                    typeof json.error === "string" && json.error.length > 0
                        ? json.error
                        : "Failed to update link";
                throw new Error(msg);
            }

            toast.success("Link updated successfully!");
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setIsSaving(false);
            setPendingSlug(null);
        }
    };

    return {
        form,
        watchedSlug,
        initialSlug,
        isChecking,
        isAvailable,
        isSaving,
        showWarning,
        setShowWarning,
        pendingSlug,
        onSubmit,
        confirmSave,
    };
}
