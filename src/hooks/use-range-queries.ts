"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { AnalyticsFullRangePayload } from "@/lib/analytics/build-analytics-range-payload";
import {
  dateRangeKeys,
  type RangeKey,
  rangeToDays,
} from "@/lib/query/date-range-keys";

export type { AnalyticsFullRangePayload };

type AnalyticsRangePayload = {
  totals: {
    views: number;
    calls: number;
    websiteClicks: number;
    directionRequests: number;
  };
  trend: {
    viewsDelta: number;
    callsDelta: number;
    websiteClicksDelta: number;
    directionRequestsDelta: number;
  };
  period: {
    currentStart: string;
    currentEnd: string;
    previousStart: string;
    previousEnd: string;
  };
};

type CompetitorsRangePayload = {
  range: RangeKey;
  competitorCount: number;
  snapshotCount: number;
  eventCount: number;
  insightCount: number;
  alertsCount: number;
};

type CompetitorsFullRangePayload = {
  range: RangeKey;
  rangeLabel: string;
  initialCompetitors: unknown[];
  snapshotRows: unknown[];
  eventRows: unknown[];
  insightRows: unknown[];
  ownBusinessInRange: { avgRating: number | null; reviewCount: number };
  benchmarkRange: unknown;
  ownSearchKeywords: Array<{ keyword: string; impressions: number; monthStart: string }>;
  keywordDiscoverySplit: { discoveryPct: number; directPct: number };
  placesMetaByCompetitorId: Record<string, unknown>;
};

async function fetchAnalyticsRange(
  range: RangeKey
): Promise<AnalyticsRangePayload> {
  const days = rangeToDays(range);
  const response = await fetch(`/api/v1/analytics?days=${days}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch analytics range data");
  }
  return response.json();
}

async function fetchAnalyticsFullRange(
  range: RangeKey,
  platform: string
): Promise<AnalyticsFullRangePayload> {
  const response = await fetch(
    `/api/analytics/range-data?range=${range}&platform=${platform}`,
    { credentials: "include" }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch full analytics range data");
  }
  return response.json();
}

async function fetchCompetitorsRange(
  range: RangeKey
): Promise<CompetitorsRangePayload> {
  const response = await fetch(`/api/competitors/range-meta?range=${range}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch competitors range data");
  }
  return response.json();
}

async function fetchCompetitorsFullRange(
  range: RangeKey
): Promise<CompetitorsFullRangePayload> {
  const response = await fetch(`/api/competitors/range-data?range=${range}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch full competitors range data");
  }
  return response.json();
}

export function useAnalyticsRangeQuery(businessId: string, range: RangeKey) {
  return useQuery({
    queryKey: dateRangeKeys.analytics(businessId, range),
    queryFn: () => fetchAnalyticsRange(range),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAnalyticsFullRangeQuery(
  businessId: string,
  range: RangeKey,
  platform: string,
  initialData?: AnalyticsFullRangePayload
) {
  return useQuery({
    queryKey: ["analytics-full", businessId, range, platform] as const,
    queryFn: () => fetchAnalyticsFullRange(range, platform),
    initialData,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useCompetitorsRangeQuery(businessId: string, range: RangeKey) {
  return useQuery({
    queryKey: dateRangeKeys.competitors(businessId, range),
    queryFn: () => fetchCompetitorsRange(range),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useCompetitorsFullRangeQuery(
  businessId: string,
  range: RangeKey,
  initialData?: CompetitorsFullRangePayload
) {
  return useQuery({
    queryKey: ["competitors-full", businessId, range] as const,
    queryFn: () => fetchCompetitorsFullRange(range),
    initialData,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export const supportedRanges: RangeKey[] = ["7d", "30d", "90d", "12m"];
