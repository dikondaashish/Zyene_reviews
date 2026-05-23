"use client";

import { Cookie } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CookieBannerBar({
    onManage,
    onDecline,
    onAccept,
}: {
    onManage: () => void;
    onDecline: () => void;
    onAccept: () => void;
}) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5 duration-500">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-border rounded-xl bg-card">
                <div className="flex items-start sm:items-center gap-4">
                    <div className="hidden sm:flex p-2 bg-primary/10 rounded-full border border-primary/20">
                        <Cookie className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">We value your privacy</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[500px]">
                            We use cookies to improve security, performance, and product analytics. You can accept all
                            cookies or customize your choices.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 shrink-0 self-end sm:self-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={onManage}
                    >
                        Manage
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={onDecline}
                    >
                        Decline
                    </Button>
                    <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={onAccept}
                    >
                        Accept All
                    </Button>
                </div>
            </div>
        </div>
    );
}
