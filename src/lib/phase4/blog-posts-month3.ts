/**
 * Blog posts — Month 3 (posts 9–12).
 * Industry-Specific + Reputation Management.
 */

import type { BlogPost } from "./blog-types";

export const post9: BlogPost = {
    slug: "restaurant-owners-guide-to-google-reviews",
    title: "Restaurant Owner's Guide to Google Reviews (2026 Edition)",
    excerpt: "Google reviews are the #1 factor in where diners choose to eat. This is the complete guide for restaurant owners to get more reviews, respond professionally, and protect their rating.",
    pillar: "industry-specific",
    pillarLabel: "Industry Specific",
    publishedAt: "2026-05-05",
    dateModified: "2026-05-24",
    readMinutes: 9,
    author: { name: "Nina Patel", role: "Local SEO" },
    metaTitle: "Restaurant Owner's Guide to Google Reviews 2026",
    metaDescription: "The complete Google review guide for restaurant owners. How to get more reviews, respond to complaints, protect your rating, and track competitors in 2026.",
    keywords: ["restaurant google reviews", "restaurant review management", "how to get more restaurant reviews", "restaurant reputation management 2026"],
    relatedSlugs: ["how-to-get-50-google-reviews-in-30-days", "how-to-respond-to-a-1-star-review"],
    internalLinks: [
        { label: "Zyene Reviews for Restaurants", href: "/industries/restaurants" },
        { label: "Start your free trial", href: "/signup" },
    ],
    faqs: [
        {
            question: "How do restaurants get more Google reviews?",
            answer: "Ask at payment with a QR code, follow up by SMS one to two hours after dine-in, email catering clients, and use loyalty lists. Timing beats a generic please-review sign that guests ignore.",
        },
        {
            question: "What should restaurants say in negative review responses?",
            answer: "Name the dish or service issue without arguing, apologize for the visit, and invite them back through a manager contact. Keep it short—other diners are watching your tone.",
        },
        {
            question: "Does review count matter more than star rating for restaurants?",
            answer: "Often yes. A 4.5 with hundreds of reviews usually wins clicks over a 4.8 with twenty because volume signals consistent experience. Keep new reviews arriving every month.",
        },
        {
            question: "How does Negative Feedback Shield help restaurants?",
            answer: "Zyene Reviews routes low ratings on your branded collectratings.com page to private feedback first, so you can fix cold food or service issues before they become public one-stars on Google.",
        },
        {
            question: "Can Zyene Reviews manage reviews for multiple restaurant locations?",
            answer: "Professional plans support multiple locations with per-location analytics and team seats. Focus extra collection effort on the lowest-rated unit until it catches up to the brand average.",
        },
    ],
    body: [
        { type: "p", text: "No industry is more directly impacted by Google Reviews than restaurants. A Harvard Business School study found that a 1-star drop in Yelp rating cost independent restaurants 5–9% of revenue. Google has an even stronger influence — 93% of diners check online reviews before choosing where to eat." },
        { type: "p", text: "This guide is for restaurant owners and managers who want a practical, no-fluff system for growing their Google review count, responding professionally, and protecting their rating." },
        { type: "h2", text: "Why Restaurants Live and Die by Reviews" },
        {
            type: "summary",
            text: "Diners choose in seconds from map results—star average, review count, and the latest comments matter more than your menu PDF. Thin profiles lose covers to competitors who look busier and more trusted online.",
        },
        { type: "p", text: "For restaurants, the decision cycle is short and high-frequency. Someone is hungry, they search 'Italian restaurant near me', they see 3–5 options, and they make a decision in 30 seconds based almost entirely on star rating, review count, and the first 2–3 reviews they read." },
        { type: "p", text: "A restaurant with 200 reviews and a 4.5-star average will nearly always outperform a restaurant with 20 reviews and a 4.8-star average in both click-through rate and foot traffic — even though the latter has a higher rating." },
        { type: "h2", text: "The 5 Moments to Ask for a Review" },
        {
            type: "summary",
            text: "Payment QR codes, table tents, post-meal SMS, catering thank-you emails, and loyalty nudges cover most restaurant journeys. Zyene Reviews can automate SMS and email once you connect your guest list or POS via Zapier.",
        },
        { type: "ol", items: [
            "At payment: A QR code on the receipt or payment terminal that goes directly to your Google review page. Keep it simple: 'Enjoyed your meal? Leave us a quick Google review →'",
            "Table tent or menu card: A small card at every table with your review QR code and a friendly ask. Change the copy seasonally to keep it fresh.",
            "SMS follow-up: Send a text 1–2 hours after a reservation-based meal when the experience is still fresh. For walk-in customers, collect numbers through your loyalty program or WiFi login.",
            "Email after catering or private events: Private dining and catering customers are your highest-satisfaction segment. A personal thank-you email with a review request converts at 20–30%.",
            "Loyalty program touchpoint: If you have a loyalty app or email list, send a periodic review request to members who haven't reviewed you yet.",
        ]},
        { type: "h2", text: "What Diner Reviews Actually Talk About" },
        {
            type: "summary",
            text: "Food, service, ambiance, waits, and value dominate guest write-ups—percentages in the table are directional themes, not a single survey of your house. Train staff and kitchen off the topics you see repeated.",
        },
        { type: "p", text: "Understanding what diners write about in reviews helps you both solicit better ones and respond to them effectively." },
        { type: "table", table: {
            headers: ["Topic", "% of Reviews", "Implication"],
            rows: [
                ["Food quality and presentation", "~55%", "Encourage reviewers to mention specific dishes"],
                ["Service and staff attitude", "~30%", "Staff training impacts review sentiment most"],
                ["Ambiance and cleanliness", "~15%", "Photos and cleanliness directly feed review content"],
                ["Wait time and seating", "~20%", "Peak hours = most negative timing reviews"],
                ["Value for money", "~15%", "Price justification needs to be felt, not just stated"],
            ],
        }},
        { type: "h2", text: "Responding to Food Quality Complaints" },
        {
            type: "summary",
            text: "Reference the specific dish, skip excuses, and invite them back through a manager. A gracious public reply often matters more than the original star score for the next customer reading the thread.",
        },
        { type: "p", text: "Food quality complaints are the most common negative review category for restaurants. The best responses acknowledge the specific dish mentioned, don't make excuses (even if the reviewer ordered incorrectly), and invite them to return." },
        { type: "quote", text: "Hi [Name], we're sorry the [dish] wasn't up to par on your visit — that's not the standard our kitchen holds itself to. We'd love to make it right. Please ask for [manager name] on your next visit and we'll take care of you. Thank you for the honest feedback." },
        { type: "h2", text: "The Multi-Location Restaurant Challenge" },
        {
            type: "summary",
            text: "Groups need per-location profiles and centralized monitoring so one weak unit does not drag the brand. Pour extra review requests into the lowest-rated store until its average recovers.",
        },
        { type: "p", text: "Restaurant groups with multiple locations face a unique challenge: review management at scale. Each location needs its own review profile, and inconsistency between locations (one at 4.6 stars, another at 3.9) can damage the overall brand." },
        { type: "p", text: "Multi-location operators need a centralized dashboard to monitor all locations in one place, standardized response templates that can be personalized per location, and location-specific review collection strategies tailored to each unit's traffic patterns." },
        { type: "tip", text: "For multi-location restaurants: the location with the lowest rating should get the most focused review collection effort, not just average treatment. A systematic review push at a 3.9-star location can move it to 4.3+ within 60 days." },
        { type: "h2", text: "Protecting Your Rating with the Negative Feedback Shield" },
        {
            type: "summary",
            text: "Shield catches unhappy guests on your Zyene Reviews review page before they vent on Google—giving you a private chance to remake the dish or comp the meal. It is built into Zyene Reviews paid plans for restaurants using collectratings.com links.",
        },
        { type: "p", text: "The hardest reviews to deal with are the ones that come from fixable problems — a cold dish, a wrong order, a long wait — where the customer didn't mention it to the server. By the time you see the review, it's too late." },
        { type: "p", text: "The Negative Feedback Shield changes this dynamic by routing unhappy customers to a private feedback form before they post publicly. When a customer taps 'Not satisfied', they're asked to describe their experience privately rather than going straight to Google. This gives you the chance to fix the issue, potentially converting a 1-star review into a return visit." },
        { type: "cta", ctaLabel: "See how Zyene Reviews works for restaurants →", ctaHref: "/industries/restaurants" },
    ],
};

export const post10: BlogPost = {
    slug: "dental-practice-reputation-management-2026",
    title: "Dental Practice Reputation Management: The 2026 Guide",
    excerpt: "77% of dental patients check reviews before choosing a dentist. Here's the complete reputation management guide for dental practices — including HIPAA-aware response strategies.",
    pillar: "industry-specific",
    pillarLabel: "Industry Specific",
    publishedAt: "2026-05-12",
    dateModified: "2026-05-24",
    readMinutes: 8,
    author: { name: "Zyene Reviews Team", role: "Editorial" },
    metaTitle: "Dental Practice Reputation Management Guide 2026",
    metaDescription:
        "2026 reputation guide for dental practices: HIPAA-aware review responses, more patient reviews, and protecting your practice from negative feedback.",
    keywords: ["dental practice reputation management", "dentist google reviews", "dental reviews management 2026", "dentist reputation management strategy"],
    relatedSlugs: ["how-to-respond-to-a-1-star-review", "how-to-get-50-google-reviews-in-30-days"],
    internalLinks: [
        { label: "Zyene Reviews for Dental Practices", href: "/industries/dental" },
        { label: "Start your free trial", href: "/signup" },
    ],
    faqs: [
        {
            question: "Can dental practices respond to Google reviews without violating HIPAA?",
            answer: "Yes, if you avoid confirming someone was a patient or discussing treatment. Use general language about comfort and invite them to call the office—never reference procedures they mentioned in their review.",
        },
        {
            question: "When should a dental office ask for a Google review?",
            answer: "Two to three hours after checkout for SMS, twenty-four hours for email-only patients, and after the second visit when trust is established. Happy recall patients are strong candidates too.",
        },
        {
            question: "What causes most negative dental reviews?",
            answer: "Wait times, billing surprises, and front-desk experience dominate—often operational issues, not clinical skill. Fixing scheduling communication usually moves the needle faster than marketing alone.",
        },
        {
            question: "Does Zyene Reviews work for dental practices?",
            answer: "Zyene Reviews monitors Google, Facebook, and Yelp, sends HIPAA-aware reply drafts you still edit, and runs SMS or email review campaigns. See /industries/dental for workflow examples.",
        },
        {
            question: "Should dentists monitor Healthgrades and Google?",
            answer: "Google drives local map discovery for most new patients; Healthgrades still matters for some searchers. A single inbox in Zyene Reviews reduces the chance a platform review sits unanswered.",
        },
    ],
    body: [
        { type: "p", text: "Choosing a dentist is one of the most trust-sensitive decisions a consumer makes. 77% of patients say they use online reviews as their first step in finding a new dental provider. For dental practices, reputation management isn't a marketing tactic — it's patient acquisition." },
        { type: "h2", text: "The Dental Patient Review Journey" },
        {
            type: "summary",
            text: "Patients scan the map pack, compare stars and volume, read recent reviews, check if the practice replies, then book or bounce. Eighty reviews at 4.5 often beats fifteen at 4.9 because volume signals experience.",
        },
        { type: "p", text: "A new patient's decision process typically follows this pattern: search ('dentist near me' or '[city] family dentist'), scan the first 3–5 results in the Google Local Pack, compare star ratings and review counts, read 3–5 most recent reviews, check if the practice responds to reviews, then book or move on." },
        { type: "p", text: "A practice with 15 reviews and a 4.9-star average will often lose to a practice with 80 reviews and a 4.5-star average — because patients assume more reviews means more experience and a more representative sample." },
        { type: "h2", text: "HIPAA and Review Responses: What You Need to Know" },
        {
            type: "summary",
            text: "Never confirm patient status or repeat procedures in public replies—even if the reviewer disclosed them. Stay general, express concern, and route the conversation to your office phone or practice manager.",
        },
        { type: "p", text: "This is the biggest compliance concern dental practices have about responding to reviews online. The key rule: never confirm or deny that a reviewer is a patient, and never discuss any aspect of treatment, diagnosis, or medical history in a public response — even if the patient disclosed it in their review." },
        { type: "warning", text: "If a patient writes 'I came in for a root canal and it hurt', do NOT respond 'We're sorry the root canal was painful, [Name].' That response confirms they were a patient and had a specific procedure — both of which are PHI. Instead, respond in general terms: 'We're sorry to hear about your experience. Patient comfort is our priority, and we'd welcome the chance to discuss this privately.'" },
        { type: "h3", text: "HIPAA-Safe Response Template" },
        { type: "quote", text: "Thank you for sharing your experience. Patient comfort and satisfaction are our top priorities, and we're sorry to hear your visit fell short of expectations. We'd welcome the opportunity to address your concerns privately — please contact our office at [phone] and ask for [practice manager]. We'd love to hear from you." },
        { type: "h2", text: "Where Most Dental Negative Reviews Come From" },
        {
            type: "summary",
            text: "Wait times, billing confusion, and front-desk tone drive most one- and two-star dental reviews—patterns echoed in industry reputation research, not Zyene Reviews proprietary patient data.",
        },
        { type: "p", text: "Across dental practices, the top sources of negative reviews are consistent:" },
        { type: "ul", items: [
            "Wait time (30–40% of negative reviews): Patients who waited significantly longer than expected, especially for scheduled appointments.",
            "Billing surprises (25–35%): Insurance coverage misunderstandings, unexpected out-of-pocket costs, billing errors.",
            "Front desk experience (20–25%): Rude or dismissive front desk staff, poor communication about scheduling.",
            "Pain/discomfort (10–15%): Post-procedure pain, anesthesia issues, feeling rushed.",
        ]},
        { type: "p", text: "The important insight here: 75–80% of dental negative reviews are about operational issues (wait time, billing, front desk) rather than clinical quality. This means the solution is largely operational — not clinical." },
        { type: "h2", text: "How to Get More Patient Reviews" },
        {
            type: "summary",
            text: "Text a few hours after appointments, email patients without mobiles, weave asks into recall outreach, and funnel satisfied new patients after visit two. Zyene Reviews automates those sends once your PMS or list is connected.",
        },
        { type: "ol", items: [
            "Post-checkout text: Send a review request 2–3 hours after checkout when satisfaction is highest. Keep it simple and direct.",
            "Email follow-up: For patients without a mobile number, send a review request email 24 hours post-appointment.",
            "Recall appointment reminder: Include a review request in your standard recall appointment communications ('While you're thinking about your dental health...').",
            "New patient survey → review funnel: After a new patient's second appointment (when trust is established), send a satisfaction survey. If they rate 4/5 or above, redirect them to Google Reviews.",
        ]},
        { type: "h2", text: "Managing Reviews Across Multiple Platforms" },
        {
            type: "summary",
            text: "Google remains the priority for local discovery, but Healthgrades and Facebook still surface for some patients. Zyene Reviews centralizes monitoring so nothing sits unreplied while you chairside.",
        },
        { type: "p", text: "Dental patients leave reviews across Google, Healthgrades, and Facebook — not just Google. While Google is the most important for local search ranking, the others matter for specific patient segments." },
        { type: "p", text: "Managing all platforms from a single dashboard — rather than logging into each separately — saves significant time and ensures no review goes unresponded to." },
        { type: "cta", ctaLabel: "See how Zyene Reviews works for dental practices →", ctaHref: "/industries/dental" },
    ],
};

export const post11: BlogPost = {
    slug: "true-cost-of-bad-online-reputation",
    title: "The True Cost of a Bad Online Reputation for Local Businesses",
    excerpt: "Most business owners think about reputation in terms of reviews. The real cost is measured in revenue — and it's much larger than most people realize. Here's how to calculate yours.",
    pillar: "reputation-management",
    pillarLabel: "Reputation Management",
    publishedAt: "2026-05-19",
    dateModified: "2026-05-24",
    readMinutes: 8,
    author: { name: "Chris Alvarez", role: "Industry Research" },
    metaTitle: "The True Cost of a Bad Online Reputation for Local Businesses",
    metaDescription: "Calculate the real revenue cost of a bad online reputation. Lost customers, higher ad costs, and compounding effects explained for local business owners.",
    keywords: ["cost of bad online reputation", "online reputation cost", "reputation management roi", "negative reviews revenue impact", "bad reviews cost business"],
    relatedSlugs: ["why-google-reviews-matter-in-2026", "how-to-respond-to-a-1-star-review"],
    internalLinks: [
        { label: "See how Zyene Reviews protects your reputation", href: "/features" },
        { label: "Try Zyene Reviews free for 7 days", href: "/signup" },
    ],
    faqs: [
        {
            question: "How much does a bad online reputation cost a local business?",
            answer: "It varies by traffic and ticket size, but the article walks through lost acquisition, lost repeat visits, higher ad reliance, and compounding damage from unanswered negatives—using published third-party stats, not Zyene Reviews customer benchmarks.",
        },
        {
            question: "Does a half-star rating gap really change revenue?",
            answer: "Industry research cited here—including ReviewTrackers and Harvard work on ratings and revenue—shows meaningful swings in whether consumers choose you. Run the worksheet table with your own GBP impressions and average ticket.",
        },
        {
            question: "Can one bad review be offset?",
            answer: "Consumer research often cited suggests many positive reviews are needed to neutralize the impact of a harsh negative. Respond quickly and keep collecting fresh positives so the bad review ages down the feed.",
        },
        {
            question: "How does Negative Feedback Shield reduce reputation cost?",
            answer: "Shield routes low ratings to private feedback on your Zyene Reviews review page so you can save the relationship before Google sees a one-star. Fewer public disasters mean less compounding damage.",
        },
        {
            question: "Is reputation management software worth $30 per month?",
            answer: "If preventing one lost customer per month exceeds Starter on Zyene Reviews at $29.99, the math works. The article compares annual tool cost to illustrative revenue lines you fill in—not guaranteed ROI figures.",
        },
    ],
    body: [
        { type: "p", text: "Every local business owner knows a bad review hurts. But most think about the damage in vague terms — 'we might lose a few customers'. The actual financial impact is specific, measurable, and compounding — and for most local businesses, it's much larger than they realize." },
        { type: "p", text: "Here's how to calculate the true cost of a poor online reputation." },
        { type: "h2", text: "Cost #1: Lost New Customer Acquisition" },
        {
            type: "summary",
            text: "A weaker star profile versus the competitor beside you in Maps bleeds clicks you never see. The example math uses published consumer research and your own impressions—plug real numbers, not industry averages alone.",
        },
        { type: "p", text: "Let's start with the most direct cost. If your Google rating is 3.9 stars versus a competitor's 4.5 stars, you lose a significant percentage of potential customers at the decision point — without even knowing it happened." },
        { type: "p", text: "Research from ReviewTrackers shows that 94% of consumers say an online review has convinced them to avoid a business. If 100 people see your listing per month and 30% choose a competitor because of your rating (a conservative estimate), that's 30 lost customers per month. At a $50 average transaction value, that's $1,500/month or $18,000/year — from a single rating differential." },
        { type: "h2", text: "Cost #2: Lost Repeat Customers" },
        {
            type: "summary",
            text: "One unresolved bad visit can erase years of loyalty revenue. Shield and private outreach recover guests who would otherwise churn and vent publicly—worth more than a single transaction.",
        },
        { type: "p", text: "When a customer has a bad experience and you don't address it, you lose not just their next visit but all future visits. For a restaurant, a loyal customer who visits twice a month at $40/visit is worth $960/year. Lose 10 of those customers and you've lost $9,600 in annual recurring revenue." },
        { type: "p", text: "The Negative Feedback Shield addresses this directly: by routing unhappy customers to a private resolution channel, you retain customers who would otherwise leave and write a 1-star review. Every complaint privately resolved is a customer saved." },
        { type: "h2", text: "Cost #3: Higher Cost Per Acquisition" },
        {
            type: "summary",
            text: "Weak organic prominence pushes you toward paid clicks. Ads still send researchers to your reviews—if stars lag, you pay more for traffic that bounces after reading negatives.",
        },
        { type: "p", text: "If you run Google or Facebook ads, your review rating directly affects your cost per click and cost per acquisition. Google Ads Quality Score is influenced by your landing page relevance and user behavior — and users who land on your site from an ad but immediately search your name and find 3.8-star reviews are more likely to bounce, which raises your effective CPA." },
        { type: "p", text: "More directly: lower organic visibility from poor review signals means higher ad spend to reach the same number of customers. A business that ranks in the Local 3-Pack organically doesn't need to pay for clicks to those searchers. A business with a poor review profile must buy that traffic." },
        { type: "h2", text: "Cost #4: The Compounding Effect of Negative Reviews" },
        {
            type: "summary",
            text: "One visible one-star keeps influencing new visitors for months. Cited consumer-behavior research describes outsized weight on negatives—answer them and bury them with fresh positives.",
        },
        { type: "p", text: "Negative reviews have a disproportionate psychological impact. Research on consumer decision-making shows that one 1-star review requires approximately 12 positive 5-star reviews to neutralize its impact on purchase probability." },
        { type: "p", text: "This means every unaddressed 1-star review is not a static cost — it's a compounding liability. Each new visitor who reads it is influenced. Over 12 months, a single unanswered 1-star review from a high-visibility time period can be read by hundreds of potential customers." },
        { type: "h2", text: "Calculating Your Reputation Risk" },
        {
            type: "summary",
            text: "Use GBP Insights impressions, your average sale, and a conservative conversion gap versus competitors to estimate monthly and annual revenue at risk. The table is a worksheet—you supply the numbers.",
        },
        { type: "table", table: {
            headers: ["Metric", "Your Business", "Formula"],
            rows: [
                ["Monthly new customer searches (GBP impressions)", "—", "From your GBP Insights dashboard"],
                ["Estimated conversion rate loss vs competitor", "—", "~15–30% if rating is < 0.5 stars lower"],
                ["Average transaction value", "—", "Your average ticket"],
                ["Lost customers/month", "—", "Impressions × conversion loss %"],
                ["Monthly revenue impact", "—", "Lost customers × avg transaction"],
                ["Annual revenue impact", "—", "Monthly × 12"],
            ],
        }},
        { type: "h2", text: "The Investment vs. Cost Calculation" },
        {
            type: "summary",
            text: "Compare annual reputation risk you calculated to Starter on Zyene Reviews at $29.99 per month—about $360 per year. The question is active risk today, not whether software sounds nice.",
        },
        { type: "p", text: "Most reputation management tools pay for themselves in the first recovered customer. If losing a 1-star review prevents even one $50 customer per month, that's $600/year in preserved revenue. Zyene Reviews' Starter plan at $29.99/month is $359.88/year — and it protects against dozens of potential negative reviews per year, not just one." },
        { type: "p", text: "The better question isn't 'can we afford reputation management?' — it's 'what is our active reputation risk today, and what's it costing us?'" },
        { type: "cta", ctaLabel: "Protect your revenue with Zyene Reviews' Negative Feedback Shield →", ctaHref: "/features" },
    ],
};

export const post12: BlogPost = {
    slug: "how-to-handle-fake-google-reviews",
    title: "How to Handle Fake Google Reviews: A Step-by-Step Guide",
    excerpt: "Fake reviews are a growing problem for local businesses. Here's how to identify them, report them to Google, respond strategically, and protect your rating while you wait.",
    pillar: "reputation-management",
    pillarLabel: "Reputation Management",
    publishedAt: "2026-05-26",
    dateModified: "2026-05-24",
    readMinutes: 7,
    author: { name: "Zyene Reviews Team", role: "Editorial" },
    metaTitle: "How to Handle Fake Google Reviews: Step-by-Step Guide",
    metaDescription:
        "How to handle fake Google reviews: identify, flag, report, and respond to suspicious reviews while protecting your rating during Google's review.",
    keywords: ["fake google reviews", "how to report fake google reviews", "remove fake google reviews", "fake review google business profile", "suspicious google reviews"],
    relatedSlugs: ["true-cost-of-bad-online-reputation", "how-to-respond-to-a-1-star-review"],
    internalLinks: [
        { label: "Zyene Reviews review monitoring", href: "/features" },
        { label: "Start monitoring reviews with Zyene Reviews", href: "/signup" },
    ],
    faqs: [
        {
            question: "How do I know if a Google review is fake?",
            answer: "Look for thin reviewer history, generic or recycled text, services you do not offer, impossible geography, or several negatives landing in a tight window. Document screenshots before you report.",
        },
        {
            question: "How do I report a fake Google review?",
            answer: "Use the three-dot menu on the review in Maps or the flag control in Google Business Profile, pick the closest policy reason, and wait for Google's review—often one to seven days, sometimes longer.",
        },
        {
            question: "Should I respond publicly to a fake review?",
            answer: "Yes—with a calm tone that notes you cannot verify the visit and inviting a direct contact. Avoid calling it fake aggressively; future customers read your professionalism.",
        },
        {
            question: "What if Google does not remove the review?",
            answer: "Keep the professional response, accelerate legitimate review collection, and consult counsel if you suspect a coordinated competitor attack. Never post fake reviews in retaliation.",
        },
        {
            question: "Can Zyene Reviews alert me when suspicious reviews appear?",
            answer: "Zyene Reviews sends real-time alerts when new Google, Facebook, or Yelp reviews arrive so you can flag and respond within hours instead of discovering fakes weeks later.",
        },
    ],
    body: [
        { type: "p", text: "Fake Google reviews — from competitors, unhappy former employees, or review farms — are an increasingly common problem for local businesses. Unlike legitimate negative reviews that reflect real customer experiences, fake reviews are a form of business sabotage that can cost you customers and ranking without any corresponding business failure." },
        { type: "p", text: "Here's the complete playbook for identifying, reporting, and managing fake reviews on your Google Business Profile." },
        { type: "h2", text: "How to Identify a Fake Review" },
        {
            type: "summary",
            text: "Suspicious accounts, recycled language, wrong services, odd timing, or coordinated bursts are red flags. Build a evidence folder before you escalate—Google and counsel both want timestamps.",
        },
        { type: "p", text: "Fake reviews often share recognizable patterns:" },
        { type: "ul", items: [
            "Reviewer has 1 or very few reviews, all posted within a short time window",
            "The review profile photo is a generic avatar or stock photo",
            "Review mentions services you don't offer or uses industry-specific language inconsistent with a real customer",
            "The review is posted at an unusual time (2–4am, or on a day you were closed)",
            "Multiple negative reviews arrive within hours or days of each other from different accounts (coordinated attack)",
            "The review text matches reviews left for competitor businesses (review spam networks reuse content)",
            "Reviewer's profile shows reviews for businesses in geographically impossible combinations",
        ]},
        { type: "h2", text: "Step 1: Don't Respond in Anger" },
        {
            type: "summary",
            text: "Screenshot the review and profile first. Public accusations can backfire if Google leaves the review up—stay professional for the audience who only sees your reply.",
        },
        { type: "p", text: "Your first instinct when you see a suspected fake review might be to publicly call it out as fake. Resist this. A public accusation in your response — even if correct — often makes you look defensive to third-party observers who don't know the context. It can also make the situation worse if you're wrong." },
        { type: "p", text: "Before doing anything, document the review: screenshot it including the reviewer's profile, note the date and time, and note any other suspicious reviews that arrived in the same window." },
        { type: "h2", text: "Step 2: Flag the Review for Removal" },
        {
            type: "summary",
            text: "Report through Maps or your GBP dashboard with the most accurate policy label—spam, conflict of interest, or off-topic. Google decides removal; flagging is not guaranteed.",
        },
        { type: "ol", items: [
            "Open Google Maps and find your business listing.",
            "Find the suspicious review.",
            "Click the three-dot menu (⋮) next to the review.",
            "Select 'Report review'.",
            "Choose the most accurate reason: 'Off topic', 'Spam or fake', 'Conflict of interest', or 'Bullying or harassment'.",
            "Google will review the flag. This typically takes 1–7 days, but complex cases can take weeks.",
        ]},
        { type: "tip", text: "You can also report reviews through Google Business Profile dashboard: go to 'Reviews', find the suspect review, click the flag icon, and follow the same process. The GBP dashboard route sometimes gets faster attention for verified business owners." },
        { type: "h2", text: "Step 3: Use the Google Business Profile Support Team" },
        {
            type: "summary",
            text: "Escalate through support.google.com/business with the review URL and your documentation if flagging stalls. Verified owners sometimes get faster review on clear policy violations.",
        },
        { type: "p", text: "If the flag process doesn't result in removal within 7–10 days and you believe the review violates Google's policies, escalate by contacting Google Business Profile support directly." },
        { type: "ul", items: [
            "Go to support.google.com/business",
            "Sign in with your GBP account",
            "Click 'Contact us' and select 'Reviews and photos'",
            "Choose 'Report inappropriate reviews'",
            "Provide the review URL, your documentation, and a clear explanation of why it violates Google's policies",
        ]},
        { type: "h2", text: "Step 4: Respond Strategically While You Wait" },
        {
            type: "summary",
            text: "Post a neutral reply: you cannot verify the visit, you take feedback seriously, and you welcome direct contact. That frames doubt for readers without a shouting match.",
        },
        { type: "p", text: "While Google investigates, you should respond to the suspected fake review — but carefully. Your goal is to signal to legitimate potential customers reading the review that there's uncertainty about its authenticity, without getting combative." },
        { type: "quote", text: "Hi [Name], we take all feedback seriously. However, we don't have any record of a visit matching your description, and we're unable to verify this experience in our records. If you've had a genuine issue, we'd sincerely like to address it — please contact us directly at [email]. We're reviewing this further." },
        { type: "h2", text: "What to Do If Google Won't Remove the Review" },
        {
            type: "summary",
            text: "If it stays, dilute impact with steady real reviews, keep the public reply professional, and explore legal options only with counsel when attacks look coordinated—not as a first reflex.",
        },
        { type: "p", text: "Google removes a relatively small percentage of flagged reviews, even ones that appear fake. If the review stays:" },
        { type: "ul", items: [
            "Continue to respond professionally — never harass or repeatedly call out the reviewer.",
            "Accelerate your legitimate review collection to dilute the fake review's impact on your overall rating.",
            "If you believe the fake reviews are a coordinated competitor attack, consider consulting with a local business attorney about defamation and tortious interference options.",
            "Document everything: fake reviews for legal purposes should be preserved with timestamps and reviewer profile data.",
        ]},
        { type: "warning", text: "Never retaliate by posting fake reviews for a competitor. This is a violation of Google's policies, potentially illegal in many jurisdictions, and creates significant legal and reputational risk for your business." },
        { type: "h2", text: "The Best Defense: Review Monitoring" },
        {
            type: "summary",
            text: "Real-time alerts let you flag within hours. Zyene Reviews monitors new Google, Facebook, and Yelp reviews and notifies your team so fakes do not sit visible for weeks unnoticed.",
        },
        { type: "p", text: "The fastest way to catch fake reviews is real-time monitoring — an alert the moment a new review is posted so you can respond and flag within hours rather than days. Many business owners don't discover fake reviews until they've been visible for weeks." },
        { type: "cta", ctaLabel: "Get real-time review alerts with Zyene Reviews →", ctaHref: "/features" },
    ],
};
