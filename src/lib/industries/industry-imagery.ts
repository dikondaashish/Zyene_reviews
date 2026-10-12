// Photo provenance and generated-image prompts: docs/marketing-photography.md.
const HOME_SERVICE_PHOTO = {
  src: "/images/industries/window-installation.webp",
  alt: "A tradesperson fitting a window frame with a cordless drill",
};

const PHOTOS: Record<string, { src: string; alt: string }> = {
  restaurants: {
    src: "/images/industries/restaurant-guests.webp",
    alt: "Guests sharing a meal and conversation at a restaurant",
  },
  "home-services": HOME_SERVICE_PHOTO,
  hvac: {
    src: "/images/industries/hvac-candid-v2.webp",
    alt: "HVAC technician inspecting an outdoor air-conditioning unit beside a home",
  },
  plumbing: {
    src: "/images/industries/plumbing-candid-v2.webp",
    alt: "Plumber checking a drain pipe beneath a kitchen sink",
  },
  electricians: {
    src: "/images/industries/electricians-candid-v2.webp",
    alt: "Electrician preparing cable and tools at a workshop bench",
  },
  dental: {
    src: "/images/industries/dental-candid-v2.webp",
    alt: "Dental team preparing instruments beside an empty treatment chair",
  },
  "auto-repair": {
    src: "/images/industries/auto-repair-candid-v2.webp",
    alt: "Mechanic working with tools beneath an open car bonnet",
  },
  fitness: {
    src: "/images/industries/fitness-candid-v2.webp",
    alt: "Trainer speaking with a gym member beside a dumbbell rack",
  },
  hotels: {
    src: "/images/industries/hotels-candid-v2.webp",
    alt: "Hotel receptionist welcoming a guest with luggage at the front desk",
  },
  medical: {
    src: "/images/industries/medical-candid-v2.webp",
    alt: "Clinic receptionist welcoming a visitor in a waiting area",
  },
  salons: {
    src: "/images/industries/salons-candid-v2.webp",
    alt: "Hair stylist combing a client's hair in a neighborhood salon",
  },
};

export function getIndustryImage(slug: string, name = slug) {
  return PHOTOS[slug] ?? { src: `/images/industries/${slug}.webp`, alt: `${name} business environment` };
}
