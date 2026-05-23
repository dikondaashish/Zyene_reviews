import type { BusinessUpdatePayload } from "@/types/components";

export async function patchBrandingBusiness(
    businessId: string,
    updates: BusinessUpdatePayload
): Promise<void> {
    const response = await fetch(`/api/businesses/${businessId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
    });

    const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
    };

    if (!response.ok || data.success !== true) {
        const errorMsg =
            typeof data.error === "string" && data.error.length > 0 ? data.error : "Failed to update";
        throw new Error(errorMsg);
    }
}
