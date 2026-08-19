"use client";

import Link from "next/link";
import { BookOpen, RefreshCw, Terminal, Trash2 } from "lucide-react";

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
import { DEVELOPER_API_DOCS_API_PATH, DEVELOPER_API_DOCS_COOKBOOK_PATH } from "./developer-api-card-constants";

function ConfirmAction({
    kind,
    pending,
    onConfirm,
}: {
    kind: "rotate" | "revoke";
    pending: boolean;
    onConfirm: () => void;
}) {
    const rotating = kind === "rotate";
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" disabled={pending} className={rotating ? "text-muted-foreground" : "text-destructive"}>
                    {rotating ? <RefreshCw className="mr-2 size-3.5" /> : <Trash2 className="mr-2 size-3.5" />}
                    {rotating ? "Rotate" : "Revoke"}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{rotating ? "Rotate API key?" : "Revoke API key?"}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {rotating
                            ? "The old key stops working immediately. The replacement is shown only once."
                            : "This key stops working immediately and cannot be restored."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>{rotating ? "Rotate key" : "Revoke key"}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function DeveloperApiCardFooter({
    hasApiKey,
    canManage,
    pending,
    onRotate,
    onRevoke,
}: {
    hasApiKey: boolean;
    canManage: boolean;
    pending: boolean;
    onRotate: () => void;
    onRevoke: () => void;
}) {
    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                {hasApiKey && canManage ? (
                    <>
                        <ConfirmAction kind="rotate" pending={pending} onConfirm={onRotate} />
                        <ConfirmAction kind="revoke" pending={pending} onConfirm={onRevoke} />
                    </>
                ) : null}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:ml-auto">
                <Button variant="outline" size="sm" asChild>
                    <Link href={DEVELOPER_API_DOCS_COOKBOOK_PATH}><Terminal className="mr-2 size-3.5" />Cookbook</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                    <Link href={DEVELOPER_API_DOCS_API_PATH}><BookOpen className="mr-2 size-3.5" />Documentation</Link>
                </Button>
            </div>
        </>
    );
}
