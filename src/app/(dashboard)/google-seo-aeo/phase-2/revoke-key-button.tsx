"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function RevokeKeyButton({ keyId }: { keyId: string }) {
    const router = useRouter(); const [pending, setPending] = useState(false);
    async function revoke() {
        if (!window.confirm("Revoke this API key immediately? Existing integrations using it will stop working.")) return;
        setPending(true);
        const response = await fetch("/api/integrations/api-key", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keyId }) });
        setPending(false);
        if (!response.ok) { toast.error("Unable to revoke API key"); return; }
        toast.success("API key revoked"); router.refresh();
    }
    return <Button type="button" size="sm" variant="ghost" onClick={revoke} disabled={pending}>{pending ? "Revoking..." : "Revoke"}</Button>;
}
