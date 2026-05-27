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
    ownerName: string;
    ownerContext: string;
    challengeBefore: string;
    actionTaken: string;
    resultAfter: string;
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
            ownerName: "Marco",
            ownerContext: "owner of a 3-location Italian restaurant group in Austin, TX",
            challengeBefore: "Marco was getting 3–4 new Google reviews a week across all 3 locations but responding to fewer than 1 in 5. Two locations had dropped below 4.3 stars after a rough few weeks. His team didn't have time to monitor reviews across Google, Yelp, and Facebook separately.",
            actionTaken: "Marco connected all 3 locations to Zyene in under 10 minutes. He turned on the Negative Feedback Shield for all locations and set up AI auto-reply for 4-star and 5-star reviews. He started sending review requests via QR codes at the table.",
            resultAfter: "Within 60 days, all 3 locations were above 4.6 stars. Review volume tripled. His team now spends 20 minutes a week on reputation management instead of 3 hours — and 8 unhappy customers were privately resolved before they could write public reviews.",
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
            ownerName: "Dr. Priya",
            ownerContext: "owner of a 2-location dental practice in Phoenix, AZ",
            challengeBefore: "Dr. Priya's practices had been open for 4 years but had only 31 Google reviews combined. A competitor 2 miles away had 340 reviews and was consistently outranking her in Google Maps searches for 'dentist near me'.",
            actionTaken: "She connected both locations to Zyene and set up automated SMS review requests to send 3 hours after each checkout. She activated the Negative Feedback Shield and enabled AI auto-reply for all 4 and 5-star reviews.",
            resultAfter: "In 90 days, both locations had 80+ new reviews. Dr. Priya's main location moved from the 4th result to the 2nd result for 'dentist near me' in her neighborhood. Three billing complaints were privately resolved through the Shield before going public.",
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
            ownerName: "Carlos",
            ownerContext: "owner of an independent auto repair shop in Dallas, TX",
            challengeBefore: "Carlos's shop had 4.1 stars on Google from 45 reviews. A national chain opened half a mile away and quickly accumulated 200+ reviews. Carlos was losing first-time customers who were comparing him on Google and choosing the chain.",
            actionTaken: "Carlos started sending SMS review requests after every completed repair using Zyene. He activated the Negative Feedback Shield and competitor tracking for the chain and two other nearby shops.",
            resultAfter: "In 4 months, his review count grew from 45 to 180 with a 4.8-star average. He outranked the chain for 'auto repair near me' in his zip code. Two estimate-dispute complaints were privately resolved through the Shield.",
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
            ownerName: "Jasmine",
            ownerContext: "owner of a boutique hair salon in Chicago, IL",
            challengeBefore: "Jasmine's salon had 4.3 stars from 28 reviews after 3 years in business. She was losing new client bookings to a newer salon nearby that had 150 reviews and a 4.8-star average. Jasmine knew her service was better, but her online presence didn't reflect it.",
            actionTaken: "She connected her salon to Zyene and set up automated SMS review requests to send 2 hours after each appointment. She activated the Negative Feedback Shield and turned on AI auto-reply for 5-star reviews.",
            resultAfter: "In 6 weeks, Jasmine's review count jumped from 28 to 94. Her rating climbed to 4.8 stars. Bookings from Google increased by 40%. Two clients who were disappointed with their color were privately resolved and both rebooked.",
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
                description: "HVAC businesses need strong reviews before summer and winter. Plumbers need them before the holiday season. Reviews older than 3 months carry less weight with Google's local ranking algorithm.",
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
            ownerName: "Dave",
            ownerContext: "owner of a residential HVAC company serving the Denver metro area",
            challengeBefore: "Dave's company had 4.2 stars from 52 Google reviews built up over 6 years. His team was doing great work but no one was asking for reviews. Going into summer, three large HVAC competitors in his area all had 200+ reviews and were ranking above him in Google Maps.",
            actionTaken: "Dave integrated Zyene with his field service software via Zapier, triggering a review request 1 hour after each job was closed out. He activated the Negative Feedback Shield and competitor tracking.",
            resultAfter: "In 90 days, his review count grew from 52 to 210 with a 4.8-star rating. He ranked in the top 3 on Google Maps for 'HVAC near me' in his area for the first time. Two pricing disputes were resolved privately through the Shield.",
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
            ownerName: "Dr. Amir",
            ownerContext: "family practice physician with 2 locations in the suburbs of Atlanta, GA",
            challengeBefore: "Dr. Amir had 3.9 stars across both locations combined from inconsistent, mostly negative reviews about wait times. Insurance patients were choosing competitors with better-looking Google profiles. His team had no system for monitoring or responding to reviews.",
            actionTaken: "He connected both practices to Zyene and set up post-visit SMS review requests. The Negative Feedback Shield was activated. His front desk team now gets alerts and uses AI reply suggestions to respond within 24 hours.",
            resultAfter: "In 4 months, both locations climbed above 4.5 stars. New patient appointments increased by 22%. Six wait-time complaints were privately resolved through the Shield before going public.",
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
        heroSub: "Hotels and hospitality businesses use Zyene Reviews to respond to guests faster, protect their reputation, and rank higher on Google Maps.",
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
            ownerName: "Sarah",
            ownerContext: "general manager of a 60-room boutique hotel in Nashville, TN",
            challengeBefore: "Sarah's hotel had 4.2 stars on Google from 145 reviews. Two newer boutique hotels nearby both had 4.7+ stars and were consistently outranking her in Google Maps and appearing higher on Google Hotel Search. Her team was only responding to about 1 in 5 reviews.",
            actionTaken: "Sarah connected the hotel to Zyene and turned on AI auto-reply for all 4-star and 5-star reviews. She set up automated post-checkout email review requests. The Negative Feedback Shield was activated for room complaints.",
            resultAfter: "In 45 days, response rate went from 20% to 98%. The hotel's rating climbed to 4.6 stars and monthly review volume tripled. Direct bookings from Google increased by 18%. Five room complaints were privately resolved before being posted publicly.",
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
            ownerName: "Tyler",
            ownerContext: "owner of a boutique CrossFit-style gym in Seattle, WA",
            challengeBefore: "Tyler's gym had 4.3 stars from 41 reviews after 3 years. A large franchise gym opened nearby with a marketing budget Tyler couldn't match. The franchise quickly accumulated 300+ reviews and was consistently outranking Tyler's gym for 'gym near me' searches.",
            actionTaken: "Tyler set up Zyene to send automated review requests 24 hours after every new member's first class. He activated the Negative Feedback Shield for cancellation requests and competitor tracking for the franchise gym.",
            resultAfter: "In 5 months, Tyler's review count grew from 41 to 210 with a 4.9-star average. His gym outranked the franchise for 'CrossFit near me' in his neighborhood. Five cancellation complaints were privately resolved through the Shield, and 3 of those members stayed.",
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
