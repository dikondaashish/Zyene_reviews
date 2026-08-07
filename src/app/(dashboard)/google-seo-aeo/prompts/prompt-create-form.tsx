"use client";

import * as React from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { createPrompt } from "./prompt-actions";

const INTENTS = [
    { value: "discovery", label: "Discovery — “best plumber in Austin”" },
    { value: "comparison", label: "Comparison — “X vs Y”" },
    { value: "transactional", label: "Transactional — “book a plumber now”" },
    { value: "branded", label: "Branded — “is Acme Plumbing any good”" },
] as const;

export function PromptCreateForm({ businessId }: { businessId: string }) {
    const [promptText, setPromptText] = React.useState("");
    const [intent, setIntent] = React.useState<string>("");
    const [city, setCity] = React.useState("");
    const [saving, setSaving] = React.useState(false);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setSaving(true);
        const result = await createPrompt({
            businessId,
            promptText,
            intent: intent || null,
            localeCity: city.trim() || null,
        });
        setSaving(false);

        if (!result.ok) {
            toast.error(result.error);
            return;
        }
        setPromptText("");
        setCity("");
        setIntent("");
        // States the safe default explicitly, so nobody assumes adding a prompt
        // started spending.
        toast.success("Prompt added, inactive. Switch it on when you want it sampled.");
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="prompt-text">Prompt</Label>
                <Textarea
                    id="prompt-text"
                    value={promptText}
                    onChange={(event) => setPromptText(event.target.value)}
                    placeholder="What would a customer type into ChatGPT to find a business like yours?"
                    maxLength={500}
                    rows={3}
                    required
                />
                <p className="text-xs text-muted-foreground">
                    Write it the way a person would ask, not as a keyword. Answer engines respond to
                    questions.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="prompt-intent">Intent (optional)</Label>
                    <Select value={intent} onValueChange={setIntent}>
                        <SelectTrigger id="prompt-intent">
                            <SelectValue placeholder="Not set" />
                        </SelectTrigger>
                        <SelectContent>
                            {INTENTS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="prompt-city">City (optional)</Label>
                    <Input
                        id="prompt-city"
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        placeholder="Austin"
                        maxLength={120}
                    />
                    <p className="text-xs text-muted-foreground">
                        Sampled from this location. Leave blank to use the business address.
                    </p>
                </div>
            </div>

            <Button type="submit" disabled={saving || promptText.trim().length < 3}>
                {saving ? "Adding…" : "Add prompt"}
            </Button>
        </form>
    );
}
