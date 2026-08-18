/**
 * Blog posts — Month 2 (posts 5–8).
 * Response Templates + Local SEO.
 */

import type { BlogPost } from "./blog-types";

export const post5: BlogPost = {
    slug: "how-to-respond-to-a-1-star-review",
    title: "How to Respond to a 1-Star Review (With 5 Real Templates)",
    excerpt: "A bad review isn't a crisis — it's an opportunity. Here's the 5-step framework and 5 real response templates for turning a 1-star review into a trust builder.",
    pillar: "responding-to-reviews",
    pillarLabel: "Responding to Reviews",
    publishedAt: "2026-04-07",
    dateModified: "2026-05-24",
    readMinutes: 8,
    author: { name: "Priya Sharma", role: "Reputation Management" },
    metaTitle: "How to Respond to a 1-Star Google Review (5 Templates)",
    metaDescription: "Proven 5-step framework and 5 ready-to-use templates for responding to 1-star Google reviews. Turn bad reviews into trust signals for new customers.",
    keywords: ["how to respond to a 1 star review", "respond to negative review", "bad google review response", "1 star review template", "negative review response"],
    relatedSlugs: ["ai-reply-mistakes-to-avoid", "why-google-reviews-matter-in-2026"],
    internalLinks: [
        { label: "See how Zyene Reviews' AI replies work", href: "/features" },
        { label: "Check out our negative review response template library", href: "/resources/negative-review-templates" },
    ],
    faqs: [
        {
            question: "Should I respond to every one-star Google review?",
            answer: "Yes. Prospects read negative reviews specifically to see how you handle problems. A calm, specific public reply within twenty-four to forty-eight hours beats silence—even when you move the real fix to email or phone.",
        },
        {
            question: "Can I offer a refund in my public response?",
            answer: "Avoid negotiating compensation in the thread. Invite the reviewer to contact you privately. Public refund offers can attract bad-faith reviews and make you look defensive to everyone else reading.",
        },
        {
            question: "How long should a one-star review response be?",
            answer: "Three to five sentences is enough: acknowledge, apologize for their experience, take responsibility where fair, offer a private resolution path, and close professionally. Long essays read as defensive.",
        },
        {
            question: "Can Zyene Reviews help draft one-star responses?",
            answer: "Zyene Reviews' AI suggest-reply flow gives you a structured starting point per review. Always personalize with details from their comment—never post a generic draft unchanged.",
        },
        {
            question: "What if the one-star review is unfair or fake?",
            answer: "Still respond professionally while you flag it through Google. See our fake-review guide for documentation steps. Zyene Reviews alerts you quickly so you can reply and report within hours, not weeks.",
        },
    ],
    body: [
        { type: "p", text: "A 1-star review lands in your inbox and your stomach drops. Your first instinct might be to ignore it, argue with it, or delete your account entirely. All of these are the wrong move." },
        { type: "p", text: "Here's the counterintuitive truth: a well-handled 1-star review with a thoughtful response can be more valuable to your reputation than five 5-star reviews with no response. Potential customers read 1-star reviews specifically to see how you handle adversity." },
        { type: "h2", text: "Why Your Response Matters More Than the Review" },
        {
            type: "summary",
            text: "Shoppers judge you by how you handle adversity, not by the complaint alone. A measured reply to a one-star review often converts fence-sitters; an unanswered negative review signals neglect.",
        },
        { type: "p", text: "When someone is deciding whether to visit your business, a negative review with a response like 'We're so sorry you had this experience, John. We've addressed this with our team and would love to make it right — please email us at [address]' communicates several things simultaneously: you're listening, you take feedback seriously, you act on it, and you're professional under pressure." },
        { type: "p", text: "Reviews without responses signal the opposite: that you don't care, you're not paying attention, or you have something to hide. 53% of consumers expect a business to respond to reviews within a week. When you don't, they notice." },
        { type: "h2", text: "The 5-Step Response Framework" },
        {
            type: "summary",
            text: "Use five moves: acknowledge, apologize for their experience, own real mistakes briefly, offer private resolution with contact info, and close with professionalism. Never debate facts in public.",
        },
        { type: "ol", items: [
            "Acknowledge: Start by acknowledging the customer's experience without getting defensive. Use their name if visible in the review.",
            "Apologize: Express genuine regret — not necessarily for wrongdoing, but for the fact that their experience didn't meet expectations. 'We're sorry your visit didn't go as expected' works even when the complaint is unfair.",
            "Take responsibility (where appropriate): If a mistake was made, own it briefly and specifically. Don't be vague — 'the wait time was unacceptable on that day' is better than 'sometimes things don't go as planned'.",
            "Offer resolution: Always offer to make it right. Give them a direct contact method — an email address or phone number — so the conversation can continue privately. Never negotiate publicly.",
            "Close gracefully: End with an invitation to return, a commitment to do better, or a direct thank-you for the feedback. Keep it professional and human.",
        ]},
        { type: "h2", text: "Template 1: Service Quality Complaint" },
        {
            type: "summary",
            text: "When service missed the mark, name the gap without excuses, route them to email, and show the team heard it. Swap bracketed fields for real details from their review.",
        },
        { type: "quote", text: "Hi [Name], thank you for taking the time to leave this feedback. We're genuinely sorry your experience didn't reflect the quality we work hard to deliver. What you described is not the standard we hold ourselves to, and I've shared your feedback directly with our team. We'd love the opportunity to make this right — please email us at [email] and we'll take care of you. Thank you again for letting us know." },
        { type: "h2", text: "Template 2: Wait Time / Speed Complaint" },
        {
            type: "summary",
            text: "Acknowledge their time was wasted, cite the operational fix you're making if true, and invite them back through a manager contact—without arguing about how busy the room was.",
        },
        { type: "quote", text: "Hi [Name], we're sorry the wait time on your visit was longer than expected — we know your time is valuable. [Day/time] can be unexpectedly busy for us, and we clearly fell short of managing it well that day. We're working on [specific improvement, e.g., staffing, process]. We'd love to earn your business back — please reach out to [email] and we'll make your next visit right." },
        { type: "h2", text: "Template 3: Billing or Pricing Dispute" },
        {
            type: "summary",
            text: "Billing disputes need a named manager and a private review of the account. Stay neutral in public—assume readers do not know your policies yet.",
        },
        { type: "quote", text: "Hi [Name], thank you for sharing this. We never want a customer to feel surprised or unfairly charged, and I'm sorry this was your experience. Billing details vary by situation, and I'd like to understand yours specifically. Please reach out to us at [email] or call [phone] and ask for [manager name] — I'll personally review your account and make sure we get this resolved. Thank you for giving us the chance to address it." },
        { type: "h2", text: "Template 4: Rude Staff Complaint" },
        {
            type: "summary",
            text: "Show leadership takes conduct seriously, mention internal follow-up without gossiping about employees, and ask for a direct conversation to learn specifics.",
        },
        { type: "quote", text: "Hi [Name], we take feedback about our team's conduct seriously, and I'm sorry your interaction fell short of the warm, professional experience we work to provide. I've shared your review with our management team. We'd be grateful for the chance to learn more about what happened — please reach out at [email]. Your feedback helps us improve, and we appreciate you taking the time to share it." },
        { type: "h2", text: "Template 5: Vague or Unclear Complaint" },
        {
            type: "summary",
            text: "Vague one-stars still deserve a reply: express regret, invite specifics offline, and avoid guessing what went wrong in public—that can backfire if you misread the situation.",
        },
        { type: "quote", text: "Hi [Name], we're sorry to see you had a disappointing experience. We'd genuinely like to understand what happened so we can make it right. Please reach out to us at [email] — we'd love to speak with you directly and address your concerns. Thank you for letting us know." },
        { type: "h2", text: "What NOT to Do" },
        {
            type: "summary",
            text: "Do not argue, post refunds publicly, recycle the same template verbatim, or wait a week. Short, specific, timely replies protect your brand more than winning the argument online.",
        },
        { type: "ul", items: [
            "Don't argue: Even if the reviewer is factually wrong, a public argument makes you look worse than the original review. Never debate the details publicly.",
            "Don't offer refunds publicly: Offering compensation in a public response invites review fraud. Handle it privately.",
            "Don't use the same template for every review: Reviewers and potential customers can tell. Specific, personal responses are far more effective.",
            "Don't wait: Respond within 24–48 hours. The longer you wait, the more people see an unanswered negative review.",
            "Don't write a novel: Keep responses to 3–5 sentences. Overly long responses look defensive.",
        ]},
        { type: "tip", text: "Using AI tools like Zyene Reviews' reply suggestions can give you a well-structured starting point for each response that you then personalize. The key word is personalize — always edit the AI draft to include specific details from the review." },
        { type: "cta", ctaLabel: "Get 20+ response templates in our free template library →", ctaHref: "/resources/negative-review-templates" },
    ],
};

export const post6: BlogPost = {
    slug: "ai-reply-mistakes-to-avoid",
    title: "5 AI Reply Mistakes to Avoid When Responding to Reviews",
    excerpt: "AI reply tools can save hours every week — but only if you use them correctly. These 5 mistakes will make your AI responses hurt your reputation instead of helping it.",
    pillar: "responding-to-reviews",
    pillarLabel: "Responding to Reviews",
    publishedAt: "2026-04-14",
    dateModified: "2026-05-24",
    readMinutes: 6,
    author: { name: "Zyene Reviews Team", role: "Editorial" },
    metaTitle: "5 AI Reply Mistakes to Avoid for Google Reviews",
    metaDescription: "Using AI to respond to reviews? Avoid these 5 common mistakes that make AI replies backfire. Learn how to use AI reply tools correctly for Google reviews.",
    keywords: ["ai reply mistakes", "ai review responses", "ai google review reply", "how to respond to reviews with ai", "review response ai tips"],
    relatedSlugs: ["how-to-respond-to-a-1-star-review", "why-google-reviews-matter-in-2026"],
    internalLinks: [
        { label: "Try Zyene Reviews' AI reply feature", href: "/features" },
    ],
    faqs: [
        {
            question: "Is it okay to post AI-generated Google review replies?",
            answer: "Yes, if you edit them. Use AI for structure and tone, then add specifics from the customer's review. Unedited AI posts sound identical and can hurt trust more than they save time.",
        },
        {
            question: "What is the biggest mistake with AI review responses?",
            answer: "Publishing the first draft unchanged. Always reference something concrete—the dish, staff member, appointment type, or issue they mentioned—so readers know a human reviewed the reply.",
        },
        {
            question: "Should I use AI for negative reviews?",
            answer: "AI can outline a calm framework, but you must remove defensive phrasing and add a private contact path. Read the final reply as a skeptical customer before you publish.",
        },
        {
            question: "How does Zyene Reviews' AI reply feature work?",
            answer: "Zyene Reviews suggests professional, friendly, or concise drafts from the review text in your inbox. You edit and post—Zyene Reviews does not auto-publish without your approval on standard workflows.",
        },
        {
            question: "Do AI replies help local SEO?",
            answer: "Google indexes response text. Natural mentions of services or neighborhood context can support relevance, but keyword stuffing in replies looks spammy and should be avoided.",
        },
    ],
    body: [
        { type: "p", text: "AI tools for review responses are a genuine productivity breakthrough. The ability to generate a professional, well-structured reply to any review in seconds — rather than spending 5–10 minutes per response — can save a business owner several hours every week." },
        { type: "p", text: "But AI replies done wrong can actively damage your reputation. Here are the 5 mistakes we see most often, and exactly how to avoid each one." },
        { type: "h2", text: "Mistake 1: Publishing AI Replies Without Editing" },
        {
            type: "summary",
            text: "Raw AI drafts miss context—your menu, your policies, the actual complaint. Treat every suggestion as a first draft and add at least one detail only a human who read the review would know.",
        },
        { type: "p", text: "This is the most common and most damaging mistake. AI models generate grammatically correct, professionally-toned responses — but they don't know your customer, your business, or the specific context of the review." },
        { type: "p", text: "A response to 'Great burger!' that says 'Thank you for visiting [Business Name]! We're delighted you enjoyed your experience with our culinary offerings and look forward to welcoming you again!' sounds robotic and generic. Regulars will notice. New visitors will notice." },
        { type: "tip", text: "Treat AI replies as first drafts, never final drafts. Always add at least one specific detail from the review (the dish they mentioned, the service they praised, the staff member they named) before publishing." },
        { type: "h2", text: "Mistake 2: Using the Same Opening Phrase for Every Review" },
        {
            type: "summary",
            text: "Repeated openers like Thank you for your wonderful review train customers and Google that nobody is really listening. Rotate openings and reference something unique in each reply.",
        },
        { type: "p", text: "AI models default to predictable opening phrases: 'Thank you for your wonderful review!', 'We're so glad you enjoyed your visit!', 'We appreciate you taking the time to share your feedback!'. When all 50 of your recent review responses start with the same sentence, it's a clear signal — to both customers and Google — that no human is actually reading or responding." },
        { type: "ul", items: [
            "✗ 'Thank you for your wonderful review!' (used 47 times)",
            "✓ 'Great to hear about the tacos, Maria — our kitchen team will love this.'",
            "✓ 'Thanks, James! The Friday night crowd does move fast, so glad we could still take care of you.'",
        ]},
        { type: "h2", text: "Mistake 3: Ignoring 3-Star Reviews" },
        {
            type: "summary",
            text: "Three-star reviews are lukewarm customers you can still win. A thoughtful reply that addresses what fell short—and invites them back—often outperforms another generic thank-you on a five-star.",
        },
        { type: "p", text: "Most businesses focus their review response energy on the extremes — effusively thanking 5-star reviewers and carefully managing 1-star ones. But 3-star reviews are where the real conversion opportunity lives." },
        { type: "p", text: "A 3-star review means a customer had a mixed experience — good enough to come back, but not good enough to recommend. A thoughtful, specific response to a 3-star review that addresses what went wrong and invites them back converts 'meh' customers into loyal advocates more often than any other response type." },
        { type: "h2", text: "Mistake 4: Defensive Responses to Negative Reviews" },
        {
            type: "summary",
            text: "Models slip into corporate deflection—while we strive for excellence. Read negative drafts aloud; if you sound like you're protecting your reputation instead of their experience, rewrite.",
        },
        { type: "p", text: "AI models, when prompted with a negative review, sometimes generate responses that subtly dispute the reviewer's characterization. 'While we always strive for excellence...' or 'Our team works hard to ensure...' can read as deflection rather than accountability." },
        { type: "p", text: "Before publishing any AI-generated response to a negative review, read it from the perspective of a potential customer who is reading it to see how you handle criticism. Does it sound defensive? Does it focus more on your reputation than the customer's experience? If yes, edit it." },
        { type: "h2", text: "Mistake 5: Not Using Responses to Mention Key Services" },
        {
            type: "summary",
            text: "Responses are indexed—natural mentions of a service or city help relevance. One honest sentence beats keyword stuffing that makes you look like spam.",
        },
        { type: "p", text: "Google's algorithm for local search reads and indexes the content of your review responses. This means your responses are an opportunity to naturally mention your services, location, and specialties in a way that improves your keyword relevance." },
        { type: "p", text: "A response like 'We're so glad you enjoyed the deep cleaning at our Seattle dental practice — our hygiene team will be thrilled to hear this!' is better for both the reviewer and for local SEO than 'Thanks for the 5 stars!'" },
        { type: "warning", text: "Don't stuff keywords into review responses. Natural mentions of your services and location are beneficial. 'Dentist Seattle deep cleaning affordable family dental' in a response will look like spam and could have the opposite effect." },
        { type: "h2", text: "How to Use AI Replies Correctly" },
        {
            type: "summary",
            text: "Draft with AI, re-read the review, personalize, vary openings, and sanity-check negatives before publish. Zyene Reviews fits this workflow: suggest, edit, post from one inbox.",
        },
        { type: "ol", items: [
            "Use AI to generate a structured first draft that handles tone, format, and the framework of the response.",
            "Read the original review again — look for specific details (names, items, events, emotions).",
            "Edit the AI draft to include at least 1–2 specific details from the review.",
            "Vary your opening phrase. Never use the same opener twice in a row.",
            "For negative reviews: read the final response out loud as if you're a skeptical potential customer before publishing.",
        ]},
        { type: "cta", ctaLabel: "See how Zyene Reviews' AI reply suggestions work →", ctaHref: "/features" },
    ],
};

export const post7: BlogPost = {
    slug: "google-business-profile-optimization-checklist",
    title: "Google Business Profile Optimization Checklist for 2026",
    excerpt: "A fully optimized Google Business Profile can 2–3× your local search visibility without spending anything on ads. This is the complete checklist for 2026.",
    pillar: "local-seo",
    pillarLabel: "Local SEO",
    publishedAt: "2026-04-21",
    dateModified: "2026-05-24",
    readMinutes: 10,
    author: { name: "David Kim", role: "Customer Success" },
    metaTitle: "Google Business Profile Optimization Checklist 2026",
    metaDescription:
        "Google Business Profile optimization checklist for 2026: 30+ steps to improve profile completeness, visibility fundamentals, and customer actions.",
    keywords: ["google business profile optimization", "gbp optimization checklist", "google my business optimization 2026", "how to optimize google business profile"],
    relatedSlugs: ["how-reviews-impact-local-map-pack-ranking", "why-google-reviews-matter-in-2026"],
    internalLinks: [
        { label: "See Zyene Reviews' GBP keyword tracking feature", href: "/features" },
        { label: "Try Zyene Reviews free", href: "/signup" },
    ],
    faqs: [
        {
            question: "What is the most important part of Google Business Profile optimization?",
            answer: "Primary category and complete, accurate basics—name, address, phone, hours, website—set the foundation. Reviews and photos layer on top; a wrong category undermines everything else.",
        },
        {
            question: "How often should I post on Google Business Profile?",
            answer: "Aim for at least one Google Post per week with a photo and CTA. Posts expire after about seven days but help freshness signals when you keep the profile active.",
        },
        {
            question: "How many photos should my GBP listing have?",
            answer: "Thirty-plus photos is a solid baseline; Google has cited much higher counts correlating with more direction requests. Add fresh interior, team, and product shots monthly.",
        },
        {
            question: "Can Zyene Reviews track GBP search keywords?",
            answer: "Yes—Zyene Reviews' local SEO features include GBP keyword performance so you see which queries drive impressions and clicks, then prioritize checklist items that match real search demand.",
        },
        {
            question: "Do reviews belong in a GBP optimization checklist?",
            answer: "Absolutely. Target fifty-plus reviews, reply to all of them, keep five to ten new reviews per month, and use Negative Feedback Shield on Zyene Reviews to reduce avoidable public one-stars while you grow.",
        },
    ],
    body: [
        { type: "p", text: "Your Google Business Profile (GBP) is the single most powerful free marketing tool available to local businesses. When fully optimized, it can put you in the Local 3-Pack for dozens of relevant searches, driving calls, website visits, and direction requests — without spending a dollar on ads." },
        { type: "p", text: "Most businesses have a GBP that is 40–60% complete. This checklist covers every optimization available in 2026. Work through it once, then use it for periodic audits." },
        { type: "h2", text: "Section 1: Basic Information (Foundation)" },
        {
            type: "summary",
            text: "Nail legal name, primary category, address, phone, website, and hours before anything else. Keyword-stuffed business names and stale holiday hours are common reasons profiles underperform or attract complaints.",
        },
        { type: "ul", items: [
            "Business name: Use your exact legal/operating business name. No keyword stuffing ('Best Pizza NYC — Mario's'). Google will penalize this.",
            "Primary category: This is the most important single field in your GBP. Choose the most specific category that accurately describes your primary service.",
            "Additional categories: Add up to 9 secondary categories for related services (e.g., a restaurant that is also a 'Sports Bar' or 'Catering Food and Drink Supplier').",
            "Address: Verify your exact address is correct and matches your website, citations, and social profiles.",
            "Service area: If you serve customers at their location, add your service area radius or zip codes.",
            "Phone number: Use a local number, not a tracking number, as your primary. Add tracking numbers as secondary.",
            "Website: Link to your homepage, or a location-specific landing page for multi-location businesses.",
            "Hours: Add accurate regular hours, holiday hours, and special hours. Outdated hours are a top source of negative reviews.",
        ]},
        { type: "h2", text: "Section 2: Photos (High Impact)" },
        {
            type: "summary",
            text: "Cover, logo, interior, exterior, team, and product shots build trust and clicks. Google's own guidance ties richer photo libraries to more direction requests—refresh visuals monthly.",
        },
        { type: "ul", items: [
            "Cover photo: 1080×608px minimum. Should show your storefront, interior, or primary product/service. Updated within the last year.",
            "Profile photo: Your logo, 250×250px minimum.",
            "Interior photos: At least 5–10 showing the atmosphere and space.",
            "Exterior photos: Multiple angles, including the street view so customers can find you.",
            "Team photos: Staff photos significantly increase trust and click-through rates.",
            "Product/service photos: The more specific, the better. A menu item, a before/after, a completed job.",
            "Total photo count: Aim for 30+ photos. Listings with more than 100 photos get 965% more direction requests (source: Google).",
        ]},
        { type: "tip", text: "Photo freshness matters. Add at least 1–2 new photos per month to signal to Google that your profile is actively maintained. Use a photo for every seasonal menu, promotion, or service addition." },
        { type: "h2", text: "Section 3: Services and Products" },
        {
            type: "summary",
            text: "List every service and product with plain-language descriptions Google can index. Restaurants should keep menus current; home services should spell out what you actually book on site.",
        },
        { type: "ul", items: [
            "Services: Add every service you offer with individual names and descriptions. Include natural keyword language in descriptions.",
            "Products: If you sell products, add them with photos, prices, and descriptions.",
            "Menu (restaurants): Upload your full menu using Google's menu editor. Keep it current.",
            "Service descriptions: Write 2–3 sentence descriptions for each service. These are indexed by Google and can appear in search results.",
        ]},
        { type: "h2", text: "Section 4: Business Attributes" },
        {
            type: "summary",
            text: "Attributes filter search results—accessibility, payments, amenities, identity labels. Accurate tags help the right customers find you and reduce mismatched expectations that become bad reviews.",
        },
        { type: "ul", items: [
            "Identity attributes: Woman-owned, veteran-led, LGBTQ+ friendly — these appear as prominent labels on your profile and filter results.",
            "Accessibility: Wheelchair accessible entrance, restroom, parking — critical for certain searches.",
            "Amenities: Free WiFi, outdoor seating, in-store shopping, curbside pickup, etc.",
            "Payment methods: Accepted payment types including credit cards, NFC/contactless.",
            "Highlights: Award-winning, locally owned, established year.",
        ]},
        { type: "h2", text: "Section 5: Reviews (Most Important Long-Term Signal)" },
        {
            type: "summary",
            text: "Reviews drive Prominence: aim for fifty-plus totals, reply to every review, and keep new ones flowing monthly. Pair collection with Zyene Reviews campaigns and Shield so public ratings reflect fixable issues you already resolved.",
        },
        { type: "ul", items: [
            "Total review count: Target 50+ reviews to enter the competitive range for local 3-pack placement.",
            "Response rate: Respond to 100% of reviews — positive and negative.",
            "Response time: Aim for under 48 hours for all reviews, under 24 hours for negative ones.",
            "Review velocity: Maintain a consistent flow of new reviews. 5–10/month is ideal for most businesses.",
            "Keyword mentions: Encourage customers to mention specific services or products in their reviews (but never dictate exact wording).",
        ]},
        { type: "h2", text: "Section 6: Q&A Section" },
        {
            type: "summary",
            text: "Seed and answer real FAQs—parking, insurance, reservations—so shoppers do not guess. Owner answers rank prominently and can include natural keywords without stuffing.",
        },
        { type: "ul", items: [
            "Seed common questions: Use a secondary account or ask a team member to submit the most frequently asked questions — do you take reservations? Is there parking? Do you accept insurance?",
            "Answer all questions: As the business owner, your answers appear prominently. Use keyword-rich answers.",
            "Monitor regularly: Anyone can add questions. Check weekly and answer promptly.",
        ]},
        { type: "h2", text: "Section 7: Google Posts" },
        {
            type: "summary",
            text: "Weekly posts with photos and CTAs—Book, Order, Learn More—signal an active profile. Rotate offers, events, and product highlights so the listing never looks abandoned.",
        },
        { type: "ul", items: [
            "Post frequency: Publish at least 1 Google Post per week. Posts expire after 7 days but contribute to profile freshness signals.",
            "Post types: What's New, Event, Offer, Product — vary your post types.",
            "Include CTAs: Every post should have a call-to-action: Learn More, Book, Order, Sign Up.",
            "Include photos: Posts with photos get significantly more clicks.",
        ]},
        { type: "h2", text: "Section 8: Messaging and Booking" },
        {
            type: "summary",
            text: "Turn on messaging and booking links only if you will respond within a day. Unanswered chats hurt the same way ignored reviews do—better to disable than look unavailable.",
        },
        { type: "ul", items: [
            "Enable messaging: Turn on Google Business Messages if you have capacity to respond promptly (within 24 hours).",
            "Booking button: If you use an online booking system (Acuity, OpenTable, etc.), add the booking URL to your profile.",
            "Response commitment: Only enable messaging if you'll actually respond. Unanswered messages hurt your profile score.",
        ]},
        { type: "tip", text: "Use Zyene Reviews' GBP keyword performance dashboard to see which search queries are driving impressions and clicks to your Google Business Profile. This data shows you where to focus your optimization effort." },
        { type: "cta", ctaLabel: "Track your GBP keyword performance with Zyene Reviews →", ctaHref: "/features" },
    ],
};

export const post8: BlogPost = {
    slug: "how-reviews-impact-local-map-pack-ranking",
    title: "How Reviews Impact Your Google Local Map Pack Ranking",
    excerpt: "Google says review count and positive ratings can help local ranking. Learn what is documented, what remains undisclosed, and what owners can improve.",
    pillar: "local-seo",
    pillarLabel: "Local SEO",
    publishedAt: "2026-04-28",
    dateModified: "2026-08-15",
    readMinutes: 7,
    author: { name: "Zyene Reviews Team", role: "Editorial" },
    metaTitle: "How Google Reviews Impact Local Map Pack Ranking",
    metaDescription: "Learn how Google reviews relate to local Map Pack visibility, which factors Google documents, and which common ranking claims remain unverified.",
    keywords: ["local map pack ranking", "google reviews ranking factor", "how reviews affect local seo", "google 3 pack ranking", "reviews local search ranking"],
    relatedSlugs: ["google-business-profile-optimization-checklist", "how-to-get-50-google-reviews-in-30-days"],
    internalLinks: [
        { label: "Zyene Reviews GBP keyword tracking", href: "/features" },
        { label: "How to get more reviews fast", href: "/blog/how-to-get-50-google-reviews-in-30-days" },
    ],
    faqs: [
        {
            question: "Do Google reviews affect Map Pack rankings?",
            answer: "Yes. Google says review count and positive ratings can help local ranking. It does not publish a formula for recency, response rate, or review keywords, and relevance, distance, links, articles, and other prominence signals also matter.",
        },
        {
            question: "What matters more: star rating or number of reviews?",
            answer: "Google confirms that both review count and positive ratings can help, but it does not publish how they are weighted against each other. Compare your profile with nearby results and keep earning genuine reviews rather than targeting a universal ratio.",
        },
        {
            question: "How recent should my Google reviews be?",
            answer: "Google publishes no ninety-day review-weighting rule. Recent reviews still give customers a current picture of the business, so request genuine feedback consistently instead of relying on a one-time campaign.",
        },
        {
            question: "Does replying to reviews help Map Pack placement?",
            answer: "Google recommends helpful replies because they show that you value feedback and can help your profile stand out. It does not publish response rate as a separate ranking factor. Aim for complete, prompt coverage because customers read the exchange.",
        },
        {
            question: "Can competitor review velocity pass me in the Map Pack?",
            answer: "A competitor's rating and review count can improve while yours stays flat, but that alone cannot predict a Map Pack overtake or timeline. Zyene Reviews can surface changes in public competitor review metrics so you can investigate the full result set.",
        },
    ],
    body: [
        { type: "p", text: "When someone searches 'dentist near me' or 'best pizza in Austin', Google may show a map with three business results: the Local 3-Pack. Its click share varies by query, device, and market, so use your own Business Profile performance data to judge its value." },
        { type: "p", text: "Reviews matter because Google says review count and positive ratings can help local ranking and because customers use them to choose between nearby businesses. They remain one input among relevance, distance, and broader prominence signals." },
        { type: "h2", text: "Google's Three Local Ranking Factors" },
        {
            type: "summary",
            text: "Local rankings blend relevance, distance, and prominence. Owners can improve profile accuracy and earn genuine reviews, but distance and many prominence signals remain outside their direct control.",
        },
        { type: "p", text: "Google uses three factors to determine which businesses appear in the Local 3-Pack:" },
        { type: "ul", items: [
            "Relevance: How well your Google Business Profile matches what the user is searching for. Completeness of your GBP, accurate categories, and service descriptions all contribute.",
            "Proximity: How close your business is to the searcher's location. This is largely outside your control.",
            "Prominence: How well-known and reputable your business is — both online and offline. This is where reviews live.",
        ]},
        { type: "p", text: "Google says complete business information supports relevance, while prominence can reflect reviews, ratings, links, articles, directories, and offline recognition. No single review tactic guarantees a top-three position." },
        { type: "h2", text: "What Google Documents About Reviews" },
        {
            type: "summary",
            text: "Google explicitly names review count and positive ratings as factors that can help local ranking. Recency, response rate, and review wording may matter to customers, but Google does not publish separate ranking weights for them.",
        },
        { type: "h3", text: "1. Review Quantity" },
        { type: "p", text: "Google says more reviews can help local ranking, but it publishes no logarithmic curve or thresholds at twenty, fifty, or one hundred reviews. Benchmark against relevant nearby businesses without presenting their counts as a guaranteed target." },
        { type: "h3", text: "2. Review Recency (Freshness)" },
        { type: "p", text: "Recent reviews give prospective customers more current evidence, but Google publishes no separate recency weight for local ranking. This is why review management should be an ongoing customer-feedback process rather than a one-time push." },
        { type: "tip", text: "There is no official ninety-day ranking window. Choose a request cadence that matches genuine customer volume and monitor how customers and local results respond over time." },
        { type: "h3", text: "3. Average Star Rating" },
        { type: "p", text: "Google says positive ratings can help local ranking, but it does not publish a formula that trades star rating against review count. Both are visible to customers, so track them separately rather than assuming one always outweighs the other." },
        { type: "h3", text: "4. Response Rate" },
        { type: "p", text: "Google recommends helpful replies because they show customers that their feedback matters and can help the profile stand out. It does not document response rate as a separate ranking factor. Track it as a service and reputation metric." },
        { type: "h3", text: "5. Keyword Mentions in Reviews" },
        { type: "p", text: "Specific, authentic reviews help prospective customers understand which services were delivered. Ask for honest detail without dictating wording; Google does not publish a review-keyword relevance score that businesses can safely optimize against." },
        { type: "h2", text: "What This Means in Practice" },
        {
            type: "summary",
            text: "Prioritize policy-compliant requests, current customer feedback, and complete response coverage. The table separates Google's documented ranking guidance from customer-experience reasons to act.",
        },
        { type: "table", table: {
            headers: ["Review signal", "What is documented", "Responsible action"],
            rows: [
                ["Review quantity", "Google says more reviews can help local ranking", "Request genuine reviews consistently"],
                ["Review recency", "No separate Google weight or window published", "Keep feedback current for customers"],
                ["Average star rating", "Google says positive ratings can help local ranking", "Resolve service issues and value honest feedback"],
                ["Response rate", "Helpful replies can help a profile stand out", "Reply promptly and professionally"],
                ["Review wording", "No review-keyword ranking score published", "Invite detail without scripting language"],
            ],
        }},
        { type: "h2", text: "The Compounding Effect" },
        {
            type: "summary",
            text: "A consistent review process creates more current customer evidence and faster feedback loops. Automation can keep the process reliable, but it cannot guarantee rankings or a competitor-over-take timeline.",
        },
        { type: "p", text: "Consistent review management can compound operationally: more customer feedback reveals service issues, thoughtful replies build trust, and a dependable request process keeps the profile current. Search placement still depends on many signals." },
        { type: "p", text: "Competitor review growth is worth monitoring, but review velocity alone cannot predict whether or when another business will overtake your local position. Compare the actual result set and the broader profile instead." },
        { type: "cta", ctaLabel: "Start automating your review collection with Zyene Reviews →", ctaHref: "/signup" },
    ],
};
