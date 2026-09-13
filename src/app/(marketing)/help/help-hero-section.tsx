import { LandingHero } from "@/components/marketing/landing-hero";
import { HelpSearch } from "@/components/marketing/help-search";
import { HELP_ARTICLES, HELP_CATEGORIES, helpArticleNestedPath } from "@/lib/content/help-data";

const POPULAR_PATHS = [
    "/help/getting-started/connecting-google-business-profile",
    "/help/getting-started/sending-your-first-review-request",
    "/help/reviews/setting-up-auto-commenter",
];

export function HelpHeroSection() {
    return (
        <LandingHero
            eyebrow="Zyene Help Center"
            title="A little guidance goes a long way."
            description="Find setup guides, answers, and practical tips to keep your review workflows running smoothly."
            variant="support"
            media={{
                kind: "product",
                label: "Search Zyene help",
                node: (
                    <HelpSearch
                        popularPaths={POPULAR_PATHS}
                        items={HELP_ARTICLES.map((article) => ({
                            title: article.title,
                            excerpt: article.excerpt,
                            category: HELP_CATEGORIES[article.category].label,
                            path: helpArticleNestedPath(article),
                        }))}
                    />
                ),
            }}
            primary={{ label: "Email support", href: "mailto:support@zyenereviews.com" }} />
    );
}
