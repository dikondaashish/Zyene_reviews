import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function GoogleListingEditorNotConnected() {
    return (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-3">
            <div className="mx-auto rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 size-12">
                <CheckCircle2 className="text-primary opacity-50 size-6" />
            </div>
            <div className="space-y-1">
                <h3 className="text-sm font-medium text-foreground">Google not connected</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Connect your Google Business Profile to edit your live listing details directly from this
                    dashboard.
                </p>
            </div>
            <Button variant="outline" className="mt-2 bg-background" asChild>
                <a href="/settings/general">Go to Integrations</a>
            </Button>
        </div>
    );
}
