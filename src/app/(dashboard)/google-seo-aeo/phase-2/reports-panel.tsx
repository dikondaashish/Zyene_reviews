import Link from "next/link";
import { FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Phase2OperationsData } from "./phase2-types";
import { createReportSchedule, generateReportNow } from "./report-actions";

export function ReportsPanel({ data }: { data: Phase2OperationsData }) {
    return (
        <section className="space-y-4" aria-labelledby="reports-heading">
            <div><h2 id="reports-heading" className="text-xl font-semibold">Reporting and multi-location rollup</h2><p className="text-sm text-muted-foreground">Branded date-ranged artifacts, scheduled delivery, and one scorecard across the organization.</p></div>
            <div className="grid gap-4 xl:grid-cols-2">
                <Card><CardHeader><CardTitle className="text-base">Reports</CardTitle></CardHeader><CardContent className="space-y-4">
                    <form action={generateReportNow}><Button><FileText className="size-4" />Generate 30-day PDF</Button></form>
                    <form action={createReportSchedule} className="grid gap-2 border-t pt-4 sm:grid-cols-[120px_1fr_auto]"><select name="cadence" className="h-9 rounded-md border bg-background px-3 text-sm"><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select><Input name="recipients" type="text" required placeholder="owner@example.com, agency@example.com" /><Button type="submit"><Send className="size-4" />Schedule</Button></form>
                    {data.reports.length ? <div className="divide-y">{data.reports.map((row) => <div key={row.id} className="flex items-center justify-between gap-3 py-2 text-sm"><span>{row.period}<small className="ml-2 text-muted-foreground">{row.status}</small></span><span className="flex gap-1"><Button asChild size="sm" variant="outline"><Link href={`/api/aeo/reports/${row.id}?format=html`}>HTML</Link></Button><Button asChild size="sm" variant="outline"><Link href={`/api/aeo/reports/${row.id}`}>PDF</Link></Button></span></div>)}</div> : <p className="text-sm text-muted-foreground">No report has been generated.</p>}
                    {data.schedules.map((row) => <p key={row.id} className="text-xs text-muted-foreground">{row.cadence} to {row.recipients.join(", ")} · next {new Date(row.nextSendAt).toLocaleDateString()}</p>)}
                </CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Organization scorecard · 30 days</CardTitle></CardHeader><CardContent>
                    <div className="divide-y">{data.orgRollup.map((row) => <div key={row.id} className="flex justify-between py-2 text-sm"><span>{row.name}</span><span>{row.visibility === null ? "No measured data" : `${Math.round(row.visibility * 100)}% visibility`} · {row.samples} samples</span></div>)}</div>
                </CardContent></Card>
            </div>
        </section>
    );
}
