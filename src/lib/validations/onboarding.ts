import { z } from "zod";

// ====================
// 4-Step Onboarding Schemas
// ====================

// Step 1: Organization Name
export const stepOrganizationSchema = z.object({
  organizationName: z
    .string()
    .min(1, "Organization name is required")
    .min(3, "Must be at least 3 characters")
    .max(100, "Must be less than 100 characters"),
});

export type StepOrganizationFormData = z.infer<typeof stepOrganizationSchema>;

// Step 2: Business Name + Location
export const stepBusinessLocationSchema = z.object({
  businessName: z
    .string()
    .min(1, "Business name is required")
    .max(100, "Must be less than 100 characters"),
  locationName: z
    .string()
    .min(1, "Location name is required")
    .max(100, "Must be less than 100 characters"),
  address: z
    .string()
    .min(5, "Address is required")
    .max(200, "Must be less than 200 characters"),
  city: z
    .string()
    .min(1, "City is required")
    .max(50, "Must be less than 50 characters"),
  /** Two-letter code (CA, NY) in the US; free text (a province or county) elsewhere, where it can be blank. */
  state: z.string().trim().max(50, "Must be less than 50 characters"),
  /** From the Google pick: the industry Google's place type points to (saved only if it is a real tile). */
  category: z.string().max(40).optional(),
  /** From the Google pick; gives the business its logo. */
  website: z.string().trim().max(300).optional(),
  /** ISO 3166 two-letter country code; missing means the US. */
  country: z.string().regex(/^[A-Z]{2}$/, "Pick a country").optional(),
  phone: z
    .string()
    .regex(/^[\d\-\+\(\)\ ]*$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
}).refine((data) => (data.country ?? "US") !== "US" || /^[A-Za-z]{2}$/.test(data.state), {
  path: ["state"],
  message: "State code required (e.g., CA, NY)",
});

export type StepBusinessLocationFormData = z.infer<typeof stepBusinessLocationSchema>;

// Step 3: Category Selection
export const stepCategorySchema = z.object({
  category: z
    .enum([
      "restaurant",
      "coffee",
      "salon",
      "dental",
      "gym",
      "spa",
      "hotel",
      "retail",
      "automotive",
      "healthcare",
      "other",
    ], { message: "Please select a valid category" })
    .refine((val) => val !== undefined, "Please select a valid category"),
  /** Saved as the business's Support Email: customer replies to review requests go here. */
  supportEmail: z
    .string()
    .trim()
    .max(255)
    // Empty (or only spaces) means "skip"; anything else must be a real address.
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "Enter a valid email address")
    .optional(),
});

export type StepCategoryFormData = z.infer<typeof stepCategorySchema>;

// Step 4: Notifications
export const stepNotificationsSchema = z.object({
  emailAlerts: z.boolean(),
  smsAlerts: z.boolean(),
  phone: z
    .string()
    .regex(/^[\d\-\+\(\)\ ]*$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
});

export type StepNotificationsFormData = z.infer<typeof stepNotificationsSchema>;

// Step 5: Plan Selection
export const stepPlanSchema = z.object({
  plan: z.literal("none"),
});

export type StepPlanFormData = z.infer<typeof stepPlanSchema>;

// ====================
// Legacy Schemas (Keep for backward compatibility)
// ====================

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
