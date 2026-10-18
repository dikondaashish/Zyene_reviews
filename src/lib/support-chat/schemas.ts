import { z } from "zod";

import {
    BUSINESS_TYPES,
    MAX_ASSISTANT_MESSAGE_CHARS,
    MAX_HISTORY_MESSAGES,
    MAX_USER_MESSAGE_CHARS,
} from "@/lib/support-chat/constants";

const sessionIdSchema = z.string().regex(/^[A-Za-z0-9_-]{8,64}$/, "Invalid session");

const historyMessageSchema = z.discriminatedUnion("role", [
    z.object({ role: z.literal("user"), content: z.string().trim().min(1).max(MAX_USER_MESSAGE_CHARS) }),
    z.object({ role: z.literal("assistant"), content: z.string().trim().min(1).max(MAX_ASSISTANT_MESSAGE_CHARS) }),
]);

export const supportChatRequestSchema = z.object({
    sessionId: sessionIdSchema,
    pagePath: z.string().max(200).optional(),
    messages: z
        .array(historyMessageSchema)
        .min(1)
        // Clients may hold a longer thread; only the tail is accepted.
        .max(40)
        .transform((messages) => messages.slice(-MAX_HISTORY_MESSAGES))
        .refine((messages) => messages.at(-1)?.role === "user", "The last message must be a question"),
});

export type SupportChatRequest = z.infer<typeof supportChatRequestSchema>;

export const supportChatLeadSchema = z.object({
    sessionId: sessionIdSchema,
    name: z.string().trim().min(1, "Please add your name").max(120),
    email: z.string().trim().email("Please add a valid email").max(320),
    phone: z
        .string()
        .trim()
        .max(40)
        .regex(/^[+()\d\s.-]{7,}$/, "Please add a valid phone number"),
    businessType: z.enum(BUSINESS_TYPES, { message: "Please pick a business type" }),
    pagePath: z.string().max(200).optional(),
    reason: z.enum(["question_limit", "human_request"]).default("question_limit"),
    transcript: z
        .array(historyMessageSchema)
        .max(40)
        .default([]),
    /** Honeypot: real visitors never see or fill this field. */
    company: z.string().max(200).optional(),
});

export type SupportChatLead = z.infer<typeof supportChatLeadSchema>;
