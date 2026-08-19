"use client";

import { useState } from "react";
import { toast } from "sonner";

import { getAppBaseUrl } from "@/config/env";
import type { PublicApiKey } from "@/lib/api-keys/credentials";
import { DEVELOPER_API_SCOPES } from "@/lib/api-keys/scopes";

type KeyResponse = { apiKey: string; key: PublicApiKey; error?: string };

export function useDeveloperApiCard(businessId: string, initialKey: PublicApiKey | null) {
    const [apiKey, setApiKey] = useState(initialKey);
    const [newSecret, setNewSecret] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [baseCopied, setBaseCopied] = useState(false);
    const [pending, setPending] = useState(false);
    const apiBase = getAppBaseUrl();

    async function writeKey(method: "POST" | "PATCH") {
        setPending(true);
        try {
            const body = method === "POST"
                ? { businessId, name: "Developer API", scopes: DEVELOPER_API_SCOPES }
                : { keyId: apiKey?.id };
            const response = await fetch("/api/integrations/api-key", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const result = await response.json() as KeyResponse;
            if (!response.ok) throw new Error(result.error || "API key operation failed");
            setApiKey(result.key);
            setNewSecret(result.apiKey);
            toast.success(method === "POST" ? "API key created" : "API key rotated");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "API key operation failed");
        } finally {
            setPending(false);
        }
    }

    async function handleRevoke() {
        if (!apiKey) return;
        setPending(true);
        try {
            const response = await fetch("/api/integrations/api-key", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keyId: apiKey.id }),
            });
            if (!response.ok) throw new Error("Unable to revoke API key");
            setApiKey(null);
            setNewSecret(null);
            toast.success("API key revoked");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to revoke API key");
        } finally {
            setPending(false);
        }
    }

    async function copy(value: string, success: string) {
        await navigator.clipboard.writeText(value);
        toast.success(success);
    }

    return {
        apiKey,
        apiBase,
        newSecret,
        copied,
        baseCopied,
        pending,
        dismissSecret: () => setNewSecret(null),
        handleCreate: () => writeKey("POST"),
        handleRotate: () => writeKey("PATCH"),
        handleRevoke,
        handleCopy: async () => {
            if (!newSecret) return;
            await copy(newSecret, "API key copied");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        },
        handleCopyBaseUrl: async () => {
            await copy(apiBase, "API base URL copied");
            setBaseCopied(true);
            setTimeout(() => setBaseCopied(false), 2000);
        },
    };
}
