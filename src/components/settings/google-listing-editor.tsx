"use client";

import { GoogleListingEditorForm } from "./google-listing-editor-form";
import { GoogleListingEditorLoading } from "./google-listing-editor-loading";
import { GoogleListingEditorMapsLink } from "./google-listing-editor-maps-link";
import { GoogleListingEditorNotConnected } from "./google-listing-editor-not-connected";
import { GoogleListingEditorProfileHealth } from "./google-listing-editor-profile-health";
import { useGoogleListingEditor } from "./use-google-listing-editor";

export function GoogleListingEditor({ businessId }: { businessId: string }) {
    const e = useGoogleListingEditor(businessId);

    if (e.loading) {
        return <GoogleListingEditorLoading />;
    }

    if (e.notConnected) {
        return <GoogleListingEditorNotConnected />;
    }

    return (
        <div className="space-y-8">
            {e.profileHealth && <GoogleListingEditorProfileHealth profileHealth={e.profileHealth} />}
            {e.meta && <GoogleListingEditorMapsLink meta={e.meta} />}
            <GoogleListingEditorForm
                form={e.form}
                onFormChange={e.setForm}
                saving={e.saving}
                loading={e.loading}
                onSubmit={e.handleSubmit}
                onReload={e.load}
            />
        </div>
    );
}
