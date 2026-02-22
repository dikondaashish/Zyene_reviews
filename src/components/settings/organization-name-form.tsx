"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Pencil, Check, X, Building2 } from "lucide-react"

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
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <Building2 className="h-5 w-5" />
            </div>
            {editing ? (
                <div className="flex items-center gap-2 flex-1">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter organization name"
                        className="max-w-sm h-9"
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
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            setName(organization.name)
                            setEditing(false)
                        }}
                        disabled={saving}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-medium">{organization.name}</span>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditing(true)}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )}
        </div>
    )
}
