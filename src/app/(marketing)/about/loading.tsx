export default function Loading() {
  return (
    <div className="p-4 md:p-8 space-y-4 animate-pulse">
      <div className="h-8 w-64 rounded bg-muted" />
      <div className="h-4 w-96 max-w-full rounded bg-muted/70" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="h-36 rounded-xl border border-border bg-card/60" />
        <div className="h-36 rounded-xl border border-border bg-card/60" />
        <div className="h-36 rounded-xl border border-border bg-card/60" />
      </div>
      <div className="h-72 rounded-xl border border-border bg-card/60" />
    </div>
  );
}
