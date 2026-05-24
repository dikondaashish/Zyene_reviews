import { ZYENE_REVIEWS_LOGO_SRC } from "@/lib/brand/logo";
import {
    JSON_LD_BASE_URL,
    JSON_LD_ORGANIZATION_ID,
    JSON_LD_ORGANIZATION_SAME_AS,
    JSON_LD_ORGANIZATION_URL,
} from "@/components/seo/json-ld-constants";

/** Shared Organization object for JSON-LD @graph / nested publisher references. */
export function buildOrganizationSchema(): Record<string, unknown> {
    return {
        "@type": "Organization",
        "@id": JSON_LD_ORGANIZATION_ID,
        name: "Zyene Reviews",
        alternateName: "Zyene",
        url: JSON_LD_ORGANIZATION_URL,
        logo: {
            "@type": "ImageObject",
            url: `${JSON_LD_BASE_URL}${ZYENE_REVIEWS_LOGO_SRC}`,
            width: 512,
            height: 512,
        },
        description: "Review management for local businesses",
        sameAs: [...JSON_LD_ORGANIZATION_SAME_AS],
    };
}
