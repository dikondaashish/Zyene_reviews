// ─────────────────────────────────────────────────────────────────────────────
// Industry Vertical Data — Phase 3
// Single source of truth for all 8 industry landing pages.
// ─────────────────────────────────────────────────────────────────────────────

export interface PainPoint {
    stat: string;
    title: string;
    description: string;
}

export interface Solution {
    title: string;
    description: string;
}

export interface UseCase {
    startingPoint: string;
    workflow: string;
    measures: string;
}

export interface IndustryData {
    slug: string;
    name: string;
    nameSingular: string;
    ownerTitle: string;
    heroHeadline: string;
    heroSub: string;
    emoji: string;
    accentColor: string;
    metaTitle: string;
    metaDescription: string;
    targetKeywords: string[];
    painPoints: PainPoint[];
    solutions: Solution[];
    useCase: UseCase;
    ctaJoinCopy: string;
    imagePath: string;
}

export const INDUSTRIES: IndustryData[] = [
    // ── 1. Restaurants ──────────────────────────────────────────────────────
    {
        slug: "restaurants",
        name: "Restaurants",
        nameSingular: "Restaurant",
        ownerTitle: "restaurant owner",
        heroHeadline: "Review Management Built for Restaurants",
        heroSub: "Restaurant owners use Zyene Reviews to get more 5-star reviews, respond to diners instantly with AI, and protect their reputation before bad reviews go public.",
        emoji: "🍽️",
        accentColor: "orange",
        metaTitle: "Restaurant Review Management",
        metaDescription:
            "Zyene Reviews helps restaurants get more Google reviews, respond faster with AI, and protect reputation with the Negative Feedback Shield. From $29.99/mo.",
        targetKeywords: ["restaurant review management", "google reviews for restaurants", "restaurant reputation management", "how to get more restaurant reviews"],
        painPoints: [
            {
                stat: "One 1-star drop",
                title: "One bad review costs you 30+ covers",
                description: "Harvard Business School research found a 1-star drop in Yelp rating costs restaurants 5–9% of revenue. In a 100-cover restaurant, that's 5–9 empty tables every night.",
            },
            {
                stat: "93% of diners",
                title: "Diners research you before they walk in",
                description: "93% of consumers check restaurant reviews before choosing where to eat. If your last 3 reviews are negative and unanswered, they're going to the place next door.",
            },
            {
                stat: "53% expect",
                title: "Slow responses damage your brand",
                description: "53% of customers expect a business to reply to reviews within a week. Most restaurants respond to fewer than 30% of their reviews — or not at all.",
            },
        ],
        solutions: [
            { title: "Never miss a new review", description: "Get instant SMS or email alerts the moment a new Google, Facebook, or Yelp review arrives — so you can respond before the diner even gets home." },
            { title: "AI replies that sound like you", description: "One-click AI reply suggestions match your restaurant's tone — warm, professional, or apologetic — and can be published in seconds without sounding robotic." },
            { title: "Route bad experiences privately", description: "The Negative Feedback Shield intercepts unhappy diners before they write a public 1-star review. They're guided to a private form you can act on — without it affecting your Google rating." },
            { title: "Track nearby competitors", description: "See exactly how your star rating, review volume, and response rate compares to the restaurants around you — and identify where you're winning or falling behind." },
        ],
        useCase: {
            startingPoint: "A restaurant group monitors several review platforms separately, responds inconsistently, and cannot compare locations from one view.",
            workflow: "Connect each location, centralize review alerts, create a response workflow, and offer every customer a consistent way to share feedback.",
            measures: "Track request delivery, genuine review volume, rating distribution, response coverage, and response time by location. Results depend on customer volume and experience.",
        },
        ctaJoinCopy: "Join other restaurant owners on Zyene",
        imagePath: "/images/industries/restaurants.png",
    },

    // ── 2. Dental ────────────────────────────────────────────────────────────
    {
        slug: "dental",
        name: "Dental Practices",
        nameSingular: "Dental Practice",
        ownerTitle: "dental practice",
        heroHeadline: "Review Management Built for Dental Practices",
        heroSub: "Dental practices use Zyene Reviews to attract new patients, respond to reviews professionally, and protect their reputation with the Negative Feedback Shield.",
        emoji: "🦷",
        accentColor: "blue",
        metaTitle: "Dental Practice Review Management",
        metaDescription:
            "Dental practices get more Google reviews with HIPAA-aware AI replies, the Negative Feedback Shield, and competitor tracking. From $29.99/mo.",
        targetKeywords: ["dental practice reviews", "dentist reputation management", "dental google reviews", "how to get more dental patient reviews"],
        painPoints: [
            {
                stat: "77% of patients",
                title: "New patients check reviews before booking",
                description: "77% of patients use online reviews as their first step in finding a new dentist. If your Google profile has fewer than 20 reviews or a rating below 4.5, most potential patients will choose a competitor.",
            },
            {
                stat: "1 bad review",
                title: "One negative review can block 10 new patients a month",
                description: "In healthcare, trust is everything. A single unanswered 1-star review about a billing issue or wait time can quietly turn away dozens of prospective patients who read it and choose elsewhere.",
            },
            {
                stat: "72% of practices",
                title: "Most practices never respond to their reviews",
                description: "72% of dental practices don't respond to any of their Google reviews. Every unanswered review — positive or negative — signals to prospective patients that you don't care about feedback.",
            },
        ],
        solutions: [
            { title: "Grow your review count automatically", description: "Send automated review requests via SMS or email after each appointment — timed to arrive when patient satisfaction is highest, like 2 hours after checkout." },
            { title: "HIPAA-aware, professional AI replies", description: "Zyene's AI reply suggestions are designed for healthcare contexts — never referencing protected health information, always sounding professional and empathetic." },
            { title: "Shield your reputation from billing disputes", description: "Billing complaints and wait-time frustrations are the #1 source of 1-star dental reviews. The Negative Feedback Shield routes these patients to a private resolution before they go public on Google." },
            { title: "Monitor every platform in one inbox", description: "Track your reviews across Google, Healthgrades context, and Facebook — from one dashboard. Identify which of your associates receives the best patient feedback." },
        ],
        useCase: {
            startingPoint: "A dental group has uneven review coverage across locations and no shared process for requests, replies, or billing-related feedback.",
            workflow: "Connect both locations, send policy-compliant requests after visits, route feedback to the responsible team, and review AI-assisted drafts before publishing.",
            measures: "Track consented request delivery, new review volume, response time, unresolved feedback, and location-level trends. Do not attribute ranking changes to reviews alone.",
        },
        ctaJoinCopy: "Join other dental practices on Zyene",
        imagePath: "/images/industries/dental.png",
    },

    // ── 3. Auto Repair ───────────────────────────────────────────────────────
    {
        slug: "auto-repair",
        name: "Auto Repair Shops",
        nameSingular: "Auto Repair Shop",
        ownerTitle: "shop owner",
        heroHeadline: "Review Management Built for Auto Repair Shops",
        heroSub: "Auto repair shops use Zyene Reviews to build trust with new customers, respond to reviews professionally, and protect their reputation online.",
        emoji: "🔧",
        accentColor: "gray",
        metaTitle: "Auto Repair Review Management",
        metaDescription:
            "Auto repair shops build trust with more Google reviews, AI replies, and the Negative Feedback Shield. Built for independent mechanics from $29.99/mo.",
        targetKeywords: ["auto repair google reviews", "mechanic reputation management", "auto shop reviews", "car repair reputation management"],
        painPoints: [
            {
                stat: "90% of customers",
                title: "Customers Google your shop before they call",
                description: "90% of consumers read online reviews for local businesses before making a decision. For auto repair — where trust is everything — a profile with fewer than 4.5 stars or outdated reviews means the phone doesn't ring.",
            },
            {
                stat: "Estimate disputes",
                title: "Estimate surprises turn into 1-star reviews",
                description: "The #1 source of 1-star auto repair reviews is unexpected additional charges or estimates that changed. Without a private resolution path, unhappy customers go straight to Google.",
            },
            {
                stat: "Repeat business",
                title: "Your reputation drives return visits more than price",
                description: "68% of auto repair customers say they chose a shop based on reviews and reputation over price. A strong review profile is your most powerful retention and acquisition tool.",
            },
        ],
        solutions: [
            { title: "Build trust before the first call", description: "Proactively grow your 5-star review count so new customers find a shop they feel confident about — before they've even called." },
            { title: "AI replies that sound like a real shop owner", description: "Zyene AI crafts replies that are direct, honest, and professional — matching the tone of a real shop owner, not a corporate script." },
            { title: "Resolve estimate disputes privately", description: "When a customer is upset about their bill, the Negative Feedback Shield gives you the chance to make it right before they post a 1-star review. Most complaints resolved privately never go public." },
            { title: "See how you compare to the shop down the street", description: "Track up to 10 nearby competitors. See their star rating, review volume, and response rate — and identify exactly what's driving customers to choose them over you." },
        ],
        useCase: {
            startingPoint: "An independent shop has a smaller public review footprint than nearby chains and handles estimate disputes without a consistent follow-up process.",
            workflow: "Send the same honest review request after completed repairs, centralize alerts, respond to feedback, and monitor public competitor rating and volume changes.",
            measures: "Track delivery, response coverage, review volume, rating distribution, and issue-resolution time. Local position must be measured separately and is not a promised outcome.",
        },
        ctaJoinCopy: "Join other auto repair shops on Zyene",
        imagePath: "/images/industries/auto-repair.png",
    },

    // ── 4. Salons & Spas ─────────────────────────────────────────────────────
    {
        slug: "salons",
        name: "Salons & Spas",
        nameSingular: "Salon or Spa",
        ownerTitle: "salon owner",
        heroHeadline: "Review Management Built for Salons & Spas",
        heroSub: "Salon and spa owners use Zyene Reviews to grow their 5-star review count, respond to clients professionally, and shield their reputation from bad experiences.",
        emoji: "💅",
        accentColor: "pink",
        metaTitle: "Salon & Spa Review Management",
        metaDescription:
            "Salons and spas grow Google reviews with automated requests, AI replies, and the Negative Feedback Shield. Built for beauty businesses from $29.99/mo.",
        targetKeywords: ["salon review management", "spa google reviews", "hair salon reputation management", "beauty salon reviews"],
        painPoints: [
            {
                stat: "86% of clients",
                title: "Clients book based on reviews and photos",
                description: "86% of women say online reviews are just as trustworthy as personal recommendations when choosing a salon. Your Google profile and review count is your storefront — before anyone walks in.",
            },
            {
                stat: "1 bad color job",
                title: "One disappointed client can go viral",
                description: "In the beauty industry, a bad haircut or coloring experience shared on social media — or in a Google review — can damage your reputation with hundreds of prospective clients in days.",
            },
            {
                stat: "Booking platforms",
                title: "Clients trust Google more than booking apps",
                description: "While Vagaro and StyleSeat have their own reviews, Google Reviews dominate local search. Businesses with 100+ Google reviews appear significantly higher in map searches than those with 10–20.",
            },
        ],
        solutions: [
            { title: "Automated requests after every appointment", description: "Send a branded review request via SMS or email automatically after each appointment — when the client is freshly satisfied and still glowing from the service." },
            { title: "AI replies that sound personal, not generic", description: "Zyene AI crafts warm, personalized reply suggestions that sound like they came from you — not from a template. Edit in seconds and publish with one click." },
            { title: "Handle disappointed clients before they post", description: "When a client isn't happy with their cut or color, the Negative Feedback Shield routes their feedback to a private resolution — giving you the chance to rebook them and fix it." },
            { title: "Stay ahead of nearby salons", description: "The competitor tracker monitors nearby salons and spas. Know when a competitor is getting more reviews than you — and respond before it affects your bookings." },
        ],
        useCase: {
            startingPoint: "A salon relies on occasional organic reviews and has no consistent workflow for appointment follow-up or service-recovery feedback.",
            workflow: "Send policy-compliant follow-ups after appointments, centralize new-review alerts, and give staff a clear process for editing and approving reply drafts.",
            measures: "Track request delivery, new review volume, response time, rebooking, and feedback resolution. Booking or rating lift must be measured from the salon's own data.",
        },
        ctaJoinCopy: "Join other salon and spa owners on Zyene",
        imagePath: "/images/industries/salons.png",
    },

    // ── 5. Home Services ─────────────────────────────────────────────────────
    {
        slug: "home-services",
        name: "Home Services",
        nameSingular: "Home Services Business",
        ownerTitle: "home services professional",
        heroHeadline: "Review Management Built for Home Services",
        heroSub: "Plumbers, HVAC technicians, electricians, and other home services professionals use Zyene Reviews to build trust online and win more jobs.",
        emoji: "🏠",
        accentColor: "teal",
        metaTitle: "Home Services Review Management",
        metaDescription:
            "Plumbers, HVAC, and electricians win more jobs with review automation, AI replies, and private negative feedback routing. From $29.99/mo.",
        targetKeywords: ["plumber reviews", "HVAC reputation management", "home services google reviews", "electrician review management", "contractor reputation management"],
        painPoints: [
            {
                stat: "82% of homeowners",
                title: "Homeowners only hire who they trust online",
                description: "82% of homeowners say they won't hire a home services company without reading reviews first. Letting a stranger into your home is a big decision — your Google reviews are the trust signal that makes or breaks the call.",
            },
            {
                stat: "Seasonal spikes",
                title: "Your busiest seasons need the freshest reviews",
                description: "HVAC businesses need strong reviews before summer and winter. Plumbers need them before the holiday season. Recent reviews give customers a more current picture of the service they can expect.",
            },
            {
                stat: "Pricing disputes",
                title: "Price surprises are your biggest review risk",
                description: "Unexpected charges, scope changes, and billing issues are the #1 source of 1-star reviews for home services. Without a private resolution path, upset homeowners post publicly.",
            },
        ],
        solutions: [
            { title: "Request reviews the moment the job is done", description: "Trigger a review request automatically when a job is marked complete — via SMS or email — when the homeowner's satisfaction is highest." },
            { title: "AI replies that sound like a real professional", description: "Whether you're a solo plumber or a 10-truck HVAC company, Zyene AI crafts professional, specific replies — not generic copy-paste responses." },
            { title: "Privately resolve pricing disputes", description: "The Negative Feedback Shield intercepts unhappy homeowners and gives you the chance to make it right. Most pricing disputes resolved privately never become public 1-star reviews." },
            { title: "Win seasonal search ranking battles", description: "Track competitor review volume and freshness across your service area. Stay ahead before peak season hits by proactively collecting reviews during quieter months." },
        ],
        useCase: {
            startingPoint: "A home-services team completes many jobs but asks for reviews inconsistently and notices pricing complaints only after they become public.",
            workflow: "Connect the job-completion workflow, send consented follow-ups, centralize feedback, and compare public review trends with nearby providers before peak season.",
            measures: "Track request delivery, review volume, rating distribution, response time, and resolved service issues. Maps position depends on relevance, distance, and broader prominence signals.",
        },
        ctaJoinCopy: "Join other home services professionals on Zyene",
        imagePath: "/images/industries/home-services.png",
    },

    // ── 6. Medical / Healthcare ──────────────────────────────────────────────
    {
        slug: "medical",
        name: "Medical & Healthcare",
        nameSingular: "Medical Practice",
        ownerTitle: "healthcare provider",
        heroHeadline: "Review Management Built for Medical Practices",
        heroSub: "Doctors, clinics, and healthcare providers use Zyene Reviews to attract new patients, respond professionally to reviews, and protect their practice's reputation.",
        emoji: "🏥",
        accentColor: "blue",
        metaTitle: "Medical Practice Review Management",
        metaDescription:
            "Medical practices attract patients with ethical review requests, HIPAA-aware AI replies, and the Negative Feedback Shield. From $29.99/mo.",
        targetKeywords: ["doctor review management", "clinic reputation management", "medical practice reviews", "healthcare reputation management", "physician google reviews"],
        painPoints: [
            {
                stat: "71% of patients",
                title: "Patients find their doctor online first",
                description: "71% of patients use online reviews as the first step to finding a new doctor or specialist. A practice with fewer than 4.5 stars or thin review count loses new patients to competitors before the first call.",
            },
            {
                stat: "Wait times",
                title: "Wait time complaints are your biggest review risk",
                description: "Across all medical specialties, wait time and front-desk experience are the top reasons patients leave negative reviews — not clinical outcomes. These complaints are preventable with private resolution.",
            },
            {
                stat: "Multiple platforms",
                title: "Patients review you across Google, Healthgrades, and more",
                description: "Healthcare practices face reviews on more platforms than almost any other industry. Managing them separately is time-consuming and inconsistent — most practices respond to under 20% of their reviews.",
            },
        ],
        solutions: [
            { title: "Automate review requests after each visit", description: "Send a review request via email or SMS after each appointment — timed to arrive when patient satisfaction is highest and the visit is still fresh." },
            { title: "Professional, empathetic AI replies", description: "Zyene's AI reply suggestions are designed for healthcare — always professional and empathetic, never referencing protected health information." },
            { title: "Privately resolve front-desk and wait-time complaints", description: "The Negative Feedback Shield routes upset patients to a private feedback form. Most wait-time and billing complaints can be resolved before they become public 1-star reviews." },
            { title: "Monitor all platforms from one dashboard", description: "Track your Google, Facebook, and other review platforms from one inbox. Set up instant alerts so your team can respond within hours — not days." },
        ],
        useCase: {
            startingPoint: "A medical group has inconsistent location-level review monitoring and no reliable handoff for wait-time or front-desk feedback.",
            workflow: "Use consented post-visit requests, centralize alerts, route operational feedback internally, and require staff review of privacy-aware reply drafts.",
            measures: "Track request delivery, response coverage, time to resolution, and location trends without exposing patient information or promising appointment growth.",
        },
        ctaJoinCopy: "Join other medical practices on Zyene",
        imagePath: "/images/industries/medical.png",
    },

    // ── 7. Hotels & Hospitality ──────────────────────────────────────────────
    {
        slug: "hotels",
        name: "Hotels & Hospitality",
        nameSingular: "Hotel",
        ownerTitle: "hotel owner",
        heroHeadline: "Review Management Built for Hotels & Hospitality",
        heroSub: "Hotels and hospitality businesses use Zyene Reviews to respond to guests faster, protect their reputation, and strengthen their Google Maps presence.",
        emoji: "🏨",
        accentColor: "indigo",
        metaTitle: "Hotel Review Management",
        metaDescription:
            "Hotels respond faster, collect post-stay reviews, and protect ratings with AI replies and the Negative Feedback Shield. From $29.99/mo.",
        targetKeywords: ["hotel review management", "hospitality reviews", "hotel reputation management", "hotel google reviews", "hotel response management"],
        painPoints: [
            {
                stat: "95% of travelers",
                title: "Guests research you before every booking",
                description: "95% of travelers read online reviews before booking a hotel. On OTA platforms and Google both, your rating and recency of reviews are the primary decision factor — before price.",
            },
            {
                stat: "33% more bookings",
                title: "Responding to reviews drives 33% more reservations",
                description: "Hotels that respond to reviews see 33% more bookings on average. Guests aren't just reading reviews — they're watching whether and how you respond to unhappy ones.",
            },
            {
                stat: "Room complaints",
                title: "Room quality complaints are your biggest review risk",
                description: "Noise, cleanliness, and check-in experience are the most common sources of negative hotel reviews. Without a private resolution path, guests go straight to Google and TripAdvisor.",
            },
        ],
        solutions: [
            { title: "Respond to every guest review — instantly with AI", description: "Zyene AI crafts personalized, professional replies that match your hotel's brand voice. Respond to dozens of reviews in minutes, not hours." },
            { title: "Private resolution for room complaints", description: "The Negative Feedback Shield gives unhappy guests a private channel to report issues before they write a public review. Resolving quickly drives loyalty, not churn." },
            { title: "Automate post-checkout review requests", description: "Send a branded review request via email or SMS automatically at checkout — when guests are most likely to write a positive review." },
            { title: "Track your competitive set", description: "Monitor the review volume, rating, and response rate of your competitive set — nearby hotels in the same class — and stay ahead of them in Google Maps ranking." },
        ],
        useCase: {
            startingPoint: "A hotel team responds inconsistently across review channels and lacks a shared process for post-stay requests and room complaints.",
            workflow: "Centralize alerts, send consented post-checkout follow-ups, assign complaints, and review AI-assisted responses before they are published.",
            measures: "Track response coverage, response time, genuine review volume, issue resolution, and direct bookings in separate systems. No booking lift is assumed.",
        },
        ctaJoinCopy: "Join other hotels and hospitality businesses on Zyene",
        imagePath: "/images/industries/hotels.png",
    },

    // ── 8. Fitness ───────────────────────────────────────────────────────────
    {
        slug: "fitness",
        name: "Fitness & Gyms",
        nameSingular: "Fitness Business",
        ownerTitle: "gym or studio owner",
        heroHeadline: "Review Management Built for Fitness & Gyms",
        heroSub: "Gyms, fitness studios, and personal trainers use Zyene Reviews to attract new members, retain existing ones, and protect their reputation online.",
        emoji: "💪",
        accentColor: "green",
        metaTitle: "Gym & Fitness Review Management",
        metaDescription:
            "Gyms and studios attract members with automated review requests, AI replies, and the Negative Feedback Shield. Built for fitness from $29.99/mo.",
        targetKeywords: ["gym reviews", "fitness studio reputation management", "personal trainer reviews", "gym google reviews", "fitness center reputation"],
        painPoints: [
            {
                stat: "New year surge",
                title: "January brings your biggest acquisition window — and most scrutiny",
                description: "Fitness businesses see their highest new member inquiries in January. Prospective members compare gyms on Google before visiting. Stale or low review counts lose sign-ups to newer, more active competitors.",
            },
            {
                stat: "Cancellation reviews",
                title: "Cancellation friction leads to angry 1-star reviews",
                description: "Difficult cancellation processes and membership billing disputes are the #1 source of negative gym reviews. Without a private resolution path, these complaints go straight to Google.",
            },
            {
                stat: "Equipment & cleanliness",
                title: "Facility experience drives review content",
                description: "Equipment quality, cleanliness, and staff attitude are the most-mentioned topics in gym reviews. Knowing what customers are saying — and responding — directly impacts new member decisions.",
            },
        ],
        solutions: [
            { title: "Build review momentum before January", description: "Proactively collect reviews during quieter months so you enter January with a fresh, high-volume review profile that beats competitors in Google Maps results." },
            { title: "AI replies that sound like a real community", description: "Zyene crafts fitness-appropriate reply suggestions — energetic, personal, and on-brand — so your responses feel like they came from a community manager, not a template." },
            { title: "Privately resolve cancellation and billing disputes", description: "The Negative Feedback Shield routes cancellation complaints and billing disputes to a private channel — where you can fix the issue before it becomes a 1-star review." },
            { title: "Track competitor gyms in your area", description: "See how nearby gyms compare on review volume and rating. Know when a competitor is gaining on you — and stay ahead with a proactive review collection strategy." },
        ],
        useCase: {
            startingPoint: "A fitness studio competes with a larger franchise and has no consistent process for first-visit feedback, replies, or cancellation issues.",
            workflow: "Send the same honest follow-up after eligible visits, centralize alerts, route billing concerns, and monitor public competitor review trends.",
            measures: "Track request delivery, response coverage, genuine review volume, cancellations resolved, and local position independently. No ranking or retention result is promised.",
        },
        ctaJoinCopy: "Join other gym and fitness studio owners on Zyene",
        imagePath: "/images/industries/fitness.png",
    },
];

/** Lookup map keyed by slug. */
export const INDUSTRY_MAP: Record<string, IndustryData> = Object.fromEntries(
    INDUSTRIES.map((i) => [i.slug, i])
);

/** All valid industry slugs for generateStaticParams. */
export const INDUSTRY_SLUGS = INDUSTRIES.map((i) => i.slug);
