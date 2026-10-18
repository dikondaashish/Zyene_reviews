import { Loader2 } from "lucide-react";

/** Spinner plus a screen-reader label for buttons in a loading state. */
export function FreeToolLoadingLabel({ text = "Loading" }: { text?: string }) {
    return (
        <>
            <Loader2 aria-hidden="true" className="animate-spin size-4" />
            <span className="sr-only">{text}</span>
        </>
    );
}
