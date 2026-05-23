"use client";

import { RefreshCcw, Upload, UserPlus, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerTable, type Customer } from "@/components/customers/customer-table";

export function CustomerManagementListRegion({
    businessId,
    isLoading,
    listEmpty,
    filteredEmpty,
    databaseEmpty,
    displayedCustomers,
    search,
    tagFilter,
    onClearFilters,
    onShowAllTab,
    onOpenAdd,
    onOpenImport,
    onDelete,
    onCustomerUpdated,
    onSendRequest,
    onSelectionChange,
}: {
    businessId: string;
    isLoading: boolean;
    listEmpty: boolean;
    filteredEmpty: boolean;
    databaseEmpty: boolean;
    displayedCustomers: Customer[];
    search: string;
    tagFilter: string;
    onClearFilters: () => void;
    onShowAllTab: () => void;
    onOpenAdd: () => void;
    onOpenImport: () => void;
    onDelete: (id: string) => void;
    onCustomerUpdated: (c: Customer) => void;
    onSendRequest: (c: Customer) => void;
    onSelectionChange: (ids: string[]) => void;
}) {
    if (isLoading) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-border/80 bg-card shadow-sm">
                <RefreshCcw className="mb-4 animate-spin text-primary size-10" />
                <p className="font-medium text-muted-foreground">Loading your customers...</p>
            </div>
        );
    }
    if (listEmpty) {
        return (
            <Card className="rounded-2xl border-dashed border-border/80 bg-card/80 shadow-sm">
                <CardContent className="flex flex-col items-center gap-4 px-6 py-14 text-center sm:px-10">
                    <div className="flex items-center justify-center rounded-2xl border border-border bg-muted/40 size-14">
                        {filteredEmpty ? (
                            <Search className="text-muted-foreground size-6" />
                        ) : (
                            <Users className="text-muted-foreground size-6" />
                        )}
                    </div>
                    <div className="max-w-md space-y-2">
                        <h2 className="text-lg font-semibold tracking-tight text-foreground">
                            {databaseEmpty ? "No customers yet" : "No contacts in this view"}
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {databaseEmpty
                                ? "Add contacts manually or import a CSV to start sending review requests and tracking engagement."
                                : "Try the “All” tab, adjust your search or tag filter, or pick another segment, your contacts are still in the full list."}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {databaseEmpty ? (
                            <>
                                <Button onClick={onOpenAdd} className="rounded-lg bg-primary px-4 font-semibold">
                                    <UserPlus className="mr-2 size-4" />
                                    Add customer
                                </Button>
                                <Button variant="outline" onClick={onOpenImport} className="rounded-lg border-border">
                                    <Upload className="mr-2 size-4" />
                                    Import CSV
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" className="rounded-lg" onClick={onShowAllTab}>
                                    Show all contacts
                                </Button>
                                {(search || tagFilter) && (
                                    <Button
                                        variant="ghost"
                                        className="rounded-lg text-muted-foreground"
                                        onClick={onClearFilters}
                                    >
                                        Clear search & tag filters
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }
    return (
        <CustomerTable
            data={displayedCustomers}
            businessId={businessId}
            onDelete={onDelete}
            onCustomerUpdated={onCustomerUpdated}
            onSendRequest={onSendRequest}
            onSelectionChange={onSelectionChange}
        />
    );
}
