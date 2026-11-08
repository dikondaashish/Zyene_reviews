import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, AlertCircle, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Confirm your email",
    robots: { index: false, follow: false },
};

export default async function NewsletterConfirmPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; error?: string; token?: string }>;
}) {
    const params = await searchParams;
    const success = params.success === "1";
    const error = params.error;
    const canConfirm = Boolean(params.token) && !success && !error;

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-24">
            <div className="max-w-md w-full bg-card border border-border rounded-2xl p-10 text-center">
                {success ? (
                    <>
                        <CheckCircle2 aria-hidden="true" className="text-primary mx-auto mb-4 size-12" />
                        <h1 className="text-2xl font-bold text-foreground mb-2">You&apos;re confirmed</h1>
                        <p className="text-muted-foreground mb-6">
                            Thanks. What you asked for is on its way to your inbox.
                        </p>
                    </>
                ) : canConfirm ? (
                    <>
                        <MailCheck aria-hidden="true" className="text-primary mx-auto mb-4 size-12" />
                        <h1 className="text-2xl font-bold text-foreground mb-2">Confirm your email</h1>
                        <p className="text-muted-foreground mb-6">
                            Press the button to confirm it was you who signed up. If it wasn&apos;t, just close this page.
                        </p>
                        <form action="/api/marketing/newsletter/confirm" method="post" className="mb-3">
                            <input type="hidden" name="token" value={params.token} />
                            <Button type="submit" className="w-full">Confirm my email</Button>
                        </form>
                    </>
                ) : (
                    <>
                        <AlertCircle aria-hidden="true" className="text-muted-foreground mx-auto mb-4 size-12" />
                        <h1 className="text-2xl font-bold text-foreground mb-2">Confirm your email</h1>
                        <p className="text-muted-foreground mb-6">
                            {error === "server"
                                ? "Something went wrong. Please try the link in your email again in a few minutes."
                                : "This confirmation link is invalid or has expired. Sign up again on our site to get a new one."}
                        </p>
                    </>
                )}
                <Button variant="outline" asChild>
                    <Link href="/">Back to Zyene Reviews</Link>
                </Button>
            </div>
        </div>
    );
}
