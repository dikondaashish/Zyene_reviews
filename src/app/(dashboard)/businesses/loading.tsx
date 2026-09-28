export default function Loading() {
    return (
        <div role="status" aria-label="Loading businesses" className="space-y-7 motion-safe:animate-pulse">
            <span className="sr-only">Loading businesses…</span>
            <div aria-hidden="true" className="space-y-3">
                <div className="h-3 w-28 rounded bg-accent" />
                <div className="h-9 w-48 rounded bg-accent" />
                <div className="h-4 w-96 max-w-full rounded bg-accent" />
            </div>
            <div aria-hidden="true" className="space-y-4">
                <div className="h-10 w-64 max-w-full rounded-lg bg-accent" />
                <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
                    <div className="h-10 border-b bg-accent/30" />
                    {[0, 1].map((row) => <div key={row} className="flex gap-4 border-b p-6"><div className="size-12 shrink-0 rounded-xl bg-accent" /><div className="flex-1 space-y-3"><div className="h-5 w-52 max-w-full rounded bg-accent" /><div className="h-3 w-32 rounded bg-accent" /><div className="h-8 w-full rounded bg-accent/50" /></div></div>)}
                </div>
                <div className="h-20 rounded-xl border border-border/60 bg-card" />
            </div>
        </div>
    );
}
