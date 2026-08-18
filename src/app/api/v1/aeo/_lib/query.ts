import { z } from "zod";

const pageSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export function parsePage(searchParams: URLSearchParams) {
    const parsed = pageSchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) return null;
    const { page, limit } = parsed.data;
    return { page, limit, from: (page - 1) * limit, to: page * limit - 1 };
}
