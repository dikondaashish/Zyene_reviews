"use client";

import { Button } from "@/components/ui/button";
import { Check, ShieldCheck } from "lucide-react";
import { motion, type Variants } from "framer-motion";

export function MarketingHomePricingEnterprise({ fadeInUp }: { fadeInUp: Variants }) {
    return (
        <>
            {/* Enterprise */}
            <motion.div variants={fadeInUp} className="bg-card border border-border rounded-lg p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-primary size-5" />
                <h3 className="text-xl font-semibold text-foreground">Enterprise</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">For large organizations with custom needs.</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-foreground">Custom</span>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground flex-1 mb-8">
                {[
                  "Everything in Professional, plus:",
                  "Unlimited business locations",
                  "Unlimited email, SMS & link requests",
                  "Unlimited AI / smart replies (contract terms)",
                  "Managed API keys and integration support",
                  "Embeddable and white-label review widgets",
                  "Priority sync pipelines and proactive monitoring",
                  "Dedicated account manager",
                  "Custom integrations & SSO (as agreed)",
                  "Uptime SLA & security review options",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="text-primary shrink-0 mt-0.5 size-4" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="mailto:sales@zyenereviews.com?subject=Interested%20in%20Zyene%20Enterprise">
                <Button variant="outline" className="w-full rounded-md py-6 font-medium">
                  Contact Sales
                </Button>
              </a>
            </motion.div>
        </>
    );
}
