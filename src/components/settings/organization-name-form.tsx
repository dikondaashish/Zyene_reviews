"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"

interface OrganizationNameFormProps {
    organization: {
        id: string;
        name: string;
    };
}

export function OrganizationNameForm({ organization }: OrganizationNameFormProps) {
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(organization.name)
    const [saving, setSaving] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSave = async () => {
        const trimmed = name.trim()
        if (!trimmed) {
            toast.error("Organization name cannot be empty")
            return
        }
        if (trimmed === organization.name) {
            setEditing(false)
            return
        }

        setSaving(true)
        try {
            const { error } = await supabase
                .from("organizations")
                .update({ name: trimmed })
                .eq("id", organization.id)

            if (error) throw error

            toast.success("Organization name updated")
            setEditing(false)
            router.refresh()
        } catch (err: any) {
            toast.error("Failed to update organization name", {
                description: err.message
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-3">
                    <Label htmlFor="org-name">Organization Name</Label>
                    {editing ? (
                        <div className="flex items-center gap-3">
                            <Input
                                id="org-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter organization name"
                                className="max-w-sm"
                                disabled={saving}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSave()
                                    if (e.key === "Escape") {
                                        setName(organization.name)
                                        setEditing(false)
                                    }
                                }}
                            />
                            <Button size="sm" onClick={handleSave} disabled={saving}>
                                {saving ? "Saving..." : "Save"}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setName(organization.name)
                                    setEditing(false)
                                }}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <p className="text-sm font-medium">{organization.name}</p>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-muted-foreground hover:text-foreground"
                                onClick={() => setEditing(true)}
                            >
                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                Edit
                            </Button>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                        This is the name of your organization shown across the dashboard.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
