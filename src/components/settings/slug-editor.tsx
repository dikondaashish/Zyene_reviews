
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, AlertTriangle } from "lucide-react";
import { sanitizeSlug } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const slugSchema = z.object({
    slug: z.string()
        .min(3, { message: "Slug must be at least 3 characters." })
        .regex(/^[a-z0-9-]+$/, { message: "Only lowercase letters, numbers, and hyphens." }),
});

type SlugFormValues = z.infer<typeof slugSchema>;

interface SlugEditorProps {
    businessId: string;
    initialSlug: string;
    onSlugChange?: (slug: string) => void;
}

export function SlugEditor({ businessId, initialSlug, onSlugChange }: SlugEditorProps) {
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

    // Debounced check
    useEffect(() => {
        if (!watchedSlug || watchedSlug === initialSlug) {
            setIsAvailable(null);
            return;
        }

        const sanitized = sanitizeSlug(watchedSlug);
        if (sanitized !== watchedSlug) {
            // Basic sanitization happens in render input usually, 
            // but we can let user type and validate via schema too.
            // Schema ensures regex.
        }

        if (watchedSlug.length < 3) return;

        const timer = setTimeout(async () => {
            setIsChecking(true);
            try {
                const res = await fetch(`/api/businesses/check-slug?slug=${watchedSlug}&businessId=${businessId}`);
                const data = await res.json();
                setIsAvailable(data.available);
                if (!data.available) {
                    form.setError("slug", { message: "This link is already taken." });
                } else {
                    form.clearErrors("slug");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [watchedSlug, businessId, initialSlug, form]);

    const onSubmit = (data: SlugFormValues) => {
        if (data.slug === initialSlug) return;
        if (isAvailable === false) return; // Prevent submit if taken

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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: pendingSlug }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to update link");
            }

            toast.success("Link updated successfully!");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
            setPendingSlug(null);
        }
    };

    return (
        <div className="space-y-4 rounded-lg border p-4 bg-muted/10">
            <div>
                <h3 className="text-lg font-medium">Public Link</h3>
                <p className="text-sm text-muted-foreground">
                    Customize your unique review page link.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Link</FormLabel>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                                            zyene.in/
                                        </div>
                                        <Input
                                            placeholder="your-business-name"
                                            {...field}
                                            className="pl-20 pr-10" // Space for prefix and status icon
                                            onChange={(e) => field.onChange(sanitizeSlug(e.target.value))}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                            {!isChecking && isAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                                            {!isChecking && isAvailable === false && <X className="h-4 w-4 text-red-500" />}
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={!form.formState.isValid || isChecking || isAvailable === false || watchedSlug === initialSlug || isSaving}
                                    >
                                        Save
                                    </Button>
                                </div>
                                <FormDescription>
                                    Only lowercase letters, numbers, and hyphens.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>

            <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Warning: Breaking Change
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Changing your link to <strong>zyene.in/{pendingSlug}</strong> will break your current link
                            (<strong>zyene.in/{initialSlug}</strong>).
                            <br /><br />
                            Any existing QR codes or printed materials will stop working immediately. Are you sure you want to continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmSave} className="bg-destructive hover:bg-destructive/90">
                            Yes, Change Link
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
