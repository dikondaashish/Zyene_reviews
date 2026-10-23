import Link from "next/link";
import { CircleAlert, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Tells the owner where customer replies to campaign emails will land, or that they won't land anywhere yet. */
export function CampaignReplyEmailNote({ replyEmail }: { replyEmail: string | null | undefined }) {
    if (replyEmail) {
        return (
            <p className="flex items-start gap-2 rounded-lg border p-3 text-sm text-muted-foreground">
                <Reply className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>If a customer replies to the email, it goes to <strong className="font-medium text-foreground">{replyEmail}</strong>.</span>
            </p>
        );
    }
    return (
        <div className="flex flex-col gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm text-warning-foreground">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                    Customer replies won&apos;t reach you yet. Add a support email for this business and replies to these
                    emails will go straight to that inbox.
                </span>
            </p>
            <Button asChild size="sm" variant="outline" className="shrink-0 self-start bg-card sm:self-auto">
                <Link href="/settings/business-information">Add support email</Link>
            </Button>
        </div>
    );
}
