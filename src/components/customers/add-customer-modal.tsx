"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Zod validation schema
const addCustomerSchema = z.object({
    fullName: z.string()
        .min(1, "Full name is required")
        .min(2, "Full name must be at least 2 characters"),
    email: z.string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    phone: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

type AddCustomerFormValues = z.infer<typeof addCustomerSchema>;

interface AddCustomerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    businessId: string;
}

export function AddCustomerModal({ open, onOpenChange, businessId }: AddCustomerModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<AddCustomerFormValues>({
        resolver: zodResolver(addCustomerSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            notes: "",
        },
    });

    const onSubmit = async (values: AddCustomerFormValues) => {
        setIsLoading(true);
        try {
            // Parse full name into first and last name
            const nameParts = values.fullName.trim().split(/\s+/);
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(" ") || null;

            const response = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessId,
                    firstName,
                    lastName,
                    email: values.email,
                    phone: values.phone || null,
                    tags: null,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to add customer");
            }

            toast.success("Customer added successfully");
            onOpenChange(false);
            form.reset();
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to add customer";
            toast.error(message);
            console.error("Error adding customer:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogDescription>
                        Add a new customer to your list. You can send them review requests later.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Full Name */}
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="John Doe"
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="john@example.com"
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Phone */}
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            placeholder="(555) 123-4567"
                                            disabled={isLoading}
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Format: (555) 123-4567 or any format you prefer
                                    </p>
                                </FormItem>
                            )}
                        />

                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any notes about this customer..."
                                            disabled={isLoading}
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? "Adding..." : "Add Customer"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
