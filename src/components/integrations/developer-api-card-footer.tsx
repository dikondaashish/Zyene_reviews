"use client";

import Link from "next/link";
import { BookOpen, RefreshCw, Terminal } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import {
    DEVELOPER_API_DOCS_API_PATH,
    DEVELOPER_API_DOCS_COOKBOOK_PATH,
} from "./developer-api-card-constants";

export function DeveloperApiCardFooter({
    hasApiKey,
    onRegenerate,
}: {
    hasApiKey: boolean;
    onRegenerate: () => void;
}) {
    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                {hasApiKey && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                                <RefreshCw className="mr-2 size-3.5" />
                                Regenerate Key
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Regenerate API Key?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will invalidate your current API key. Any applications using it will
                                    stop working until updated with the new key.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onRegenerate}>Regenerate</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:ml-auto">
                <Button variant="outline" size="sm" asChild>
                    <Link href={DEVELOPER_API_DOCS_COOKBOOK_PATH}>
                        <Terminal className="mr-2 size-3.5" />
                        Cookbook
                    </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                    <Link href={DEVELOPER_API_DOCS_API_PATH}>
                        <BookOpen className="mr-2 size-3.5" />
                        Full Documentation
                    </Link>
                </Button>
            </div>
        </>
    );
}
