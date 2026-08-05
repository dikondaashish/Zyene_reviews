import Link from "next/link";
import { Store } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
            <div className="bg-card p-8 rounded-lg border border-border text-center max-w-md w-full">
                <div className="bg-muted rounded-full flex items-center justify-center mx-auto mb-6 size-16">
                    <Store className="text-muted-foreground size-8" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Business Not Found</h2>
                <p className="text-muted-foreground mb-6">
                    We couldn't find the business you're looking for. The link might be incorrect or the business may have been removed.
                </p>
                <div className="text-xs text-muted-foreground border-t border-border pt-4 mt-4">
                    <p>If you are the owner, please check your business slug in the dashboard.</p>
                </div>
                <div className="mt-6">
                    <Link href="/" className="text-primary hover:text-primary/80 hover:underline font-medium">
                        Go to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
