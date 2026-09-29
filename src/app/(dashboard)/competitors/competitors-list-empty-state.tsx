"use client";

import { Target } from "lucide-react";
import { PageEmptyState } from "@/components/dashboard/page-empty-state";
import { AddCompetitorDialog } from "@/app/(dashboard)/competitors/add-competitor-dialog";
import type { Competitor } from "@/app/(dashboard)/competitors/competitors-types";

export function CompetitorsListEmptyState({ businessId, onAddCompetitor }: {
    businessId: string; onAddCompetitor: (newCompetitor: Competitor) => void;
}) {
    return (
        <PageEmptyState icon={Target} title="Compare your business with the local competition"
            description="Add a nearby business to compare ratings, review volume, and recent growth.">
            <AddCompetitorDialog businessId={businessId} onSuccess={onAddCompetitor} />
        </PageEmptyState>
    );
}
