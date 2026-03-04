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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { addCompetitor } from "@/app/actions/competitor";
import { Database } from "@/lib/supabase/database.types";

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Competitor name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const data = await addCompetitor(businessId, name, googleUrl);
            toast.success("Competitor added successfully");
            onSuccess(data);
            setOpen(false);

            // Reset form
            setName("");
            setGoogleUrl("");
        } catch (error: any) {
            toast.error(error.message || "Failed to add competitor");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    track Competitor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add a Competitor</DialogTitle>
                        <DialogDescription>
                            Enter the details of the competitor you want to track.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name *
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                placeholder="Local Plumber LLC"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="url" className="text-right">
                                Google Maps URL
                            </Label>
                            <Input
                                id="url"
                                value={googleUrl}
                                onChange={(e) => setGoogleUrl(e.target.value)}
                                className="col-span-3"
                                placeholder="https://maps.google.com/..."
                            />
                        </div>
                        <p className="text-xs text-muted-foreground col-span-4 pl-16">
                            Note: We'll start monitoring their rating and review count over time. Automated syncing will be supported in a future update.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Competitor"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
