import { z } from "zod";

export const step1FormSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessCategory: z.string().min(1, "Please select a category"),
  city: z.string().min(2, "City is required"),
  phone: z.string().optional().refine(
    (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
    "Phone number format is invalid"
  ),
});

export type Step1FormData = z.infer<typeof step1FormSchema>;

export const step3FormSchema = z.object({
  emailAlerts: z.boolean(),
  emailFrequency: z.enum(["immediately", "daily_digest", "weekly_summary"]),
  smsAlerts: z.boolean(),
  smsPhoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-\(\)]{5,}$/.test(val),
      "Please enter a valid phone number"
    ),
  minRatingThreshold: z.enum(["1", "2", "3"]),
});

export type Step3FormData = z.infer<typeof step3FormSchema>;

export const step4FormSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientEmail: z.string().email("Please enter a valid email address"),
  recipientPhone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-\(\)]{5,}$/.test(val),
      "Please enter a valid phone number"
    ),
  channel: z.enum(["email", "sms", "both"]),
});

export type Step4FormData = z.infer<typeof step4FormSchema>;

