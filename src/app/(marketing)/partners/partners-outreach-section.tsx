import Link from "next/link";
import { ArrowRight, Mail, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GOOGLE_ADS_CAMPAIGNS } from "@/lib/phase6/google-ads-data";
import { META_ADS_CAMPAIGNS } from "@/lib/phase6/meta-ads-data";
import { PARTNER_CONTACT_EMAIL } from "@/lib/phase6/partnerships-data";

export function PartnersOutreachSection() {
    return (
        <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="text-primary size-5" />
                        <h2 className="text-2xl font-bold text-foreground">Paid acquisition playbook</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-10">
                        Campaign structure for Google Ads and Meta—use UTM parameters for attribution (
                        <code className="text-xs bg-background px-1 py-0.5 rounded">utm_source</code>,{" "}
                        <code className="text-xs bg-background px-1 py-0.5 rounded">utm_campaign</code>).
                    </p>

                    <h3 className="text-lg font-semibold text-foreground mb-4">Google Ads</h3>
                    <div className="overflow-x-auto rounded-xl border border-border bg-card mb-12">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 font-semibold">Type</th>
                                    <th className="px-4 py-3 font-semibold">Priority</th>
                                    <th className="px-4 py-3 font-semibold">Landing</th>
                                    <th className="px-4 py-3 font-semibold">UTM campaign</th>
                                </tr>
                            </thead>
                            <tbody>
                                {GOOGLE_ADS_CAMPAIGNS.map((c) => (
                                    <tr key={c.utmCampaign} className="border-b border-border last:border-0">
                                        <td className="px-4 py-3 text-foreground">{c.name}</td>
                                        <td className="px-4 py-3 capitalize">{c.budgetPriority}</td>
                                        <td className="px-4 py-3">
                                            <Link href={c.landingPath} className="text-primary hover:underline">
                                                {c.landingPath}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                            {c.utmCampaign}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-4">Meta (Facebook / Instagram)</h3>
                    <div className="overflow-x-auto rounded-xl border border-border bg-card">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 font-semibold">Audience</th>
                                    <th className="px-4 py-3 font-semibold">Creative</th>
                                    <th className="px-4 py-3 font-semibold">Landing</th>
                                    <th className="px-4 py-3 font-semibold">UTM campaign</th>
                                </tr>
                            </thead>
                            <tbody>
                                {META_ADS_CAMPAIGNS.map((c) => (
                                    <tr key={c.utmCampaign} className="border-b border-border last:border-0">
                                        <td className="px-4 py-3 text-foreground">{c.audienceLabel}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{c.creativeHook}</td>
                                        <td className="px-4 py-3">
                                            <Link href={c.landingPath} className="text-primary hover:underline">
                                                {c.landingPath}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                            {c.utmCampaign}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
    );
}
