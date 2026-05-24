import { buildPricingProductSchema } from "@/lib/seo/pricing-json-ld";
import { JsonLdScript } from "./json-ld-script";

export function PricingPlansJsonLd() {
    return <JsonLdScript schema={buildPricingProductSchema()} />;
}
