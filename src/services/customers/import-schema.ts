import { z } from "zod";

export const customersImportSchema = z.object({
    customers: z.array(z.object({
        first_name: z.string().max(100).optional(),
        last_name: z.string().max(100).optional(),
        email: z.string().email().max(255).optional(),
        phone: z.string().max(30).optional(),
    })).min(1, "At least one customer required").max(5000, "Maximum 5000 customers per import"),
    businessId: z.string().uuid().optional(),
});
