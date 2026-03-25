"use client";

import { useState, useEffect, useCallback } from "react";
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
        } catch (error: any) {
            toast.error("Failed to fetch customers: " + error.message);
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

    const handleBulkAction = async (action: "delete" | "tag" | "request", data?: any) => {
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
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ["#3b82f6", "#60a5fa", "#93c5fd"]
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

    const availableTags = Array.from(new Set(customers.flatMap(c => c.tags || []))).slice(0, 10);

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Customers</h1>
                    </div>
                    <p className="text-gray-500 text-lg font-medium">
                        Manage your customer database and trigger review campaigns.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={() => setIsImportModalOpen(true)}
                        className="rounded-2xl border-gray-200 h-11 px-5 font-semibold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                        <Upload className="h-4 w-4" />
                        Import CSV
                    </Button>
                    <Button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-11 px-6 font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <UserPlus className="h-4.5 w-4.5" />
                        Add Customer
                    </Button>
                </div>
            </div>

            {/* Quick Stats / Overview Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Customers</p>
                        <h3 className="text-2xl font-bold text-gray-900">{customers.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center">
                        <RefreshCcw className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Requests Total</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {customers.reduce((acc, curr) => acc + (curr.total_requests_sent || 0), 0)}
                        </h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                        <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Loyal Customers</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {customers.filter(c => (c.visit_count || 0) >= 2).length}
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
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-gray-50 shadow-sm">
                    <RefreshCcw className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-400 font-medium">Loading your customers...</p>
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
