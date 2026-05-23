"use client";

import { Loader2, Upload, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ReviewContentTabProps } from "@/components/settings/review-content-tab-props";

export function ReviewContentBrandingTab({
    form,
    uploadingFooterLogo,
    handleFooterLogoUpload,
    removeFooterLogo,
}: ReviewContentTabProps & {
    uploadingFooterLogo: boolean;
    handleFooterLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeFooterLogo: () => void;
}) {
    return (
                            <TabsContent value="branding" className="space-y-5 mt-0">
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-foreground">Footer & Branding</h4>
                                    <p className="text-sm text-muted-foreground">Customize the footer appearance.</p>
                                </div>
                                <div className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name="footer_company_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Zyene" {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                                                </FormControl>
                                                <FormDescription>
                                                    Appears after &quot;Powered by...&quot;.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="footer_link"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Link URL</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://zyene.com" {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                                                </FormControl>
                                                <FormDescription>
                                                    Where should the footer link to? Leave blank or use a full URL starting with{" "}
                                                    <span className="font-mono">https://</span> or{" "}
                                                    <span className="font-mono">http://</span>.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Footer Logo Section */}
                                    <div className="space-y-3">
                                        <FormLabel className="text-sm font-medium text-foreground">Footer Logo (Small)</FormLabel>
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-12 w-12 rounded-lg border border-border bg-muted/50 overflow-hidden flex items-center justify-center shrink-0">
                                                {uploadingFooterLogo ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                ) : form.watch("footer_logo_url") ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={form.watch("footer_logo_url")!} alt="Footer Logo" className="object-contain h-full w-full p-1" />
                                                ) : (
                                                    <Upload className="h-4 w-4 text-muted-foreground/40" />
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="relative">
                                                    <Button variant="outline" size="sm" type="button" className="relative h-9 px-3 border-border bg-card" disabled={uploadingFooterLogo}>
                                                        <Upload className="mr-2 h-3.5 w-3.5" />
                                                        Upload
                                                        <input
                                                            type="file"
                                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                            accept="image/png, image/jpeg, image/webp"
                                                            onChange={handleFooterLogoUpload}
                                                            disabled={uploadingFooterLogo}
                                                        />
                                                    </Button>
                                                </div>
                                                {form.watch("footer_logo_url") && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        type="button"
                                                        className="h-9 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
                                                        onClick={removeFooterLogo}
                                                        disabled={uploadingFooterLogo}
                                                    >
                                                        <Trash className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Shows between &quot;Powered by&quot; and Company Name. Best size: 64x64px.
                                        </p>
                                    </div>

                                    {/* Hide Branding Toggle */}
                                    <FormField
                                        control={form.control}
                                        name="hide_branding"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-muted/30">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-medium">Hide Branding</FormLabel>
                                                    <FormDescription className="text-xs">
                                                        Hide the footer completely from the review flow.
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>
    );
}
