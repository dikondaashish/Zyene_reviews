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
  async redirects() {
    return [
      { source: "/product", destination: "/features", permanent: true },
      ...legacyBlogCoverNames.map((name) => ({
        source: `/images/blog/covers/${name}.jpg`,
        destination: `/images/blog/covers/${name}.webp`,
        permanent: true,
      })),
    ];
  },
  images: {
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

const isDeploy = Boolean(process.env.CI || process.env.VERCEL);

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "zyene",
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
