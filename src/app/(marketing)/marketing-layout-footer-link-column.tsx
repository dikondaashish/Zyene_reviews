export function MarketingLayoutFooterLinkColumn({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
                {title}
            </h2>
            <ul className="space-y-2.5 text-sm text-muted-foreground">{children}</ul>
        </div>
    );
}
