import { toast } from "sonner";
import type { FacebookPageOption } from "@/types/components";

export async function fetchFacebookPagesForSelection(): Promise<FacebookPageOption[]> {
    const res = await fetch("/api/integrations/facebook/pages");
    if (!res.ok) throw new Error("Failed to fetch pages");
    const data = await res.json();
    return (data.pages || []) as FacebookPageOption[];
}

export function toastFacebookPagesSessionExpired() {
    toast.error("Session expired. Please connect Facebook again.");
}
