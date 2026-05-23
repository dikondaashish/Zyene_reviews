import { z } from "zod";

export const addCustomerSchema = z.object({
    fullName: z.string().min(1, "Full name is required").min(2, "Full name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    phone: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export type AddCustomerFormValues = z.infer<typeof addCustomerSchema>;

export type AddCustomerModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    businessId: string;
    onSuccess?: () => void | Promise<void>;
};
