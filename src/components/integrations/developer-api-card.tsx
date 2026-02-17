"use client";

import { useState } from "react";
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
    ExternalLink,
    Eye,
    EyeOff,
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

interface DeveloperApiCardProps {
    businessId: string;
    apiKey?: string | null;
}

export function DeveloperApiCard({ businessId, apiKey: initialKey }: DeveloperApiCardProps) {
    const [apiKey, setApiKey] = useState(initialKey || null);
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showKey, setShowKey] = useState(false);

    const handleCopy = () => {
        if (!apiKey) return;
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        toast.success("API key copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/30 border shadow-sm">
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
                                            : "text-blue-700 border-blue-300 dark:text-blue-400 dark:border-blue-800"
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
            <CardFooter className="flex justify-between gap-2 pt-0">
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
                <a href="/docs/api" className="ml-auto">
                    <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        Full Documentation
                    </Button>
                </a>
            </CardFooter>
        </Card>
    );
}
