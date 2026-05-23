"use client";

import * as React from "react";
import { toast } from "sonner";
import type { CustomerRow } from "@/components/customers/customer-detail-helpers";
import { displayName, parseFullName } from "@/components/customers/customer-detail-helpers";

export function useCustomerDetailMutations(
    customer: CustomerRow,
    setCustomer: React.Dispatch<React.SetStateAction<CustomerRow>>,
    businessId: string,
    router: { refresh: () => void },
    nameDraft: string,
    setEditingName: (v: boolean) => void
) {
    const saveName = React.useCallback(async () => {
        const committed = displayName(customer);
        const trimmed = nameDraft.trim();
        if (trimmed === committed) {
            setEditingName(false);
            return;
        }
        const { first_name, last_name } = parseFullName(trimmed);
        try {
            const res = await fetch("/api/customers", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: customer.id,
                    businessId,
                    first_name,
                    last_name,
                }),
            });
            const payload = await res.json();
            if (!res.ok || !payload.success) throw new Error(payload.error || "Failed to update");
            setCustomer(payload.data);
            toast.success("Name updated");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Could not save");
        } finally {
            setEditingName(false);
        }
    }, [businessId, customer, nameDraft, setCustomer, setEditingName]);

    const saveTags = React.useCallback(
        async (tags: string[]) => {
            try {
                const res = await fetch("/api/customers", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: customer.id,
                        businessId,
                        tags,
                    }),
                });
                const payload = await res.json();
                if (!res.ok || !payload.success) throw new Error(payload.error || "Failed to update tags");
                setCustomer(payload.data);
                router.refresh();
                toast.success("Tags updated");
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Could not save tags");
            }
        },
        [businessId, customer.id, router, setCustomer]
    );

    return { saveName, saveTags };
}
