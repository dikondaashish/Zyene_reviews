/** Internal growth dashboard — lighter chrome than full marketing pages. */
export default function GrowthDashboardLayout({ children }: { children: React.ReactNode }) {
    return <div className="min-h-full bg-muted/15 pb-12">{children}</div>;
}
