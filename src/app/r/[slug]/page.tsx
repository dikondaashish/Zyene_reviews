import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;

    return {
        title: "Share Your Experience",
        description: "We'd love to hear about your experience. Your feedback helps us improve.",
        robots: { index: false, follow: false },
        alternates: {
            canonical: `https://collectratings.com/${slug}`,
        },
    };
}

import PageView from "./page-view";

export default PageView;
