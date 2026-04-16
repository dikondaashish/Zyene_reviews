"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Copy,
    Check,
    Code2,
    RefreshCw,
    Loader2,
    Eye,
    EyeOff,
    BookOpen,
    Terminal,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { BASE_URL, getAppBaseUrl } from "@/config/env";

interface DeveloperApiCardProps {
    businessId: string;
    apiKey?: string | null;
}

export function DeveloperApiCard({ businessId, apiKey: initialKey }: DeveloperApiCardProps) {
    const [apiKey, setApiKey] = useState(initialKey || null);
    const [copied, setCopied] = useState(false);
    const [baseCopied, setBaseCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showKey, setShowKey] = useState(false);

    const apiBase = getAppBaseUrl();
    const docsRoot = BASE_URL;
    const docsApiUrl = `${docsRoot}/docs/api`;
    const docsCookbookUrl = `${docsRoot}/docs/cookbook`;

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

    const endpoints = [
        { method: "POST", path: "/api/v1/requests/send", desc: "Send a review request" },
        { method: "GET", path: "/api/v1/reviews", desc: "List reviews" },
        { method: "GET", path: "/api/v1/analytics", desc: "Get analytics data" },
    ];

    return (
        <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-indigo-500 w-full" />
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                            <Code2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-base">Developer API</p>
                            <p className="text-sm text-muted-foreground">
                                Send review requests programmatically
                            </p>
                        </div>
                    </div>
                    {apiKey && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-0 text-xs">
                            Active
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-3">
                {/* API Key */}
                <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        API Key
                    </label>
                    {apiKey ? (
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    value={showKey ? apiKey : (maskedKey || "")}
                                    readOnly
                                    className="font-mono text-xs bg-muted/50 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showKey ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <Button variant="outline" size="icon" className="shrink-0" onClick={handleCopy}>
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full"
                        >
                            {isGenerating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Code2 className="mr-2 h-4 w-4" />
                            )}
                            Generate API Key
                        </Button>
                    )}
                </div>

                {/* Base URL + auth — customers need this for curl / Postman */}
                <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            API base URL
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground"
                            onClick={handleCopyBaseUrl}
                        >
                            {baseCopied ? (
                                <Check className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                                <Copy className="h-3.5 w-3.5" />
                            )}
                            <span className="ml-1.5">Copy</span>
                        </Button>
                    </div>
                    <code className="block break-all rounded-md bg-background/80 px-2 py-1.5 font-mono text-[11px] text-foreground ring-1 ring-border/60">
                        {apiBase}
                    </code>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Send <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">X-API-Key: zy_…</code> or{" "}
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Authorization: Bearer zy_…</code>.
                        Successful JSON looks like{" "}
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">{`{ "success": true, "data": … }`}</code>.
                        Prefer calling the API from your server so the key never ships to browsers.
                    </p>
                </div>

                {/* Endpoints */}
                <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                        Available Endpoints
                    </label>
                    <div className="rounded-lg border divide-y bg-muted/30">
                        {endpoints.map((ep) => (
                            <div key={ep.path} className="flex items-center gap-3 px-3 py-2.5">
                                <Badge
                                    variant="outline"
                                    className={`font-mono text-[10px] shrink-0 ${ep.method === "POST"
                                            ? "text-green-700 border-green-300 dark:text-green-400 dark:border-green-800"
                                            : "text-primary border-primary/30 dark:text-primary dark:border-primary/40"
                                        }`}
                                >
                                    {ep.method}
                                </Badge>
                                <span className="font-mono text-xs text-foreground">{ep.path}</span>
                                <span className="text-xs text-muted-foreground ml-auto hidden sm:block">{ep.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 border-t bg-muted/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    {apiKey && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                    Regenerate Key
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Regenerate API Key?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will invalidate your current API key. Any applications using it
                                        will stop working until updated with the new key.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleGenerate}>
                                        Regenerate
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2 sm:ml-auto">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={docsCookbookUrl} target="_blank" rel="noopener noreferrer">
                            <Terminal className="mr-2 h-3.5 w-3.5" />
                            Cookbook
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={docsApiUrl} target="_blank" rel="noopener noreferrer">
                            <BookOpen className="mr-2 h-3.5 w-3.5" />
                            Full Documentation
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
