import { Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EXPORTS = [
    { label: "Prompts & results", href: "/api/aeo/prompts/export" },
    { label: "Citations", href: "/api/aeo/citations/export" },
    { label: "Competitors", href: "/api/competitors/export" },
    { label: "Crawl findings", href: "/api/aeo/crawl-findings/export" },
] as const;

/** F7.2: CSV export, one link per table. Citations and crawl findings have no dedicated browsing page yet, so this is their only export entry point. */
export function DataExportsSection() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Data exports</CardTitle>
                <CardDescription>Download the raw rows behind every metric on this page.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {EXPORTS.map((item) => (
                    <Button key={item.href} variant="outline" size="sm" asChild>
                        <a href={item.href} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 size-4" /> {item.label}
                        </a>
                    </Button>
                ))}
            </CardContent>
        </Card>
    );
}
