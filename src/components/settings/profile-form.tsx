
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Mail, User } from "lucide-react";

const profileFormSchema = z.object({
    full_name: z.string().min(2),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
    user: any;
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            full_name: user.user_metadata?.full_name || "",
        },
    });

    async function onSubmit(data: ProfileFormValues) {
        setIsLoading(true);
        try {
            const response = await fetch("/api/users/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to update profile");
            }

            toast.success("Profile updated successfully");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Full Name
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="John Doe"
                                            className="pl-9"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="space-y-2">
                        <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Email Address
                        </FormLabel>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={user.email}
                                disabled
                                readOnly
                                className="pl-9 bg-muted/50"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Email cannot be changed.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isLoading} size="sm">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );
}
