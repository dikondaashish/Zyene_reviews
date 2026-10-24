"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStep5Form } from "./use-step5-form";

/** Finishes setup and opens the dashboard; the welcome there does the celebrating. */
export function Step5Form({ businessId, businessName }: { businessId: string; businessName: string }) {
    const { error, retry } = useStep5Form(businessId);

    return (
        <div className="space-y-4 py-6 text-center" role="status">
            <h1 className="ui-page-title text-foreground">{error ? "Almost there" : `Opening ${businessName}…`}</h1>
            {error ? (
                <>
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Button type="button" onClick={retry} className="cta-button h-12 w-full text-sm font-semibold">
                        Try again
                    </Button>
                </>
            ) : (
                <Loader2 className="mx-auto size-6 animate-spin text-primary" aria-hidden />
            )}
        </div>
    );
}
