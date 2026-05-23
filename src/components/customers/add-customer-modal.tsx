"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { AddCustomerModalFormFields } from "./add-customer-modal-form-fields";
import type { AddCustomerModalProps } from "./add-customer-modal-schema";
import { useAddCustomerModal } from "./use-add-customer-modal";

export function AddCustomerModal({ open, onOpenChange, businessId, onSuccess }: AddCustomerModalProps) {
    const { form, isLoading, onSubmit } = useAddCustomerModal({ onOpenChange, businessId, onSuccess });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogDescription>
                        Add a new customer to your list. You can send them review requests later.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <AddCustomerModalFormFields form={form} isLoading={isLoading} />

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
