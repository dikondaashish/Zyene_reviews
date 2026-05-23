import {
    FileText,
    Loader2,
    Plus,
    Send,
    Upload,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CampaignDetailAddContactsForm } from "./campaign-detail-add-contacts-form";
import type { Campaign } from "./campaign-detail-types";
import type { CampaignDetailState } from "./use-campaign-detail";

interface CampaignDetailAddContactsDialogProps {
    campaign: Campaign;
    detail: CampaignDetailState;
}

export function CampaignDetailAddContactsDialog({
    campaign,
    detail,
}: CampaignDetailAddContactsDialogProps) {
    const {
        dialogOpen,
        setDialogOpen,
        setCsvDialogOpen,
        addMode,
        setAddMode,
        sending,
        sendToContacts,
    } = detail;

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 size-4" />
                    Add Contacts
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Contacts</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2 mb-4">
                    <Button
                        variant={addMode === "single" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAddMode("single")}
                    >
                        <Users className="mr-2 size-4" />
                        Single
                    </Button>
                    <Button
                        variant={addMode === "bulk" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAddMode("bulk")}
                    >
                        <Upload className="mr-2 size-4" />
                        Bulk
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setDialogOpen(false);
                            setCsvDialogOpen(true);
                        }}
                    >
                        <FileText className="mr-2 size-4" />
                        CSV
                    </Button>
                </div>

                <CampaignDetailAddContactsForm campaign={campaign} detail={detail} />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={sendToContacts} disabled={sending}>
                        {sending ? (
                            <><Loader2 className="mr-2 animate-spin size-4" />Sending...</>
                        ) : (
                            <><Send className="mr-2 size-4" />Send Now</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
