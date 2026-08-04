import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ZapierHelpFooterCard() {
    return (
        <Card className="border-dashed border-border bg-muted/20">
            <CardContent className="flex flex-col items-start justify-between gap-3 py-5 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-semibold">Need a hand?</p>
                    <p className="text-xs text-muted-foreground">
                        Full payload reference, error codes, and curl recipes live in our docs.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href="/docs/cookbook"
                            className="inline-flex items-center gap-1.5"
                        >
                            <BookOpen className="size-3.5" />
                            Open docs
                        </Link>
                    </Button>
                    <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <a
                            href="https://zapier.com/apps/webhook/integrations"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5"
                        >
                            <ExternalLink className="size-3.5" />
                            Open Zapier
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
