"use client";

import { SlugEditorForm } from "./slug-editor-form";
import type { SlugEditorProps } from "./slug-editor-schema";
import { SlugEditorWarningDialog } from "./slug-editor-warning-dialog";
import { useSlugEditor } from "./use-slug-editor";

export function SlugEditor(props: SlugEditorProps) {
    const e = useSlugEditor(props);

    return (
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-foreground">Public Link</h3>
                <p className="text-sm text-muted-foreground mt-1">Customize your unique review page link.</p>
            </div>

            <SlugEditorForm
                form={e.form}
                watchedSlug={e.watchedSlug}
                initialSlug={e.initialSlug}
                isChecking={e.isChecking}
                isAvailable={e.isAvailable}
                isSaving={e.isSaving}
                onSubmit={e.onSubmit}
            />

            <SlugEditorWarningDialog
                open={e.showWarning}
                onOpenChange={e.setShowWarning}
                pendingSlug={e.pendingSlug}
                initialSlug={e.initialSlug}
                onConfirm={e.confirmSave}
            />
        </div>
    );
}
