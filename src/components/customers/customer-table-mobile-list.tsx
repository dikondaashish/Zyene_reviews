"use client";

import type { useRouter } from "next/navigation";
import type { Table } from "@tanstack/react-table";
import { CustomerTableMobileCard } from "@/components/customers/customer-table-mobile-card";
import type { Customer } from "@/components/customers/customer-table-types";

export function CustomerTableMobileList({
    table,
    router,
    showVisitsSpend,
    saveTags,
    setEditingNameId,
    onSendRequest,
    setDeleteTarget,
    setOptedOut,
    handleRowNavigate,
}: {
    table: Table<Customer>;
    router: ReturnType<typeof useRouter>;
    showVisitsSpend: boolean;
    saveTags: (customer: Customer, tags: string[]) => void | Promise<void>;
    setEditingNameId: (id: string | null) => void;
    onSendRequest?: (customer: Customer) => void;
    setDeleteTarget: (customer: Customer | null) => void;
    setOptedOut: (customer: Customer, value: boolean) => void | Promise<void>;
    handleRowNavigate: (e: React.MouseEvent, customerId: string) => void;
}) {
    return (
        <div className="space-y-3 lg:hidden">
            {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                    <CustomerTableMobileCard
                        key={row.id}
                        row={row}
                        showVisitsSpend={showVisitsSpend}
                        saveTags={saveTags}
                        setEditingNameId={setEditingNameId}
                        onSendRequest={onSendRequest}
                        setDeleteTarget={setDeleteTarget}
                        setOptedOut={setOptedOut}
                        onNavigate={handleRowNavigate}
                        onActivate={(id) => router.push(`/customers/${id}`)}
                    />
                ))
            ) : (
                <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                    No customers found.
                </div>
            )}
        </div>
    );
}
