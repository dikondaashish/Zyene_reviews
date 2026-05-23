import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us",
    description:
        "Reach out to the Zyene Reviews team for support, sales, or general inquiries. We typically respond within 24 hours, Monday through Friday.",
    alternates: { canonical: "https://zyenereviews.com/contact" },
    openGraph: {
        title: "Contact Zyene Reviews",
        description:
            "Get in touch with our support team or talk to sales about Enterprise plans. We typically respond within 24 hours.",
        url: "https://zyenereviews.com/contact",
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact Zyene Reviews",
        description:
            "Reach us at support@zyenereviews.com. Mon–Fri, 9am–6pm EST. We typically respond within 24 hours.",
    },
};

import PageView from "./page-view";

export default PageView;
