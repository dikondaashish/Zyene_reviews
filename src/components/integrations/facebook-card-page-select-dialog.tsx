"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { FacebookBrandIcon } from "@/components/integrations/facebook-brand-icon";
import type { FacebookPageOption } from "@/types/components";

export function FacebookCardPageSelectDialog({
    open,
    onOpenChange,
    pages,
    confirmingPage,
    onSelectPage,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    pages: FacebookPageOption[];
    confirmingPage: string | null;
    onSelectPage: (pageId: string) => void | Promise<void>;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Select a Facebook Page</DialogTitle>
                    <DialogDescription>
                        Choose the page you&apos;d like to connect for review monitoring.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {pages.map((page) => (
                        <button
                            key={page.pageId}
                            type="button"
                            className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent text-left transition-colors"
                            onClick={() => void onSelectPage(page.pageId)}
                            disabled={confirmingPage === page.pageId}
                        >
                            <div className="rounded-full bg-primary/15 dark:bg-primary/20 flex items-center justify-center shrink-0 size-10">
                                <FacebookBrandIcon className="shrink-0 size-5" aria-hidden />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{page.pageName}</p>
                                <p className="text-xs text-muted-foreground">{page.category}</p>
                            </div>
                            {confirmingPage === page.pageId ? (
                                <Loader2 className="animate-spin text-muted-foreground size-4" />
                            ) : (
                                <span className="text-xs text-primary font-medium">Select</span>
                            )}
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
