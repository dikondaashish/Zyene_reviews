export const marketingImages = {
  home: {
    hero: {
      src: "/marketing/home/hero-local-owner.webp",
      alt: "Local business owner reading a customer review on their phone with Zyene Reviews",
      width: 800,
      height: 600,
    },
    featureMonitor: { src: "/marketing/home/storefront-candid-v2.webp", alt: "Customers sitting outside a neighborhood cafe", width: 1024, height: 1024 },
    featureAutomation: { src: "/marketing/home/customer-avatar-candid-v2.webp", alt: "Illustrative customer portrait", width: 320, height: 320 },
    heroReviewAlerts: {
      fiveStar: {
        name: "Emily Carter",
        src: "/marketing/home/alert-emily-carter.webp",
        alt: "Emily Carter left a 5-star review",
        width: 64,
        height: 64,
      },
      oneStar: {
        name: "Robert Hayes",
        src: "/marketing/home/alert-robert-hayes-candid-v2.webp",
        alt: "Illustrative feedback portrait",
        width: 320,
        height: 320,
      },
    },
    testimonials: {
      // Michael T., Owner, Riverfront Dining
      one: { src: "/marketing/home/testimonial-1.webp", width: 100, height: 100 },
      // Sarah Jenkins, Director, Apex Dental Care
      two: { src: "/marketing/home/testimonial-2.webp", width: 100, height: 100 },
      // David Chen, Manager, Chen Auto Repair
      three: { src: "/marketing/home/testimonial-3.webp", width: 100, height: 100 },
    },
  },
  about: {
    hero: { src: "/marketing/about/team-collaboration-candid-v2.webp", alt: "Three colleagues reviewing notes and a laptop around a table", width: 1024, height: 1024 }
  },
  birdeyeCompare: {
    reviewAlertPositive: {
      src: "/marketing/home/alert-emily-carter.webp",
      alt: "Illustrative Zyene Reviews in-app alert for a new 5-star Google review",
      width: 320,
      height: 120,
    },
    reviewAlertNegative: {
      src: "/marketing/home/alert-robert-hayes-candid-v2.webp",
      alt: "Illustrative feedback portrait",
      width: 320,
      height: 320,
    },
    localOwnerWorkflow: {
      src: "/marketing/home/hero-local-owner.webp",
      alt: "Local business owner checking review notifications on a phone with Zyene Reviews",
      width: 800,
      height: 600,
    },
  },
} as const;
