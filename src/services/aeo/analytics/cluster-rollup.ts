export type ClusterFact = {
    clusterId: string;
    clusterName: string;
    status: "ok" | "no_answer" | "failed";
    ownNamed: boolean;
    trackedMentions: number;
    ownMentions: number;
};

export type ClusterRollup = {
    clusterId: string;
    clusterName: string;
    observations: number;
    visibilityRate: number | null;
    shareOfVoice: number | null;
    noAnswer: number;
    failed: number;
};

export function computeClusterRollups(facts: readonly ClusterFact[]): ClusterRollup[] {
    const groups = new Map<string, ClusterFact[]>();
    for (const fact of facts) groups.set(fact.clusterId, [...(groups.get(fact.clusterId) ?? []), fact]);
    return [...groups.entries()].map(([clusterId, rows]) => {
        const observations = rows.filter((row) => row.status === "ok");
        const tracked = observations.reduce((sum, row) => sum + row.trackedMentions, 0);
        const own = observations.reduce((sum, row) => sum + row.ownMentions, 0);
        return {
            clusterId,
            clusterName: rows[0]?.clusterName ?? "Unclustered",
            observations: observations.length,
            visibilityRate: observations.length ? observations.filter((row) => row.ownNamed).length / observations.length : null,
            shareOfVoice: tracked ? own / tracked : null,
            noAnswer: rows.filter((row) => row.status === "no_answer").length,
            failed: rows.filter((row) => row.status === "failed").length,
        };
    });
}
