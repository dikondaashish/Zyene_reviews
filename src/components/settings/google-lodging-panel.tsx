"use client";

import { useGoogleLodgingPanel } from "@/components/settings/use-google-lodging-panel";
import {
    GoogleLodgingPanelLoaded,
    GoogleLodgingPanelLoading,
    GoogleLodgingPanelUnavailable,
    GoogleLodgingPanelEmpty,
} from "@/components/settings/google-lodging-panel-loaded";

export function GoogleLodgingPanel({ businessId }: { businessId: string }) {
    const s = useGoogleLodgingPanel(businessId);

    if (s.loading) {
        return <GoogleLodgingPanelLoading />;
    }

    if (s.available === false) {
        return <GoogleLodgingPanelUnavailable />;
    }

    if (!s.lodging) {
        return <GoogleLodgingPanelEmpty />;
    }

    return (
        <GoogleLodgingPanelLoaded
            lodging={s.lodging}
            healthScore={s.healthScore}
            saving={s.saving}
            tabsVersion={s.tabsVersion}
            load={s.load}
            loadGoogleUpdated={s.loadGoogleUpdated}
            patch={s.patch}
            googleDiff={s.googleDiff}
            diffOpen={s.diffOpen}
            setDiffOpen={s.setDiffOpen}
        />
    );
}
