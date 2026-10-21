import type { Metadata } from "next";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveUnsubscribeTarget } from "@/services/review-requests/email-unsubscribe";

export const metadata: Metadata = {
    title: "Unsubscribe from review requests",
    robots: { index: false, follow: false },
};

export default async function ReviewRequestUnsubscribePage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; error?: string; ref?: string; sig?: string }>;
}) {
    const params = await searchParams;
    const success = params.success === "1";
    const target = success || params.error ? null : await resolveUnsubscribeTarget(params.ref, params.sig);

    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-4 py-24">
            <div className="max-w-md w-full bg-card border border-border rounded-2xl p-10 text-center">
                {success ? (
                    <>
                        <CheckCircle2 className="text-primary mx-auto mb-4 size-12" />
                        <h1 className="text-2xl font-bold text-foreground mb-2">You&apos;re unsubscribed</h1>
                        <p className="text-muted-foreground">
                            You won&apos;t receive any more review request emails from this business.
                        </p>
                    </>
                ) : target ? (
                    <>
                        <AlertCircle className="text-muted-foreground mx-auto mb-4 size-12" />
                        <h1 className="text-2xl font-bold text-foreground mb-2">Stop review request emails?</h1>
                        <p className="text-muted-foreground mb-6">
                            You&apos;ll stop getting emails from {target.businessName} asking for a review.
                            Text messages are separate: reply STOP to any text to stop those.
                        </p>
                        <form action="/api/review-requests/unsubscribe" method="post">
                            <input type="hidden" name="ref" value={params.ref} />
                            <input type="hidden" name="sig" value={params.sig} />
                            <Button type="submit" className="w-full">Unsubscribe</Button>
                        </form>
                    </>
                ) : (
                    <>
                        <AlertCircle className="text-muted-foreground mx-auto mb-4 size-12" />
                        <h1 className="text-2xl font-bold text-foreground mb-2">Link not valid</h1>
                        <p className="text-muted-foreground">
                            This unsubscribe link is invalid or has expired. Use the link at the bottom of the email you received.
                        </p>
                    </>
                )}
            </div>
        </main>
    );
}
