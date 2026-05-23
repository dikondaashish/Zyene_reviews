import Link from "next/link";
import { SyncButton } from "@/components/dashboard/sync-button";
import { Button } from "@/components/ui/button";

export function QuestionsPageHeader({
    isGoogleConnected,
    isDemo,
}: {
    isGoogleConnected: boolean;
    isDemo: boolean;
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Google Q&A</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Questions from your Google Business Profile. Answers appear publicly on Search and Maps.
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {isGoogleConnected && <SyncButton />}
                {isDemo && (
                    <Button asChild>
                        <Link href="/settings/integrations">Connect Google</Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
