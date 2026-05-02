"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Send, Tag as TagIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BulkActionBarProps {
    selectedCount: number;
    onClear: () => void;
    onDelete: () => void;
    onSendRequests: () => void;
    onAddTag: () => void;
    /** When true, Send Request is disabled (e.g. all selected are opted out). */
    sendRequestsBlocked?: boolean;
    sendRequestsBlockedReason?: string;
}

export function BulkActionBar({
    selectedCount,
    onClear,
    onDelete,
    onSendRequests,
    onAddTag,
    sendRequestsBlocked,
    sendRequestsBlockedReason,
}: BulkActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-4 rounded-xl border border-border bg-card p-3 shadow-sm"
            >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3 pl-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {selectedCount}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Selected customers</p>
                            <p className="text-[11px] text-muted-foreground">Choose a bulk action below</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {sendRequestsBlocked ? (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-flex">
                                            <Button size="sm" className="rounded-lg" disabled>
                                                <Send className="h-3.5 w-3.5 md:mr-2" />
                                                <span className="md:hidden">Send</span>
                                                <span className="hidden md:inline">Send Request</span>
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="max-w-xs">
                                        {sendRequestsBlockedReason ??
                                            "Selected contacts cannot receive review requests."}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <Button size="sm" onClick={onSendRequests} className="rounded-lg">
                                <Send className="h-3.5 w-3.5 md:mr-2" />
                                <span className="md:hidden">Send</span>
                                <span className="hidden md:inline">Send Request</span>
                            </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={onAddTag} className="rounded-lg">
                            <TagIcon className="h-3.5 w-3.5 md:mr-2" />
                            <span className="md:hidden">Tag</span>
                            <span className="hidden md:inline">Add Tag</span>
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onDelete}
                            className="rounded-lg text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-3.5 w-3.5 md:mr-2" />
                            <span className="md:hidden">Delete</span>
                            <span className="hidden md:inline">Delete Selected</span>
                        </Button>
                        <Button size="sm" variant="ghost" onClick={onClear} className="rounded-lg" aria-label="Clear selection">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
