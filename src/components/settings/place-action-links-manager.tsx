"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export type PlaceLinkRow = {
    id: string;
    place_action_type: string;
    uri: string;
    is_preferred: boolean;
    is_broken: boolean;
};

type MetaType = { placeActionType?: string; displayName?: string };

export function PlaceActionLinksManager({
    businessId,
    initialLinks,
}: {
    businessId: string;
    initialLinks: PlaceLinkRow[];
}) {
    const router = useRouter();
    const [links, setLinks] = useState<PlaceLinkRow[]>(initialLinks);
    const [types, setTypes] = useState<MetaType[]>([]);
    const [typesLoading, setTypesLoading] = useState(true);
    const [placeActionType, setPlaceActionType] = useState("");
    const [uri, setUri] = useState("");
    const [isPreferred, setIsPreferred] = useState(false);
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const unwrapApiData = <T,>(payload: unknown): T => {
        const root = payload as { data?: T } & T;
        return (root?.data ?? root) as T;
    };

    useEffect(() => {
        setLinks(initialLinks);
    }, [initialLinks]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setTypesLoading(true);
            try {
                const res = await fetch(
                    `/api/google/place-actions?businessId=${encodeURIComponent(businessId)}`
                );
                const payload = await res.json();
                if (!res.ok) throw new Error(payload.error || "Failed to load link types");
                const data = unwrapApiData<{ types?: MetaType[] }>(payload);
                const list = data.types || [];
                if (!cancelled) {
                    setTypes(list);
                    setPlaceActionType((prev) => prev || list[0]?.placeActionType || "");
                }
            } catch (e: unknown) {
                if (!cancelled) {
                    toast.error(e instanceof Error ? e.message : "Failed to load types");
                }
            } finally {
                if (!cancelled) setTypesLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [businessId]);

    const displayForType = (t: string) => {
        const m = types.find((x) => x.placeActionType === t);
        return m?.displayName || t;
    };

    const prettyUrl = (raw: string) => {
        try {
            const u = new URL(raw);
            const host = u.hostname.replace(/^www\./, "");
            const path = `${u.pathname}${u.search}`;
            return { host, path: path.length > 70 ? `${path.slice(0, 67)}...` : path };
        } catch {
            return { host: raw, path: "" };
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!placeActionType || !uri.trim()) {
            toast.error("Choose a link type and enter a URL");
            return;
        }
        setCreating(true);
        try {
            const res = await fetch("/api/google/place-actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessId,
                    placeActionType,
                    uri: uri.trim(),
                    isPreferred,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create link");
            toast.success("Link added on Google");
            setUri("");
            setIsPreferred(false);
            router.refresh();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to create");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (linkId: string) => {
        setDeletingId(linkId);
        try {
            const res = await fetch("/api/google/place-actions", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ linkId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to remove link");
            toast.success("Link removed");
            router.refresh();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to remove");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-8">
            <form onSubmit={handleCreate} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                    <Label>Link type</Label>
                    {typesLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading types from Google…
                        </div>
                    ) : types.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No action types available for this listing. Ensure Place Actions API is enabled for
                            your Google project.
                        </p>
                    ) : (
                        <Select value={placeActionType} onValueChange={setPlaceActionType}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {types
                                    .filter((t) => t.placeActionType)
                                    .map((t) => (
                                        <SelectItem
                                            key={t.placeActionType}
                                            value={t.placeActionType as string}
                                        >
                                            {t.displayName || t.placeActionType}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="place-action-uri">URL</Label>
                    <Input
                        id="place-action-uri"
                        type="url"
                        placeholder="https://…"
                        value={uri}
                        onChange={(e) => setUri(e.target.value)}
                        autoComplete="off"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="preferred"
                        checked={isPreferred}
                        onCheckedChange={(c) => setIsPreferred(c === true)}
                    />
                    <Label htmlFor="preferred" className="text-sm font-normal cursor-pointer">
                        Mark as preferred (when Google supports multiple links of this type)
                    </Label>
                </div>
                <Button type="submit" disabled={creating || typesLoading || !types.length}>
                    {creating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding…
                        </>
                    ) : (
                        "Add link"
                    )}
                </Button>
            </form>

            <div>
                <h5 className="text-sm font-medium mb-3">Current links</h5>
                {links.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No place action links synced yet.</p>
                ) : (
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[220px]">Type</TableHead>
                                    <TableHead>URL</TableHead>
                                    <TableHead className="w-[170px]">Flags</TableHead>
                                    <TableHead className="w-[72px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {links.map((row) => {
                                    const parsedUrl = prettyUrl(row.uri);
                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell className="align-top text-sm font-medium">
                                                {displayForType(row.place_action_type)}
                                            </TableCell>
                                            <TableCell className="align-top min-w-[360px] max-w-[640px]">
                                                <a
                                                    href={row.uri}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group inline-flex max-w-full items-start gap-1 text-sm text-primary hover:underline"
                                                    title={row.uri}
                                                >
                                                    <span className="min-w-0">
                                                        <span className="block truncate font-medium">{parsedUrl.host}</span>
                                                        {parsedUrl.path ? (
                                                            <span className="block truncate text-xs text-muted-foreground group-hover:text-primary/80">
                                                                {parsedUrl.path}
                                                            </span>
                                                        ) : null}
                                                    </span>
                                                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                                </a>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <div className="flex min-h-8 flex-wrap gap-1">
                                                    {row.is_preferred && (
                                                        <Badge variant="secondary">Preferred</Badge>
                                                    )}
                                                    {row.is_broken && (
                                                        <Badge variant="destructive">Possibly broken</Badge>
                                                    )}
                                                    {!row.is_preferred && !row.is_broken ? (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(row.id)}
                                                    disabled={deletingId === row.id}
                                                    aria-label="Remove link"
                                                >
                                                    {deletingId === row.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
