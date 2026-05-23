import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/settings/upgrade-modal";

export function ReviewCardModals({
    deleteReplyOpen,
    onDeleteReplyOpenChange,
    isDeletingReply,
    onConfirmDeleteReply,
    showUpgradeModal,
    onCloseUpgradeModal,
    upgradeModalKind,
    activePhoto,
    onActivePhotoOpenChange,
}: {
    deleteReplyOpen: boolean;
    onDeleteReplyOpenChange: (open: boolean) => void;
    isDeletingReply: boolean;
    onConfirmDeleteReply: () => void;
    showUpgradeModal: boolean;
    onCloseUpgradeModal: () => void;
    upgradeModalKind: "limit" | "plan";
    activePhoto: string | null;
    onActivePhotoOpenChange: (open: boolean) => void;
}) {
    return (
        <>
            <AlertDialog open={deleteReplyOpen} onOpenChange={onDeleteReplyOpenChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this reply?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This removes your public reply from Google Business Profile. You can write a new reply
                            afterward.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingReply}>Cancel</AlertDialogCancel>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeletingReply}
                            onClick={() => void onConfirmDeleteReply()}
                        >
                            {isDeletingReply ? "Deleting..." : "Delete reply"}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={onCloseUpgradeModal}
                context={upgradeModalKind === "plan" ? "ai_reply_plan" : "ai_reply_limit"}
            />
            <Dialog open={!!activePhoto} onOpenChange={onActivePhotoOpenChange}>
                <DialogContent className="sm:max-w-4xl p-2">
                    {activePhoto ? (
                        <img
                            src={activePhoto}
                            alt="Review media"
                            className="w-full max-h-[80vh] object-contain rounded-md"
                            referrerPolicy="no-referrer"
                        />
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
}
