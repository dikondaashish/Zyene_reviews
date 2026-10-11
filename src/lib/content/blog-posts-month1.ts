/**
 * Blog posts - Month 1 (posts 1-4).
 * Google Reviews Basics + Competitor Analysis.
 */

import type { BlogPost } from "./blog-types";

export const post1: BlogPost = {
    slug: "how-to-get-50-google-reviews-in-30-days",
    title: "How to Get 50 Google Reviews in 30 Days",
    excerpt: "Build a repeatable review-request process over 30 days, with scripts, timing, and a worked planning example. Results depend on your customer volume.",
    pillar: "google-reviews",
    pillarLabel: "Google Reviews",
    publishedAt: "2026-03-10",
    dateModified: "2026-10-11",
    readMinutes: 8,
    author: { name: "Marcus Webb", role: "Local SEO Strategist" },
    metaTitle: "How to Get 50 Google Reviews in 30 Days",
    metaDescription: "A step-by-step playbook for getting 50 Google reviews in 30 days. Includes request scripts, channel selection, a planning example, and automation tips.",
    keywords: ["how to get more google reviews", "get 50 google reviews", "google review strategy", "review request strategy"],
    relatedSlugs: ["why-google-reviews-matter-in-2026", "how-reviews-impact-local-map-pack-ranking", "birdeye-pricing-breakdown-2026"],
    internalLinks: [
        { label: "See how Zyene Reviews automates review requests", href: "/features" },
        { label: "Compare review software pricing (Birdeye vs Zyene Reviews)", href: "/blog/birdeye-pricing-breakdown-2026" },
        { label: "Try Zyene Reviews free for 7 days", href: "/signup" },
    ],
    faqs: [
        {
            question: "How many Google reviews do local businesses need to rank well?",
            answer: "Google publishes no review-count threshold for ranking well. Review count and positive ratings can help local ranking, but relevance, distance, links, and other prominence signals also matter. Use fifty as an operating goal, not an algorithmic cutoff.",
        },
        {
            question: "What is a realistic conversion rate for review request SMS?",
            answer: "There is no universal conversion rate for your business. Establish a baseline from your own campaigns, distinguish link engagement from published reviews, and compare equivalent audiences and time periods.",
        },
        {
            question: "Is it against Google policy to ask customers for reviews?",
            answer: "Ask real customers for their honest feedback without incentives tied to a rating or review text. Set timing, messaging, and routing under your business's documented review process, and check the current provider terms that apply to your business.",
        },
        {
            question: "How fast can a business get 50 Google reviews?",
            answer: "The timeline depends on how many customers you can contact and how many choose to publish a review. Fifty in thirty days is a planning goal, not a promised outcome.",
        },
        {
            question: "Should I use SMS or email for review requests?",
            answer: "Use SMS when you have mobile numbers and short, high-intent touchpoints - restaurants, retail, home services. Use email for healthcare, B2B, or longer sales cycles. Many businesses send SMS first and one email follow-up five to seven days later.",
        },
    ],
    body: [
        { type: "p", text: "If your team asks for reviews inconsistently, it is difficult to learn which requests work. Start by recording your current review count and a repeatable follow-up process." },
        { type: "p", text: "Fifty reviews is a useful operating milestone because it requires a repeatable request process and gives prospective customers more experiences to evaluate. Google publishes no review-count threshold that unlocks a ranking change." },
        { type: "p", text: "The plan below turns review requests into a repeatable 30-day process. It uses honest requests, one follow-up, and a backfill of recent customers; your result will depend on customer volume and response rate." },
        { type: "h2", text: "Use Fifty Reviews as a Planning Goal" },
        {
            type: "summary",
            text: "Google says review count and positive ratings can help local ranking, but it publishes no fifty-review threshold. Treat fifty as a practical process goal that builds a broader evidence base for customers, not as a guaranteed ranking trigger.",
        },
        { type: "p", text: "Google describes local ranking in terms of relevance, distance, and prominence. It specifically says review count and positive ratings can help local ranking, while keeping the full weighting of those and other signals confidential." },
        { type: "p", text: "Read your recent reviews alongside their count. Detailed, relevant experiences help prospective customers understand the service they can expect; a count alone cannot explain that." },
        { type: "h2", text: "The Real Reason You Don't Have 50 Reviews Yet" },
        {
            type: "summary",
            text: "Low review counts can have several causes. Check whether your requests reach customers, whether the link works, and whether your team follows a consistent process. Use feedback to improve the service itself.",
        },
        { type: "p", text: "Do not infer customer satisfaction from a low response rate. Review your request process and talk to customers about their experience before deciding what to change." },
        { type: "tip", text: "Choose a request time that fits your service and documented outreach process. The experience is often easier to recall soon after service, but the right timing varies by audience and channel." },
        { type: "h2", text: "The 30-Day Playbook" },
        {
            type: "summary",
            text: "Week one builds links, scripts, and ask moments; weeks two through four execute asks on every customer plus a one-time backfill from the last 90 days. Follow up once after five to seven days, respond to every new review, and never skip the daily habit when you get busy.",
        },
        { type: "h3", text: "Week 1: Build Your Ask Infrastructure" },
        { type: "ol", items: [
            "Generate your Google review link: Go to your Google Business Profile, click 'Share review form', and copy the direct link. This is the URL you'll use in all your requests.",
            "Create a review request shortlink: Use a URL shortener or your own domain (e.g., yoursite.com/review) so the link looks clean in SMS messages.",
            "Draft your request scripts: Write one for SMS (under 160 characters) and one for email (3-5 sentences max). See scripts below.",
            "Identify your 'ask moments': The specific touchpoints in your customer journey when asking feels natural - checkout, job completion, appointment end.",
        ]},
        { type: "h3", text: "Week 2-4: Execute the Ask at Scale" },
        { type: "ol", items: [
            "Go back 90 days: Export your customer list from your POS, booking system, or CRM. Anyone who did business with you in the last 90 days is a warm candidate. Send them a one-time review request batch.",
            "Ask every new customer going forward: Make the review request part of your standard checkout or follow-up process. Every transaction, every day.",
            "Follow up once (and only once): If a customer doesn't respond in 5-7 days, send one follow-up. Don't send more - it damages the relationship.",
            "Respond to every review you receive: This signals to Google that you're active and encourages more reviews. It also shows new visitors that you care.",
        ]},
        { type: "h2", text: "Exact Request Scripts" },
        {
            type: "summary",
            text: "Keep SMS under 160 characters with a direct Google review link and the customer's name. Email can be slightly longer with one clear CTA. Both should sound grateful, not pushy, and go out while the visit is still fresh in the customer's mind.",
        },
        { type: "h3", text: "SMS Script (Check Length After Personalizing)" },
        { type: "quote", text: "Hi [Name], thanks for visiting [Business Name] today! We'd love a quick Google review - it really helps us grow: [your-review-link] Thank you! 🙏" },
        { type: "h3", text: "Email Script" },
        { type: "quote", text: "Subject: Quick favor from [Business Name]\n\nHi [Name],\n\nThank you for your visit - it was great to see you. If you have 60 seconds, a Google review would mean the world to us and help other [customers/patients/clients] find us.\n\n→ Leave a review here: [your-review-link]\n\nThank you!\n[Your Name]" },
        { type: "h2", text: "SMS vs. Email: Choose Your Channel" },
        {
            type: "summary",
            text: "Choose a channel based on customer preferences, available contact details, and the context you need to provide. Measure your own results; delivery and link engagement are different from a published review.",
        },
        { type: "table", table: {
            headers: ["Channel", "Format", "Measure", "Consideration"],
            rows: [
                ["SMS", "Short message", "Delivery and link engagement", "Use an appropriate mobile contact"],
                ["Email", "More context", "Delivery and link engagement", "Keep one clear call to action"],
                ["Both", "Initial request and one follow-up", "Combined engagement without double-counting", "Avoid duplicate reminders"],
            ],
        }},
        { type: "h2", text: "How to Hit 50 in 30 Days Mathematically" },
        {
            type: "summary",
            text: "Illustrative calculation only: 300 customers multiplied by an assumed 80% contact rate and an assumed 20% publication rate equals 48 reviews. These assumptions are not benchmarks or a forecast.",
        },
        { type: "p", text: "Replace those assumptions with your actual eligible contact count and observed publication rate. If you cannot verify which requests became Google reviews, track request engagement and overall review growth separately." },
        { type: "p", text: "A business with fewer customers may need a longer timeline. Prioritize relevant, welcome requests over reaching an arbitrary count." },
        { type: "tip", text: "Do not offer discounts or rewards tied to a rating or review text. Ask customers professionally and use timing, messaging, and routing that fit your documented process." },
        { type: "h2", text: "Automate It So You Never Miss an Ask" },
        {
            type: "summary",
            text: "Manual texting fails when staff get busy; automation sends review requests at the right moment every time. Tools like Zyene Reviews connect via Zapier, POS, or API so each completed job or checkout triggers SMS or email without someone remembering to ask.",
        },
        { type: "p", text: "The businesses that consistently grow their review count are the ones who have automated the ask. Manually texting every customer doesn't scale, and you'll stop doing it when things get busy." },
        { type: "p", text: "Tools like Zyene Reviews connect to your workflow (via Zapier, Square, or direct API) and send review requests automatically at the right moment - without any manual effort. You set it up once and it works every day, for every customer." },
        { type: "cta", ctaLabel: "See how Zyene Reviews automates review requests →", ctaHref: "/features" },
        { type: "h2", text: "What to Expect" },
        {
            type: "summary",
            text: "Use your current monthly review count as the baseline. After fifty total reviews, keep asking consistently so new customers see recent experiences rather than a profile built from one backfill campaign.",
        },
        { type: "p", text: "Your first-month result depends on daily customer volume, the share of customers you can contact, and your actual conversion rate. Record those three numbers before you start so you can compare the new process with your baseline." },
        { type: "p", text: "Once you cross 50 reviews, keep the same request process running. Google says review count and positive ratings can help local ranking, but it does not publish a fixed monthly target or guarantee a ranking result." },
    ],
};

export const post2: BlogPost = {
    slug: "why-google-reviews-matter-in-2026",
    title: "Why Google Reviews Matter More Than Ever in 2026",
    excerpt: "How Google Reviews support local search, customer decisions, and day-to-day reputation work for local businesses in 2026.",
    pillar: "google-reviews",
    pillarLabel: "Google Reviews",
    publishedAt: "2026-03-17",
    dateModified: "2026-10-11",
    readMinutes: 7,
    author: { name: "Zyene Reviews Team", role: "Editorial" },
    metaTitle: "Why Google Reviews Matter More Than Ever in 2026",
    metaDescription: "Google Reviews in 2026: how they support local search visibility, customer trust, and better reputation operations for local businesses.",
    keywords: ["why google reviews matter", "google reviews 2026", "google reviews local seo", "google reviews importance"],
    relatedSlugs: ["how-to-get-50-google-reviews-in-30-days", "how-reviews-impact-local-map-pack-ranking", "birdeye-pricing-breakdown-2026"],
    internalLinks: [
        { label: "Learn about Zyene Reviews' review monitoring", href: "/features" },
        { label: "Compare review tool pricing (Birdeye vs Zyene Reviews)", href: "/blog/birdeye-pricing-breakdown-2026" },
        { label: "See industry-specific strategies", href: "/industries" },
    ],
    faqs: [
        {
            question: "Do Google Reviews still matter for local SEO in 2026?",
            answer: "Yes. Google says review count and positive ratings can help local ranking, and reviews help customers evaluate a business. They are one part of prominence alongside links, articles, directories, and other information Google has about the business.",
        },
        {
            question: "How many Google reviews does a local business need?",
            answer: "There is no official minimum, but many markets become competitive around fifty total reviews with steady new reviews each month. Recency often matters as much as total count - a profile with mostly old reviews can lose to a competitor getting fresh feedback every week.",
        },
        {
            question: "Does responding to Google reviews help rankings?",
            answer: "Google recommends helpful replies because they show that you value customer feedback and can help your profile stand out. Google does not publish response rate as a separate ranking factor. Reply promptly because customers read the exchange, not to chase an undisclosed algorithm score.",
        },
        {
            question: "How do reviews affect Google AI Overviews for local searches?",
            answer: "Google does not publish a review-specific weighting for AI Overviews. Its official guidance says normal SEO fundamentals still apply, Business Profile information should stay current, and inclusion is never guaranteed. Reviews remain useful customer evidence, but they are not a documented shortcut into an AI Overview.",
        },
        {
            question: "Can Zyene Reviews help manage all of this in one place?",
            answer: "Zyene Reviews centralizes monitoring for Google, Facebook, and Yelp, sends SMS and email review requests, drafts AI replies you can edit before posting, and includes Negative Feedback Shield on paid plans to give low ratings a private feedback path and alert your team.",
        },
    ],
    body: [
        { type: "p", text: "Google Reviews are both public customer evidence and one input into local prominence. Managing them consistently helps prospective customers evaluate your business and keeps your Business Profile useful, but no review tactic guarantees a particular search position." },
        { type: "p", text: "Here's what's changed and why it matters more now than it ever has." },
        { type: "h2", text: "Reviews Still Matter as Search Adds AI Features" },
        {
            type: "summary",
            text: "Google publishes no review-specific weighting for AI Overviews. Its guidance is to keep using sound SEO fundamentals and accurate Business Profile information; reviews support customer trust, but they do not guarantee inclusion in an AI response.",
        },
        { type: "p", text: "AI Overviews and AI Mode can surface links from multiple searches and sources. Google says there are no special optimization requirements beyond established Search fundamentals, including indexable, helpful content and accurate Business Profile information." },
        { type: "p", text: "A healthy review profile still helps people assess your business wherever the profile appears. Keep the facts and reviews current, then measure actual Search Console traffic and manually inspect relevant AI results instead of assuming reviews caused inclusion." },
        { type: "h2", text: "The Local 3-Pack: Your Revenue Engine" },
        {
            type: "summary",
            text: "The Maps 3-Pack can be an important discovery surface. Google says local results mainly depend on relevance, distance, and prominence; review count and positive ratings can help, but no single input determines placement.",
        },
        { type: "p", text: "Google Maps' Local 3-Pack presents three nearby businesses for a local query. Its value varies by market and query, so evaluate it with your own Business Profile performance and Search Console data rather than a universal click-share claim." },
        { type: "p", text: "Google describes the main local ranking factors as relevance, distance, and prominence. Prominence can reflect reviews, ratings, links, articles, directories, and offline recognition, so it is only partly under a business owner's control." },
        { type: "tip", text: "More reviews and positive ratings can help local ranking, but Google publishes no formula that lets review count override distance or relevance. Compare your own profile with nearby results instead of relying on a universal threshold." },
        { type: "h2", text: "Consumer Psychology: The Numbers Behind Reviews" },
        {
            type: "summary",
            text: "Reviews help shoppers evaluate a business, but a survey percentage is not a forecast for your market. Use the checks below to understand your own customers and search performance.",
        },
        { type: "table", table: {
            headers: ["Question", "Evidence to collect"],
            rows: [
                ["Are customers finding the profile?", "Business Profile performance and referral questions"],
                ["What do people mention in feedback?", "Recent reviews, grouped by topic"],
                ["Are replies timely and useful?", "Response coverage and staff review"],
                ["Are profile visits producing enquiries?", "Qualified calls and bookings with source capture"],
                ["What affects local ranking?", "Google describes relevance, distance and prominence"],
            ],
        }},
        { type: "h2", text: "The Trust Gap: New vs. Established Businesses" },
        {
            type: "summary",
            text: "A newer business with many recent reviews can out-convert an older brand with a handful of stale ones. Until you build volume, searchers assume risk - closing that gap quickly is a revenue problem, not just a marketing vanity metric.",
        },
        { type: "p", text: "One of the most underappreciated advantages of reviews is that they level the playing field between new businesses and established ones. A 2-year-old restaurant with 200 Google reviews can outcompete a 20-year-old institution with 30 reviews in terms of new customer acquisition." },
        { type: "p", text: "At the same time, this creates an urgent problem for new businesses: until you've built a review base, you're invisible to the majority of potential customers who are searching online. The faster you build your review profile, the faster you close the trust gap." },
        { type: "h2", text: "Review Recency and Customer Confidence" },
        {
            type: "summary",
            text: "Recent reviews give customers a current view of the business. Treat collection as an ongoing operation, but set a pace that matches real customer volume rather than claiming a published Google freshness threshold.",
        },
        { type: "p", text: "A profile whose reviews all describe service from years ago gives prospective customers less current evidence than one receiving steady, genuine feedback. Google does not publish a ninety-day review-weighting rule, so recency should be presented as a customer-trust and operating-health measure." },
        { type: "p", text: "This is why review management isn't a 'get to 50 and stop' project. It's an ongoing operation. Aim for a minimum of 5-10 new reviews per month to maintain freshness." },
        { type: "h2", text: "Response Rate: A Customer Trust Signal" },
        {
            type: "summary",
            text: "Replying to reviews signals an actively managed Business Profile and shows prospects how you handle criticism. A thoughtful answer to a three-star review often persuades more buyers than another generic five-star thank-you.",
        },
        { type: "p", text: "Google recommends helpful replies because they show that a business values customer feedback and can help the profile stand out. It does not publish response rate as a separate ranking factor, so measure replies by customer coverage and response time rather than an invented ranking benefit." },
        { type: "p", text: "Beyond the algorithmic benefit, responses serve a practical purpose: they're public messages that show potential customers how you handle feedback. A gracious, specific response to a 3-star review often does more to convert a hesitant visitor than five more 5-star reviews." },
        { type: "tip", text: "Aim to respond to 100% of your reviews - positive and negative. For 5-star reviews, a short thank-you that mentions a specific detail is better than a generic 'Thanks for the 5 stars!'. For negative reviews, the 3-part framework works best: Acknowledge, Apologize, Offer to resolve." },
        { type: "h2", text: "What This Means for Your Business Today" },
        {
            type: "summary",
            text: "Ignoring reviews means losing customers to competitors who monitor, ask, and reply. With the right workflow - Zyene Reviews' inbox, alerts, and AI drafts included - most owners spend twenty to thirty minutes a week, not a full-time role.",
        },
        { type: "p", text: "If you're not actively collecting reviews, responding to all of them, and monitoring your rating across platforms, you are losing customers every day to competitors who are. This isn't a marketing nice-to-have - it's table stakes for local business survival in 2026." },
        { type: "p", text: "The good news: with the right tools and a consistent process, building and maintaining a strong review profile is a 20-30 minute per week activity, not a full-time job." },
        { type: "cta", ctaLabel: "See how Zyene Reviews manages your entire review profile →", ctaHref: "/features" },
    ],
};

export { post3 } from "@/lib/content/blog-posts-birdeye-pricing";
export { post4 } from "@/lib/content/blog-posts-birdeye-alternatives";
