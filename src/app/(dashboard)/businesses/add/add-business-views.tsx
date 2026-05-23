"use client";

import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessLimitUpgradePanel } from "@/components/businesses/business-limit-upgrade-panel";

export function AddBusinessLoadingView() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
    );
}

export function AddBusinessLimitView() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <Link
                    href="/businesses"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Businesses
                </Link>
            </div>
            <BusinessLimitUpgradePanel />
        </div>
    );
}

export function AddBusinessConnectView({ onConnect }: { onConnect: () => void }) {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div>
                <Link
                    href="/businesses"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Businesses
                </Link>
            </div>

            <div className="max-w-lg mx-auto w-full">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                            <Store className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Add a Business</CardTitle>
                        <CardDescription>
                            Connect your Google Business Profile to start managing reviews for a new location.
                            You can use a different Google account than the one you signed up with.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Button size="lg" className="w-full" onClick={onConnect}>
                            Connect Google Business Profile
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            We&apos;ll ask for permission to read your Google Business Profile locations.
                            You can select which location to add after connecting.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
