"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { GoogleListingForm } from "./google-listing-editor-types";

export function GoogleListingEditorForm({
    form,
    onFormChange,
    saving,
    loading,
    onSubmit,
    onReload,
}: {
    form: GoogleListingForm;
    onFormChange: (updater: (prev: GoogleListingForm) => GoogleListingForm) => void;
    saving: boolean;
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onReload: () => void;
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
            <div className="space-y-2">
                <Label htmlFor="gbp-title">Business title (Google)</Label>
                <Input
                    id="gbp-title"
                    value={form.title}
                    onChange={(e) => onFormChange((f) => ({ ...f, title: e.target.value }))}
                    autoComplete="off"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="gbp-website">Website</Label>
                <Input
                    id="gbp-website"
                    type="url"
                    placeholder="https://"
                    value={form.websiteUri}
                    onChange={(e) => onFormChange((f) => ({ ...f, websiteUri: e.target.value }))}
                    autoComplete="off"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="gbp-phone">Primary phone</Label>
                <Input
                    id="gbp-phone"
                    type="tel"
                    value={form.primaryPhone}
                    onChange={(e) => onFormChange((f) => ({ ...f, primaryPhone: e.target.value }))}
                    autoComplete="off"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="gbp-desc">Description</Label>
                <Textarea
                    id="gbp-desc"
                    rows={5}
                    value={form.description}
                    onChange={(e) => onFormChange((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe your business for Google Search and Maps."
                    className="resize-y"
                />
            </div>
            <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving…
                        </>
                    ) : (
                        "Save to Google"
                    )}
                </Button>
                <Button type="button" variant="outline" onClick={onReload} disabled={saving || loading}>
                    Reload from Google
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">
                Updates are sent to Google immediately. Hours and categories must still be edited in Google
                Business Profile if you need full control.
            </p>
        </form>
    );
}
