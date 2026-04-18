"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
    Plus, 
    Upload, 
    RefreshCcw,
    Users,
    UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CustomerTable, Customer } from "@/components/customers/customer-table";
import { CustomerFilters, CustomerSegment } from "@/components/customers/customer-filters";
import { BulkActionBar } from "@/components/customers/bulk-action-bar";
import { AddCustomerModal } from "@/components/customers/add-customer-modal";
import { CSVImportModal } from "@/components/customers/csv-import-modal";
import confetti from "canvas-confetti";

interface CustomerManagementProps {
    businessId: string;
    initialCustomers: Customer[];
}

type BulkActionPayload = {
    tags?: string[];
    mode?: "add" | "remove";
};

export function CustomerManagement({ businessId, initialCustomers }: CustomerManagementProps) {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    // Filter State
    const [search, setSearch] = useState("");
    const [segment, setSegment] = useState<CustomerSegment>("all");
    const [tags, setTags] = useState<string[]>([]);
    
    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const fetchCustomers = useCallback(async () => {
        if (!businessId) return;
        
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                businessId: businessId,
                search: search,
                segment: segment,
                tags: tags.join(","),
            });

            const response = await fetch(`/api/customers?${queryParams}`);
            const data = await response.json();
            
            if (data.error) throw new Error(data.error);
            setCustomers(data.customers || []);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error("Failed to fetch customers: " + message);
        } finally {
            setIsLoading(false);
        }
    }, [businessId, search, segment, tags]);

    // Only fetch if filters change (initial load is from props)
    useEffect(() => {
        if (search || segment !== "all" || tags.length > 0) {
            fetchCustomers();
        } else {
            setCustomers(initialCustomers);
        }
    }, [search, segment, tags, initialCustomers, fetchCustomers]);

    const handleBulkAction = async (action: "delete" | "tag" | "request", data?: BulkActionPayload) => {
        if (!businessId || selectedIds.length === 0) return;

        const promise = fetch("/api/customers/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ids: selectedIds,
                businessId: businessId,
                action,
                data
            })
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
            error: "Failed to perform bulk action"
        });
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch("/api/customers", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, businessId })
            });
            if (!response.ok) throw new Error("Failed to delete");
            toast.success("Customer deleted");
            fetchCustomers();
        } catch (error) {
            toast.error("Failed to delete customer");
        }
    };

    const availableTags = useMemo(
        () => Array.from(new Set(customers.flatMap((c) => c.tags || []))).slice(0, 10),
        [customers]
    );

    const customerStats = useMemo(
        () => ({
            totalCustomers: customers.length,
            totalRequests: customers.reduce((acc, curr) => acc + (curr.total_requests_sent || 0), 0),
            loyalCustomers: customers.filter((c) => (c.visit_count || 0) >= 2).length,
        }),
        [customers]
    );

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header Area */}
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
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add Customer
                    </Button>
                </div>
            </div>

            {/* Quick Stats / Overview Banner */}
            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                        <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Total Customers</p>
                        <h3 className="text-xl font-semibold text-foreground">{customerStats.totalCustomers}</h3>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                        <RefreshCcw className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Requests Total</p>
                        <h3 className="text-xl font-semibold text-foreground">
                            {customerStats.totalRequests}
                        </h3>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                        <Users className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Loyal Customers</p>
                        <h3 className="text-xl font-semibold text-foreground">
                            {customerStats.loyalCustomers}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <CustomerFilters 
                availableTags={availableTags}
                onSearchChange={setSearch}
                onSegmentChange={setSegment}
                onTagChange={setTags}
            />

            {/* Main Table Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 bg-card rounded-3xl border border-border">
                    <RefreshCcw className="h-10 w-10 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground font-medium">Loading your customers...</p>
                </div>
            ) : (
                <CustomerTable 
                    data={customers} 
                    onDelete={handleDelete}
                    onSelectionChange={setSelectedIds}
                />
            )}

            {/* Modals */}
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

            {/* Bulk Actions */}
            <BulkActionBar 
                selectedCount={selectedIds.length}
                onClear={() => setSelectedIds([])}
                onDelete={() => handleBulkAction("delete")}
                onSendRequests={() => handleBulkAction("request")}
                onAddTag={() => handleBulkAction("tag", { tags: ["VIP"], mode: "add" })}
            />
        </div>
    );
}
