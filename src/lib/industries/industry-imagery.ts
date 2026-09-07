// Photographer credits and source licenses: docs/marketing-photography.md.
const PHOTOS: Record<string, { src: string; alt: string }> = {
  restaurants: {
    src: "/images/industries/restaurant-guests.webp",
    alt: "Guests sharing a meal and conversation at a restaurant",
  },
  "home-services": {
    src: "/images/industries/window-installation.webp",
    alt: "A tradesperson fitting a window frame with a cordless drill",
  },
};

export function getIndustryImage(slug: string, name = slug) {
  return PHOTOS[slug] ?? { src: `/images/industries/${slug}.webp`, alt: `${name} business environment` };
}
