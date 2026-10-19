import type { NextConfig } from "next";

// Preserve links to the JPEG covers replaced by WebP in September 2026.
const legacyBlogCoverNames = [
  "ai-review-reply-oversight",
  "ai-visibility-audit",
  "birdeye-alternatives-cost-comparison",
  "delete-google-review-hero",
  "dental-practice-reputation",
  "fake-review-evidence",
  "five-star-review-collection",
  "google-business-profile-audit",
  "google-review-policy-research",
  "google-review-request-playbook",
  "local-map-pack-visibility",
  "online-reputation-business-impact",
  "positive-google-review-response",
  "private-feedback-service-recovery",
  "reporting-google-review-laptop",
  "reputation-dashboard-overview",
  "responding-to-negative-review",
  "responding-to-one-star-review",
  "restaurant-review-management",
  "review-software-pricing-comparison",
  "team-review-management",
  "why-google-reviews-matter"
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Share cards (src/lib/seo/og-card.tsx) read fonts, the logo and page photos from disk. Dynamic
  // routes render on demand, so those files must ship with the function.
  outputFileTracingIncludes: {
    "/**/opengraph-image*": [
      "./src/assets/fonts/*",
      "./public/Main logo.png",
      "./public/images/blog/**/*.{webp,jpg}",
      "./public/images/industries/*.webp",
    ],
  },
  async redirects() {
    return [
      { source: "/product", destination: "/features", permanent: true },
      {
        source: "/blog/how-to-get-a-google-review-link-for-your-business-2026",
        destination: "/blog/how-to-get-a-google-review-link",
        permanent: true,
      },
      ...legacyBlogCoverNames.map((name) => ({
        source: `/images/blog/covers/${name}.jpg`,
        destination: `/images/blog/covers/${name}.webp`,
        permanent: true,
      })),
    ];
  },
  images: {
    // AVIF first (sharper at the same weight), WebP as the fallback. Photos default to quality 90
    // through the loader below; see src/lib/images/image-loader.ts.
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    loaderFile: "./src/lib/images/image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "t1.gstatic.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/((?!w/).*)",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/w/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
};

import { withSentryConfig } from "@sentry/nextjs";
// Vercel BotID: invisible bot check on the website chat's lead and demo-booking forms.
import { withBotId } from "botid/next/config";

const isDeploy = Boolean(process.env.CI || process.env.VERCEL);

export default withSentryConfig(withBotId(nextConfig), {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "zyene-inc",
  project: "zyene-reviews",

  // Source-map upload is for Vercel/CI. Skip it on local builds.
  silent: !isDeploy,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: isDeploy,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  sourcemaps: {
    disable: !isDeploy,
  },

});
