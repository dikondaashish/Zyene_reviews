"use client";

import { useState, useEffect, useRef } from "react";
import type { CustomerSearchRow } from "./send-request-dialog-schema";

export function useSendRequestCustomerSearch(businessId: string, watchName: string | undefined) {
    const [suggestions, setSuggestions] = useState<CustomerSearchRow[]>([]);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const [suggestOpen, setSuggestOpen] = useState(false);
    const nameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const nameWrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const q = (watchName || "").trim();
        if (nameDebounceRef.current) clearTimeout(nameDebounceRef.current);
        if (q.length < 2) {
            setSuggestions([]);
            setSuggestOpen(false);
            return;
        }
        nameDebounceRef.current = setTimeout(async () => {
            setSuggestLoading(true);
            try {
                const res = await fetch(
                    `/api/customers?businessId=${encodeURIComponent(businessId)}&search=${encodeURIComponent(q)}&limit=20`,
                );
                if (!res.ok) {
                    setSuggestions([]);
                    return;
                }
                const json = await res.json();
                const payload = json.data ?? json;
                const list = (payload.customers ?? []) as CustomerSearchRow[];
                setSuggestions(list);
                setSuggestOpen(list.length > 0);
            } catch {
                setSuggestions([]);
            } finally {
                setSuggestLoading(false);
            }
        }, 280);
        return () => {
            if (nameDebounceRef.current) clearTimeout(nameDebounceRef.current);
        };
    }, [watchName, businessId]);

    useEffect(() => {
        if (!suggestOpen) return;
        const onDown = (e: MouseEvent) => {
            if (nameWrapRef.current && !nameWrapRef.current.contains(e.target as Node)) {
                setSuggestOpen(false);
            }
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [suggestOpen]);

    return {
        suggestions,
        suggestLoading,
        suggestOpen,
        setSuggestOpen,
        setSuggestions,
        nameWrapRef,
    };
}
