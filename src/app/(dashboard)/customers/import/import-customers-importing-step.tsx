"use client";

import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ImportingStep() {
    return (
        <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="text-primary animate-spin mb-4 size-12" />
                <h2 className="ui-section-title">Importing Customers...</h2>
                <p className="text-muted-foreground mt-2">
                    Please wait while we process your file. This may take a minute.
                </p>
            </CardContent>
        </Card>
    );
}
