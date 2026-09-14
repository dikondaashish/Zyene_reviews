export default function Loading() {
    return (
        <div className="space-y-8 p-4 md:p-8" aria-busy="true" aria-label="Loading Google SEO and AI visibility">
            <div className="h-11 max-w-3xl animate-pulse rounded-lg border bg-muted/50" />
            <div className="space-y-3 animate-pulse border-b border-border pb-5">
                <div className="h-3 w-28 rounded bg-muted" />
                <div className="h-9 w-72 max-w-full rounded bg-muted" />
                <div className="h-4 w-96 max-w-full rounded bg-muted/70" />
            </div>
            <div className="h-44 animate-pulse rounded-xl border border-border bg-card/60" />
            <div className="h-[34rem] animate-pulse rounded-xl border border-border bg-card/60" />
            <div className="h-80 animate-pulse rounded-xl border border-border bg-card/60" />
        </div>
    );
}
