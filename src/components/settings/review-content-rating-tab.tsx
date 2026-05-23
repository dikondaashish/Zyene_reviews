"use client";


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

export function ReviewContentRatingTab({ form }: ReviewContentTabProps) {
    return (
                            <TabsContent value="rating" className="space-y-5 mt-0">
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-foreground">Rating Screen</h4>
                                    <p className="text-sm text-muted-foreground">The first screen customers see when they open the review link.</p>
                                </div>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="welcome_message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Welcome Heading</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="How was your experience?" {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="rating_subtitle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subtitle</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your feedback means a lot to us!" {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="pt-2 border-t border-border">
                                        <FormField
                                            control={form.control}
                                            name="rating_style"
                                            render={({ field }) => (
                                                <FormItem className="mb-4">
                                                    <FormLabel>Rating Style</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors">
                                                                <SelectValue placeholder="Select style" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="emoji">Emoji (😍 😊 😐 😟 😠)</SelectItem>
                                                            <SelectItem value="stars">Stars (★★★★★)</SelectItem>
                                                            <SelectItem value="number">Number Scale (1 - 5)</SelectItem>
                                                            <SelectItem value="slider">Slider (Draggable)</SelectItem>
                                                            <SelectItem value="radio">Radio Buttons (Text-based)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        Choose how customers input their rating.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="min_stars_for_google"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Minimum Stars for Public Review</FormLabel>
                                                    <Select
                                                        onValueChange={(val) => field.onChange(Number(val))}
                                                        value={String(field.value)}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors">
                                                                <SelectValue placeholder="Select stars" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="1">1 Star & Up</SelectItem>
                                                            <SelectItem value="2">2 Stars & Up</SelectItem>
                                                            <SelectItem value="3">3 Stars & Up</SelectItem>
                                                            <SelectItem value="4">4 Stars & Up (Recommended)</SelectItem>
                                                            <SelectItem value="5">5 Stars Only</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        {form.watch("min_stars_for_google") === 1
                                                            ? "All ratings will be directed to public review flow."
                                                            : "Customers rating below this threshold will be asked for private feedback instead."}
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
    );
}
