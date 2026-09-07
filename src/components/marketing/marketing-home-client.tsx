import { MarketingHomeHero } from "@/components/marketing/marketing-home/marketing-home-hero";
import { MarketingHomeTrustStrip } from "@/components/marketing/marketing-home/marketing-home-trust-strip";
import { MarketingHomeWorkflow } from "@/components/marketing/marketing-home/marketing-home-workflow";
import { MarketingHomeIndustries } from "@/components/marketing/marketing-home/marketing-home-industries";
import { MarketingHomeNextSteps } from "@/components/marketing/marketing-home/marketing-home-next-steps";
import { MarketingHomeClosing } from "@/components/marketing/marketing-home/marketing-home-closing";

export function MarketingHomeClient() {
    return (
        <div className="flex w-full flex-col items-center">
            <MarketingHomeHero />
            <MarketingHomeTrustStrip />
            <MarketingHomeWorkflow />
            <MarketingHomeIndustries />
            <MarketingHomeNextSteps />
            <MarketingHomeClosing />
        </div>
    );
}
