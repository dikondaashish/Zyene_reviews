"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, AlertCircle, MapPinned, Building2 } from "lucide-react";
import { toast } from "sonner";
import { addCompetitor } from "@/app/actions/competitor";
import { Database } from "@/lib/db/supabase/database.types";

type Competitor = Database["public"]["Tables"]["competitors"]["Row"];

export function AddCompetitorDialog({
    businessId,
    onSuccess
}: {
    businessId: string;
    onSuccess: (competitor: Competitor) => void;
}) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [googleUrl, setGoogleUrl] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear previous field errors
        setFieldErrors({});

        if (!name.trim()) {
            setFieldErrors({ name: "Competitor name is required" });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await addCompetitor(businessId, name, googleUrl);

            if (!result.success) {
                if (result.fieldError) {
                    // Show field-level validation error
                    setFieldErrors({
                        [result.fieldError.field]: result.fieldError.message,
                    });
                } else {
                    // Show general error toast
                    toast.error(result.error || "Couldn't add competitor. Please try again.");
                }
                return;
            }

            // Success
            toast.success("Competitor added successfully");
            onSuccess(result.data);
            setOpen(false);

            // Reset form
            setName("");
            setGoogleUrl("");
            setFieldErrors({});
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Track Competitor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="px-6 pt-6 pb-2">
                        <DialogTitle className="text-3xl tracking-tight">Add a Competitor</DialogTitle>
                        <DialogDescription>
                            Enter the details of the competitor you want to track.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 px-6 py-4">
                        {/* Competitor Name Field */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                Competitor name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (fieldErrors.name) {
                                        setFieldErrors({ ...fieldErrors, name: "" });
                                    }
                                }}
                                placeholder="Local Plumber LLC"
                                required
                                disabled={isSubmitting}
                                className={fieldErrors.name ? "border-red-500 focus-visible:ring-red-500/30" : "h-11"}
                            />
                            {fieldErrors.name && (
                                <div className="flex items-center gap-1 text-sm text-red-600">
                                    <AlertCircle className="h-3 w-3" />
                                    {fieldErrors.name}
                                </div>
                            )}
                        </div>

                        {/* Google Maps URL Field */}
                        <div className="space-y-2">
                            <Label htmlFor="url" className="text-sm font-semibold flex items-center gap-2">
                                <MapPinned className="h-4 w-4 text-muted-foreground" />
                                Google Maps URL
                            </Label>
                            <Input
                                id="url"
                                value={googleUrl}
                                onChange={(e) => {
                                    setGoogleUrl(e.target.value);
                                    if (fieldErrors.googleUrl) {
                                        setFieldErrors({ ...fieldErrors, googleUrl: "" });
                                    }
                                }}
                                placeholder="https://maps.google.com/maps/place/..."
                                disabled={isSubmitting}
                                className={fieldErrors.googleUrl ? "border-red-500 focus-visible:ring-red-500/30" : "h-11"}
                            />
                            {fieldErrors.googleUrl && (
                                <div className="flex items-start gap-1 text-xs text-red-600">
                                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                                    {fieldErrors.googleUrl}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Optional. Add it to help verify competitor profile quickly.
                            </p>
                        </div>

                        <div className="rounded-md border bg-muted/40 px-3 py-2">
                            <p className="text-xs text-muted-foreground">
                            We'll monitor their rating and review count automatically. First sync may take a few minutes.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="px-6 pb-6 pt-2 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setOpen(false);
                                setFieldErrors({});
                            }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="min-w-[170px]">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? "Adding..." : "Add Competitor"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
