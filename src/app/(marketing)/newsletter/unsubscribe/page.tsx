import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Unsubscribe — Zyene Reviews Monthly",
    robots: { index: false, follow: false },
};

export default async function NewsletterUnsubscribePage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; error?: string; email?: string }>;
}) {
    const params = await searchParams;
    const success = params.success === "1";
    const error = params.error;
    const email = params.email;

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-24">
            <div className="max-w-md w-full bg-card border border-border rounded-2xl p-10 text-center">
                {success ? (
                    <>
                        <CheckCircle2 className="text-primary mx-auto mb-4 size-12" />
                        <h1 className="text-2xl font-bold text-foreground mb-2">You&apos;re unsubscribed</h1>
                        <p className="text-muted-foreground mb-6">
                            {email
                                ? `${email} will no longer receive Zyene Reviews Monthly.`
                                : "You will no longer receive Zyene Reviews Monthly."}
                        </p>
                    </>
                ) : (
                    <>
                        <AlertCircle className="text-muted-foreground mx-auto mb-4 size-12" />
                        <h1 className="text-2xl font-bold text-foreground mb-2">Unsubscribe</h1>
                        <p className="text-muted-foreground mb-6">
                            {error === "missing"
                                ? "This unsubscribe link is invalid. Use the link in your newsletter email."
                                : "Something went wrong. Please try the link in your email again or contact support."}
                        </p>
                    </>
                )}
                <Link href="/">
                    <Button variant="outline">Back to Zyene Reviews</Button>
                </Link>
            </div>
        </div>
    );
}
