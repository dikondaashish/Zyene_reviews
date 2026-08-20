"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  customerDisplayName,
  type Customer,
} from "@/components/customers/customer-table-types";

function customerLabel(customer: Customer) {
  return customerDisplayName(customer) || customer.email || customer.phone || "Unnamed customer";
}

export function CustomerMergeDialog({
  businessId,
  primary,
  customers,
  onOpenChange,
  onMerged,
}: {
  businessId: string;
  primary: Customer | null;
  customers: Customer[];
  onOpenChange: (open: boolean) => void;
  onMerged: (customer: Customer, removedCustomerId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    if (!primary) {
      setSearch("");
      setSelectedId(null);
    }
  }, [primary]);

  const candidates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers
      .filter((customer) => customer.id !== primary?.id)
      .filter((customer) => {
        if (!query) return true;
        return [customerLabel(customer), customer.email, customer.phone]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query));
      })
      .slice(0, 100);
  }, [customers, primary?.id, search]);

  async function merge() {
    if (!primary || !selectedId) return;
    setIsMerging(true);
    try {
      const response = await fetch("/api/customers/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          primaryCustomerId: primary.id,
          duplicateCustomerId: selectedId,
        }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        data?: { customer?: Customer; removedCustomerId?: string };
      };
      if (!response.ok || !payload.data?.customer || !payload.data.removedCustomerId) {
        throw new Error(payload.error || "Failed to merge customers");
      }
      onMerged(payload.data.customer, payload.data.removedCustomerId);
      toast.success("Customer records merged");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to merge customers");
    } finally {
      setIsMerging(false);
    }
  }

  return (
    <Dialog open={Boolean(primary)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Merge duplicate customer</DialogTitle>
          <DialogDescription>
            Choose the duplicate to merge into {primary ? customerLabel(primary) : "this customer"}.
            This record stays; tags, activity totals, notes, and opt-out status are preserved.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or phone"
              className="pl-9"
            />
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border p-1">
            {candidates.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => setSelectedId(customer.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${selectedId === customer.id ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-muted"}`}
              >
                <span className="block font-medium">{customerLabel(customer)}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {[customer.email, customer.phone].filter(Boolean).join(" · ") || "No contact details"}
                </span>
              </button>
            ))}
            {candidates.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">No matching customers.</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            If both records have different contact details, this primary record&apos;s value is kept.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isMerging}>Cancel</Button>
          <Button onClick={() => void merge()} disabled={!selectedId || isMerging}>
            {isMerging && <Loader2 className="mr-2 animate-spin size-4" />}
            Merge records
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
