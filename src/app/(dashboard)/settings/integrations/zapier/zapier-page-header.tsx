import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { siZapier } from "simple-icons";

export function ZapierPageHeader() {
    return (
        <div className="space-y-4">
            <Link
                href="/settings/integrations"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Integrations
            </Link>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-white shadow-sm ring-1 ring-border dark:bg-white">
                        <svg role="img" viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
                            <title>{siZapier.title}</title>
                            <path fill={`#${siZapier.hex}`} d={siZapier.path} />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Zapier</h1>
                        <p className="mt-1 max-w-2xl text-muted-foreground sm:text-base">
                            Connect 5,000+ apps. When a job finishes in your POS or CRM,
                            Zapier sends the customer details to Zyene and we send the
                            review request automatically.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
