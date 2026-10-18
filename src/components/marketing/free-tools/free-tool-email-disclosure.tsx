import Link from "next/link";

/** Consent disclosure shown next to every free-tool email capture. */
export function FreeToolEmailDisclosure({ id }: { id?: string }) {
    return (
        <p id={id} className="text-xs text-muted-foreground">
            We&apos;ll email your copy and occasional review tips. Unsubscribe anytime.{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                Privacy policy
            </Link>
        </p>
    );
}
