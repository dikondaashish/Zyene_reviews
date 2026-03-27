"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Building2, Loader2 } from "lucide-react"

interface OrganizationNameFormProps {
    organization: {
        id: string;
        name: string;
    };
}

export function OrganizationNameForm({ organization }: OrganizationNameFormProps) {
    const [name, setName] = useState(organization.name)
    const [saving, setSaving] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const trimmed = name.trim()
        if (!trimmed) {
            toast.error("Organization name cannot be empty")
            return
        }
        if (trimmed === organization.name) {
            toast.success("Organization name updated")
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
        <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Organization Name
                </label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter organization name"
                        className="pl-9"
                        disabled={saving}
                    />
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving || name.trim() === organization.name} size="sm">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    )
}
