"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const SUBJECTS = [
    { value: "General Inquiry", label: "General Inquiry" },
    { value: "Sales", label: "Sales" },
    { value: "Support", label: "Support" },
    { value: "Partnership", label: "Partnership" },
] as const;

export function ContactForm() {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");
    const [subject, setSubject] = useState<string>("");

    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const form = e.currentTarget;
        const fd = new FormData(form);

        try {
            const res = await fetch("/api/marketing/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: fd.get("name"),
                    email: fd.get("email"),
                    subject: subject || fd.get("subject"),
                    message: fd.get("message"),
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json.error ?? "Something went wrong");
                return;
            }
            setDone(true);
            form.reset();
            setSubject("");
        } catch {
            setError("Network error—try again");
        } finally {
            setLoading(false);
        }
    }

    if (done) {
        return (
            <div className="rounded-lg border border-chart-2/30 bg-chart-2/10 px-6 py-8 text-center">
                <p className="text-sm font-medium text-foreground">Message sent</p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Thanks for contacting us. We&apos;ll reply within one business day.
                </p>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setDone(false)}
                >
                    Send another message
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-sm font-medium text-foreground">
                        Name
                    </label>
                    <input
                        id="contact-name"
                        name="name"
                        required
                        autoComplete="name"
                        placeholder="Your name"
                        className="flex h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-sm font-medium text-foreground">
                        Email
                    </label>
                    <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@company.com"
                        className="flex h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="contact-subject" className="text-sm font-medium text-foreground">
                    Subject
                </label>
                <Select value={subject} onValueChange={setSubject} required>
                    <SelectTrigger id="contact-subject" className="h-11 w-full rounded-lg bg-background">
                        <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                        {SUBJECTS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <input type="hidden" name="subject" value={subject} />
            </div>

            <div className="space-y-2">
                <label htmlFor="contact-message" className="text-sm font-medium text-foreground">
                    Message
                </label>
                <textarea
                    id="contact-message"
                    name="message"
                    required
                    minLength={10}
                    rows={5}
                    placeholder="How can we help?"
                    className="flex w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" disabled={loading || !subject} className="w-full sm:w-auto rounded-md px-8 py-6 font-medium">
                {loading ? <Loader2 className="animate-spin size-4" /> : "Send message"}
            </Button>
        </form>
    );
}
