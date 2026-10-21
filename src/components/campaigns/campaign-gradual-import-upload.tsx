"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { useGradualImport } from "./use-gradual-import";

type ImportState = ReturnType<typeof useGradualImport>;

/** Upload a CSV, preview what will be enrolled, choose the daily limit, confirm, start. */
export function CampaignGradualImportUpload({ state, campaignActive }: { state: ImportState; campaignActive: boolean }) {
    const { fileName, preview, summary } = state;
    const problems = preview.filter((r) => r.status !== "pending").slice(0, 8);
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="gradual-import-file">CSV file</Label>
                <Input id="gradual-import-file" type="file" accept=".csv,text/csv"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) state.parseFile(f); }} />
                <p className="text-xs text-muted-foreground">Columns: name, phone and/or email. Up to 5,000 rows.</p>
            </div>

            {fileName && summary.total > 0 && (
                <div className="space-y-3 rounded-md border p-3">
                    <p className="text-sm">
                        <strong>{summary.valid}</strong> ready to enroll · {summary.duplicate} duplicate · {summary.invalid} can&apos;t be used
                        <span className="text-muted-foreground"> (of {summary.total} rows)</span>
                    </p>
                    {problems.length > 0 && (
                        <ul className="space-y-1 text-xs text-muted-foreground">
                            {problems.map((r) => <li key={r.rowNumber}>Row {r.rowNumber}: {r.reason}</li>)}
                        </ul>
                    )}
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="daily-limit">Contacts per day</Label>
                            <Input id="daily-limit" type="number" min={1} max={500} className="w-28" value={state.dailyLimit}
                                onChange={(e) => state.setDailyLimit(Math.max(1, Math.min(500, Number(e.target.value) || 1)))} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            About {Math.max(1, Math.ceil(summary.valid / state.dailyLimit))} day(s) to enroll everyone. Each contact still goes
                            through opt-out, unsubscribe, frequency-cap and quiet-hours checks before anything is sent.
                        </p>
                    </div>
                    <label className="flex items-start gap-2 text-sm">
                        <Checkbox checked={state.consent} onCheckedChange={(c) => state.setConsent(c === true)} />
                        <span>
                            These are my customers and I&apos;m allowed to contact them about their visit. Importing a list is not proof of
                            consent; people who opted out or unsubscribed will be skipped.
                        </span>
                    </label>
                    {!campaignActive && <p className="text-xs text-warning-foreground">Enrollment starts when this campaign is active.</p>}
                    <div className="flex gap-2">
                        <Button onClick={state.submit} disabled={!state.consent || summary.valid === 0 || state.submitting}>Start gradual import</Button>
                        <Button variant="ghost" onClick={state.reset}>Clear</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
