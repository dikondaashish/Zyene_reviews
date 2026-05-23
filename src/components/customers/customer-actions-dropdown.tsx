"use client";

import Link from "next/link";
import {
    MoreHorizontal,
    Send,
    Pencil,
    Eye,
    Ban,
    RotateCcw,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Customer } from "@/components/customers/customer-table-types";

export function CustomerActionsDropdown({
    customer,
    onEditName,
    onSendRequest,
    onDelete,
    setOptedOut,
}: {
    customer: Customer;
    onEditName: () => void;
    onSendRequest: () => void;
    onDelete: () => void;
    setOptedOut: (customer: Customer, value: boolean) => void;
}) {
    return (
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 size-8">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={onEditName}>
                        <Pencil className="mr-2 size-4" />
                        Edit name
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/customers/${customer.id}`} className="flex cursor-pointer items-center">
                            <Eye className="mr-2 size-4" />
                            View details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {customer.is_opted_out ? (
                        <DropdownMenuItem onClick={() => setOptedOut(customer, false)}>
                            <RotateCcw className="mr-2 size-4" />
                            Clear opt-out
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem onClick={() => setOptedOut(customer, true)}>
                            <Ban className="mr-2 size-4" />
                            Mark as opted out
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {customer.is_opted_out ? (
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="block w-full cursor-default">
                                        <DropdownMenuItem disabled className="pointer-events-none opacity-60">
                                            <Send className="mr-2 size-4" />
                                            Send Request
                                        </DropdownMenuItem>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-xs">
                                    This contact opted out of review requests.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : (
                        <DropdownMenuItem onClick={onSendRequest}>
                            <Send className="mr-2 size-4" />
                            Send Request
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={onDelete}
                    >
                        <Trash2 className="mr-2 size-4" />
                        Delete customer
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
