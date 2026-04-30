"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Upload, RefreshCcw, Users, UserPlus, Percent, MessageCircleOff, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CustomerTable, Customer } from "@/components/customers/customer-table";
import { CustomerFilters } from "@/components/customers/customer-filters";
import { CustomerSegmentTabs, type SmartSegmentTab, type SegmentCounts } from "@/components/customers/customer-segment-tabs";
import { BulkActionBar } from "@/components/customers/bulk-action-bar";
import { AddCustomerModal } from "@/components/customers/add-customer-modal";
import { CSVImportModal } from "@/components/customers/csv-import-modal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import confetti from "canvas-confetti";

function csvEscape(value: string): string {
    if (/[",\n\r]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

async function fetchAllCustomersForExport(businessId: string): Promise<Customer[]> {
    const limit = 5000;
    let page = 1;
    const all: Customer[] = [];
    for (;;) {
        const res = await fetch(
            `/api/customers?businessId=${encodeURIComponent(businessId)}&limit=${limit}&page=${page}`
        );
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.error || "Failed to load customers");
        }
        const payload = json.data;
        const batch = (payload.customers ?? []) as Customer[];
        all.push(...batch);
        if (batch.length < limit) break;
        page += 1;
        if (page > 500) break;
    }
    return all;
}

function buildCustomerExportCsv(customers: Customer[]): string {
    const lines: string[] = [];
    lines.push(
        [
            "name",
            "email",
            "phone",
            "tags",
            "visits",
            "spend",
            "requests_sent",
            "last_sent_at",
            "has_reviewed",
        ].join(",")
    );
    for (const c of customers) {
        const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
        const tagStr = (c.tags ?? []).join("; ");
        const visits = String(c.visit_count ?? 0);
        const spend = ((c.total_spend_cents ?? 0) / 100).toFixed(2);
        const reqs = String(c.total_requests_sent ?? 0);
        const last = c.last_request_sent_at ?? "";
        const reviewed = c.has_linked_review ? "true" : "false";
        lines.push(
            [name, c.email ?? "", c.phone ?? "", tagStr, visits, spend, reqs, last, reviewed]
                .map((cell) => csvEscape(String(cell)))
                .join(",")
        );
    }
    return lines.join("\n");
}

interface CustomerManagementProps {
    businessId: string;
    initialCustomers: Customer[];
}

type BulkActionPayload = {
    tags?: string[];
    mode?: "add" | "remove";
};

const emptySegmentCounts: SegmentCounts = {
    all: 0,
    never_reviewed: 0,
    already_reviewed: 0,
    recent: 0,
    no_contact: 0,
    opted_out: 0,
};

export function CustomerManagement({ businessId, initialCustomers }: CustomerManagementProps) {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

    const [search, setSearch] = useState("");
    const [tagFilter, setTagFilter] = useState("");
    const [smartTab, setSmartTab] = useState<SmartSegmentTab>("all");
    const [isExporting, setIsExporting] = useState(false);

    const [stats, setStats] = useState<{
        totalCustomers: number;
        reviewConversionPercent: number;
        neverReviewedCount: number;
        avgRequestsSent: number;
        segmentCounts: SegmentCounts;
    } | null>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const loadStats = useCallback(async () => {
        if (!businessId) return;
        try {
            const res = await fetch(`/api/customers/stats?businessId=${encodeURIComponent(businessId)}`);
            const json = await res.json();
            if (!res.ok || json.success === false) {
                throw new Error(json.error || "Failed to load stats");
            }
            const d = json.data ?? json;
            setStats({
                totalCustomers: d.totalCustomers,
                reviewConversionPercent: d.reviewConversionPercent,
                neverReviewedCount: d.neverReviewedCount,
                avgRequestsSent: d.avgRequestsSent,
                segmentCounts: d.segmentCounts ?? emptySegmentCounts,
            });
        } catch (e) {
            console.error(e);
        }
    }, [businessId]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const fetchCustomers = useCallback(async () => {
        if (!businessId) return;

        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                businessId: businessId,
                search: search,
                limit: "5000",
            });
            if (tagFilter) {
                queryParams.set("tags", tagFilter);
            }

            const response = await fetch(`/api/customers?${queryParams}`);
            const json = await response.json();

            if (!response.ok || json.success === false) {
                throw new Error(json.error || "Request failed");
            }
            const payload = json.data ?? json;
            setCustomers(payload.customers || []);
            await loadStats();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error("Failed to fetch customers: " + message);
        } finally {
            setIsLoading(false);
        }
    }, [businessId, search, tagFilter, loadStats]);

    useEffect(() => {
        if (search || tagFilter) {
            fetchCustomers();
        } else {
            setCustomers(initialCustomers);
        }
    }, [search, tagFilter, initialCustomers, fetchCustomers]);

    const since30 = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d;
    }, []);

    const displayedCustomers = useMemo(() => {
        const list = customers;
        switch (smartTab) {
            case "never_reviewed":
                return list.filter((c) => (c.total_requests_sent ?? 0) > 0 && !c.has_linked_review);
            case "already_reviewed":
                return list.filter((c) => Boolean(c.has_linked_review));
            case "recent":
                return list.filter((c) => {
                    const created = new Date(c.created_at).getTime();
                    const last = c.last_request_sent_at ? new Date(c.last_request_sent_at).getTime() : 0;
                    return created >= since30.getTime() || last >= since30.getTime();
                });
            case "no_contact":
                return list.filter((c) => !(c.email ?? "").trim() && !(c.phone ?? "").trim());
            case "opted_out":
                return list.filter((c) => Boolean(c.is_opted_out));
            default:
                return list;
        }
    }, [customers, smartTab, since30]);

    const handleBulkAction = async (action: "delete" | "tag" | "request", data?: BulkActionPayload) => {
        if (!businessId || selectedIds.length === 0) return;

        const promise = fetch("/api/customers/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ids: selectedIds,
                businessId: businessId,
                action,
                data,
            }),
        });

        toast.promise(promise, {
            loading: `Processing bulk ${action}...`,
            success: (response) => {
                if (action === "request") {
                    const root = document.documentElement;
                    const cs = getComputedStyle(root);
                    const c1 = cs.getPropertyValue("--chart-1").trim() || "var(--primary)";
                    const c2 = cs.getPropertyValue("--chart-2").trim() || "var(--primary)";
                    const c3 = cs.getPropertyValue("--chart-3").trim() || "var(--primary)";
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: [c1, c2, c3],
                    });
                    return "Review requests sent successfully!";
                }
                fetchCustomers();
                setSelectedIds([]);
                return `Bulk ${action} completed!`;
            },
            error: "Failed to perform bulk action",
        });
    };

    const handleCustomerUpdated = (updated: Customer) => {
        setCustomers((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
        loadStats();
    };

    const sendRequestToCustomer = async (customer: Customer) => {
        if (!businessId) return;
        if (customer.is_opted_out) {
            toast.error("This contact opted out of review requests.");
            return;
        }
        if (!customer.phone) {
            toast.error("Add a phone number to send an SMS review request.");
            return;
        }
        try {
            const response = await fetch("/api/customers/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ids: [customer.id],
                    businessId,
                    action: "request",
                }),
            });
            const json = await response.json();
            if (!response.ok) {
                throw new Error(json.error || "Failed to send request");
            }
            toast.success("Review request sent!");
            fetchCustomers();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to send request");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch("/api/customers", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, businessId }),
            });
            if (!response.ok) throw new Error("Failed to delete");
            toast.success("Customer deleted");
            fetchCustomers();
        } catch (error) {
            toast.error("Failed to delete customer");
        }
    };

    const onBulkSendCampaign = () => {
        if (selectedIds.length === 0) return;
        const eligibleIds = displayedCustomers
            .filter((c) => selectedIds.includes(c.id) && !c.is_opted_out)
            .map((c) => c.id);
        if (eligibleIds.length === 0) {
            toast.error("None of the selected contacts can receive requests (opted out).");
            return;
        }
        if (eligibleIds.length < selectedIds.length) {
            toast.message(`Skipping ${selectedIds.length - eligibleIds.length} opted-out contact(s).`);
        }
        const q = encodeURIComponent(eligibleIds.join(","));
        router.push(`/campaigns/new?customerIds=${q}`);
        toast.message("Continue in the campaign builder with your selected customers.");
    };

    const handleExportCsv = async () => {
        if (!businessId) return;
        setIsExporting(true);
        try {
            const all = await fetchAllCustomersForExport(businessId);
            const csv = buildCustomerExportCsv(all);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `customers-export-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`Exported ${all.length} customer(s).`);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Export failed");
        } finally {
            setIsExporting(false);
        }
    };

    const allTagsForFilter = useMemo(() => {
        const set = new Set<string>();
        for (const c of initialCustomers) {
            for (const t of c.tags || []) {
                if (t) set.add(t);
            }
        }
        for (const c of customers) {
            for (const t of c.tags || []) {
                if (t) set.add(t);
            }
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [initialCustomers, customers]);

    const selectedEligibleForSend = useMemo(() => {
        return displayedCustomers.filter((c) => selectedIds.includes(c.id) && !c.is_opted_out).length;
    }, [displayedCustomers, selectedIds]);

    const bulkSendBlocked = selectedIds.length > 0 && selectedEligibleForSend === 0;

    const segmentCountsForTabs = stats?.segmentCounts ?? emptySegmentCounts;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="rounded-lg border border-primary/20 bg-primary/10 p-1.5">
                            <Users className="h-4 w-4 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Customers</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Manage your customer database and trigger review campaigns.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setIsImportModalOpen(true)}
                        className="h-9 rounded-lg border-border px-4 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50"
                    >
                        <Upload className="h-4 w-4" />
                        Import CSV
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => void handleExportCsv()}
                        disabled={isExporting}
                        className="h-9 rounded-lg border-border px-4 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add Customer
                    </Button>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                        <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Total Customers
                        </p>
                        <h3 className="text-xl font-semibold text-foreground">
                            {stats?.totalCustomers ?? "—"}
                        </h3>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-2/10">
                        <Percent className="h-4 w-4 text-chart-2" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Review conversion
                        </p>
                        <h3 className="text-xl font-semibold text-foreground">
                            {stats != null ? `${stats.reviewConversionPercent}%` : "—"}
                        </h3>
                        <p className="text-[10px] text-muted-foreground">Of those who got a request</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-4/10">
                        <MessageCircleOff className="h-4 w-4 text-chart-4" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Never reviewed
                        </p>
                        <h3 className="text-xl font-semibold text-foreground">
                            {stats?.neverReviewedCount ?? "—"}
                        </h3>
                        <p className="text-[10px] text-muted-foreground">Got a request, no review yet</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-4/15">
                        <BarChart3 className="h-4 w-4 text-chart-4" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Avg requests sent
                        </p>
                        <h3 className="text-xl font-semibold text-foreground">
                            {stats != null ? stats.avgRequestsSent : "—"}
                        </h3>
                        <p className="text-[10px] text-muted-foreground">Per customer (all contacts)</p>
                    </div>
                </div>
            </div>

            <CustomerFilters
                allTags={allTagsForFilter}
                tagFilter={tagFilter}
                onTagFilterChange={setTagFilter}
                onSearchChange={setSearch}
            />

            <CustomerSegmentTabs value={smartTab} onChange={setSmartTab} counts={segmentCountsForTabs} />

            {selectedIds.length > 0 && (
                <BulkActionBar
                    selectedCount={selectedIds.length}
                    onClear={() => setSelectedIds([])}
                    onDelete={() => setBulkDeleteOpen(true)}
                    onSendRequests={onBulkSendCampaign}
                    onAddTag={() => handleBulkAction("tag", { tags: ["VIP"], mode: "add" })}
                    sendRequestsBlocked={bulkSendBlocked}
                    sendRequestsBlockedReason="Selected contacts are opted out of review requests."
                />
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 bg-card rounded-3xl border border-border">
                    <RefreshCcw className="h-10 w-10 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground font-medium">Loading your customers...</p>
                </div>
            ) : (
                <CustomerTable
                    data={displayedCustomers}
                    businessId={businessId}
                    onDelete={handleDelete}
                    onCustomerUpdated={handleCustomerUpdated}
                    onSendRequest={sendRequestToCustomer}
                    onSelectionChange={setSelectedIds}
                />
            )}

            <AddCustomerModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onSuccess={fetchCustomers}
                businessId={businessId}
            />
            <CSVImportModal
                open={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
                onSuccess={fetchCustomers}
            />

            <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.length} customer(s)?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove the selected contacts from this business. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                setBulkDeleteOpen(false);
                                void handleBulkAction("delete");
                            }}
                        >
                            Delete Selected
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
