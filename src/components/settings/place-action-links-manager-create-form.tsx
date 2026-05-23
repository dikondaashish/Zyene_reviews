"use client";

import { Loader2 } from "lucide-react";

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
import type { PlaceActionMetaType } from "./place-action-links-manager-types";

export function PlaceActionLinksManagerCreateForm({
    types,
    typesLoading,
    placeActionType,
    onPlaceActionTypeChange,
    uri,
    onUriChange,
    isPreferred,
    onIsPreferredChange,
    creating,
    onSubmit,
}: {
    types: PlaceActionMetaType[];
    typesLoading: boolean;
    placeActionType: string;
    onPlaceActionTypeChange: (value: string) => void;
    uri: string;
    onUriChange: (value: string) => void;
    isPreferred: boolean;
    onIsPreferredChange: (value: boolean) => void;
    creating: boolean;
    onSubmit: (e: React.FormEvent) => void;
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
            <div className="space-y-2">
                <Label>Link type</Label>
                {typesLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="animate-spin size-4" />
                        Loading types from Google…
                    </div>
                ) : types.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No action types available for this listing. Ensure Place Actions API is enabled for
                        your Google project.
                    </p>
                ) : (
                    <Select value={placeActionType} onValueChange={onPlaceActionTypeChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            {types
                                .filter((t) => t.placeActionType)
                                .map((t) => (
                                    <SelectItem key={t.placeActionType} value={t.placeActionType as string}>
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
                    onChange={(e) => onUriChange(e.target.value)}
                    autoComplete="off"
                />
            </div>
            <div className="flex items-center gap-2">
                <Checkbox
                    id="preferred"
                    checked={isPreferred}
                    onCheckedChange={(c) => onIsPreferredChange(c === true)}
                />
                <Label htmlFor="preferred" className="text-sm font-normal cursor-pointer">
                    Mark as preferred (when Google supports multiple links of this type)
                </Label>
            </div>
            <Button type="submit" disabled={creating || typesLoading || !types.length}>
                {creating ? (
                    <>
                        <Loader2 className="mr-2 animate-spin size-4" />
                        Adding…
                    </>
                ) : (
                    "Add link"
                )}
            </Button>
        </form>
    );
}
