"use client";

import { Button } from "@/components/ui/button";
import { 
    Trash2, 
    Send, 
    Tag as TagIcon, 
    X,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BulkActionBarProps {
    selectedCount: number;
    onClear: () => void;
    onDelete: () => void;
    onSendRequests: () => void;
    onAddTag: () => void;
}

export function BulkActionBar({ selectedCount, onClear, onDelete, onSendRequests, onAddTag }: BulkActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-2xl px-4"
            >
                <div className="bg-foreground text-background rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto border border-border backdrop-blur-xl">
                    <div className="flex items-center gap-3 pl-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground ring-4 ring-primary/20">
                            <span className="text-xs font-bold leading-none">{selectedCount}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight">Customers selected</span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Ready for bulk action</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={onSendRequests}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-10 px-4 transition-all hover:scale-105 active:scale-95 border-none"
                        >
                            <Send className="mr-2 h-3.5 w-3.5" />
                            Send Requests
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={onAddTag}
                            className="bg-foreground/80 hover:bg-foreground/70 text-background rounded-2xl h-10 px-4 transition-all"
                        >
                            <TagIcon className="mr-2 h-3.5 w-3.5" />
                            Add Tag
                        </Button>
                        <div className="w-px h-6 bg-border mx-1" />
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={onDelete}
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-2xl h-10 px-4 transition-all"
                        >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={onClear}
                            className="text-muted-foreground hover:text-background rounded-full h-10 w-10 p-0 transition-all ml-1"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
