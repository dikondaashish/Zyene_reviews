export function MarketingLayoutFooterLinkColumn({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
                {title}
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">{children}</ul>
        </div>
    );
}
