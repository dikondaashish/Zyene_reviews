import * as z from "zod";

export const businessFormSchema = z.object({
    name: z.string().min(2, { message: "Business name must be at least 2 characters." }),
    sender_name: z
        .string()
        .max(80, { message: "Sender name must be 80 characters or fewer." })
        .optional()
        .or(z.literal("")),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    address_line1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    timezone: z.string().optional(),
    category: z.string().optional(),
});

export type BusinessFormValues = z.infer<typeof businessFormSchema>;
