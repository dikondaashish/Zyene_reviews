"use client";

import { useState } from "react";
import { toast } from "sonner";

import { getAppBaseUrl } from "@/config/env";

export function useDeveloperApiCard(businessId: string, initialKey?: string | null) {
    const [apiKey, setApiKey] = useState(initialKey || null);
    const [copied, setCopied] = useState(false);
    const [baseCopied, setBaseCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showKey, setShowKey] = useState(false);

    const apiBase = getAppBaseUrl();

    const handleCopy = () => {
        if (!apiKey) return;
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        toast.success("API key copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyBaseUrl = () => {
        navigator.clipboard.writeText(apiBase);
        setBaseCopied(true);
        toast.success("API base URL copied");
        setTimeout(() => setBaseCopied(false), 2000);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/integrations/api-key", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId }),
            });
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setApiKey(data.apiKey);
            toast.success(apiKey ? "API key regenerated" : "API key generated");
        } catch {
            toast.error("Failed to generate API key");
        } finally {
            setIsGenerating(false);
        }
    };

    const maskedKey = apiKey
        ? `zy_${apiKey.slice(3, 7)}${"•".repeat(24)}${apiKey.slice(-4)}`
        : null;

    return {
        apiKey,
        apiBase,
        copied,
        baseCopied,
        isGenerating,
        showKey,
        setShowKey,
        maskedKey,
        handleCopy,
        handleCopyBaseUrl,
        handleGenerate,
    };
}
