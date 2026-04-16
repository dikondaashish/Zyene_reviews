"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { DOC_NAV_GROUPS } from "@/lib/docs/doc-nav";

export function DocSearchTrigger({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpen((v) => !v);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    const groups = useMemo(
        () =>
            DOC_NAV_GROUPS.map((g) => ({
                title: g.title,
                items: g.items,
            })),
        []
    );

    return (
        <>
            <button
                type="button"
                className={className}
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                {children}
            </button>

            <CommandDialog
                open={open}
                onOpenChange={setOpen}
                title="Search documentation"
                description="Jump to a documentation page"
            >
                <CommandInput placeholder="Search docs…" />
                <CommandList>
                    <CommandEmpty>No matching pages.</CommandEmpty>
                    {groups.map((group) => (
                        <CommandGroup key={group.title} heading={group.title}>
                            {group.items.map((item) => (
                                <CommandItem
                                    key={item.href}
                                    value={`${item.title} ${group.title}`}
                                    onSelect={() => {
                                        setOpen(false);
                                        router.push(item.href);
                                    }}
                                >
                                    <FileText className="size-4 opacity-70" />
                                    {item.title}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ))}
                </CommandList>
            </CommandDialog>
        </>
    );
}
