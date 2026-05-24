export const marketingImages = {
  home: {
    hero: {
      src: "/marketing/home/hero-local-owner.png",
      alt: "Local business owner reading a customer review on their phone with Zyene Reviews",
      width: 800,
      height: 600,
    },
    featureMonitor: { src: "/marketing/home/storefront.png", alt: "Modern local business storefront managed by Zyene Reviews", width: 600, height: 300 },
    featureAutomation: { src: "/marketing/home/customer-avatar.png", alt: "Happy customer leaving a review via Zyene Reviews", width: 100, height: 100 },
    heroReviewAlerts: {
      fiveStar: {
        name: "Emily Carter",
        src: "/marketing/home/alert-emily-carter.png",
        alt: "Emily Carter left a 5-star review",
        width: 64,
        height: 64,
      },
      oneStar: {
        name: "Robert Hayes",
        src: "/marketing/home/alert-robert-hayes.png",
        alt: "Robert Hayes — 1-star review alert",
        width: 64,
        height: 64,
      },
    },
    testimonials: {
      // Michael T., Owner, Riverfront Dining
      one: { src: "/marketing/home/testimonial-1.png", width: 100, height: 100 },
      // Sarah Jenkins, Director, Apex Dental Care
      two: { src: "/marketing/home/testimonial-2.png", width: 100, height: 100 },
      // David Chen, Manager, Chen Auto Repair
      three: { src: "/marketing/home/testimonial-3.png", width: 100, height: 100 },
    },
  },
  about: {
    hero: { src: "/marketing/about/team-collaboration.png", alt: "Zyene Reviews team collaborating on reputation management software", width: 900, height: 400 }
  }
} as const;
