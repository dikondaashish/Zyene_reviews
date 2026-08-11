import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GbpCompletenessResult } from "@/services/aeo/technical-audit/gbp-completeness";

/** F5.10: Business Profile completeness, computed only from fields this app actually reads from Google. */
export function GbpCompletenessSection({ result }: { result: GbpCompletenessResult }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Business Profile completeness</span>
                    {result.kind === "ok" && (
                        <span className="text-2xl font-bold tabular-nums">{result.score}%</span>
                    )}
                </CardTitle>
                <CardDescription>
                    {result.kind === "ok"
                        ? `${result.presentCount} of ${result.totalCount} fields set — what AI systems and searchers can see about you.`
                        : "Fields we can confirm today; categories, attributes, and photos aren't checked yet."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {result.kind === "unable_to_verify" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="size-4 shrink-0" />
                        {result.reason}
                    </div>
                )}
                {result.kind === "ok" && (
                    <ul className="space-y-3">
                        {result.fields.map((field) => (
                            <li key={field.field} className="flex items-start gap-2.5">
                                {field.status === "present" ? (
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-chart-2" />
                                ) : (
                                    <XCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                )}
                                <div className="min-w-0">
                                    <p className="text-sm font-medium">
                                        {field.label}
                                        {field.status === "present" && field.value ? (
                                            <span className="ml-2 font-normal text-muted-foreground">
                                                {field.value}
                                            </span>
                                        ) : null}
                                    </p>
                                    {field.status !== "present" && (
                                        <p className="text-xs text-muted-foreground">
                                            {field.whyItMatters} {field.recommendation}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
