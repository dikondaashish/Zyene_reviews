export const REQUIRED_FIELDS = ["first_name", "last_name", "email", "phone"] as const;
export type RequiredField = (typeof REQUIRED_FIELDS)[number];

export const FIELD_LABELS: Record<RequiredField, string> = {
    first_name: "First Name",
    last_name: "Last Name",
    email: "Email Address",
    phone: "Phone Number",
};
