"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { UpgradeModal } from "@/components/settings/upgrade-modal";
import type { SendRequestDialogProps } from "./send-request-dialog-schema";
import { SendRequestDialogForm } from "./send-request-dialog-form";
import { useSendRequestDialog } from "./use-send-request-dialog";

export function SendRequestDialog({
    businessId,
    initialCustomer,
    autoOpen,
    trigger,
}: SendRequestDialogProps) {
    const {
        form,
        open,
        setOpen,
        isLoading,
        suggestions,
        suggestLoading,
        suggestOpen,
        showUpgradeModal,
        setShowUpgradeModal,
        nameWrapRef,
        channel,
        scheduleEnabled,
        applyCustomerPick,
        onSubmit,
    } = useSendRequestDialog({ businessId, initialCustomer, autoOpen });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button className="w-full sm:w-auto">
                        <Send className="shrink-0 md:mr-2 size-4" />
                        <span className="md:hidden">Send request</span>
                        <span className="hidden md:inline">Send Review Request</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[min(90dvh,720px)] overflow-y-auto sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Send Review Request</DialogTitle>
                    <DialogDescription>Send via SMS or Email.</DialogDescription>
                </DialogHeader>
                <SendRequestDialogForm
                    form={form}
                    onSubmit={onSubmit}
                    channel={channel}
                    scheduleEnabled={scheduleEnabled}
                    isLoading={isLoading}
                    nameWrapRef={nameWrapRef}
                    suggestions={suggestions}
                    suggestLoading={suggestLoading}
                    suggestOpen={suggestOpen}
                    applyCustomerPick={applyCustomerPick}
                />
            </DialogContent>
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                context="review_request_limit"
            />
        </Dialog>
    );
}
