import { z } from "zod";
import { INVITE_ROLE_VALUES } from "@/lib/team/business-team";

const inviteRoleSchema = z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.enum(INVITE_ROLE_VALUES as unknown as [string, ...string[]])
);

export const teamInviteSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Enter a valid email address")
        .max(255)
        .transform((e) => e.toLowerCase()),
    role: inviteRoleSchema,
});
