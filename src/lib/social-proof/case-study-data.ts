// Educational workflow examples. Existing slugs remain stable for inbound links.
export const CASE_STUDY_COMPOSITE_DISCLAIMER = "An educational workflow example, not a named customer engagement, testimonial, or promised result.";

export interface CaseStudyMetric {
    label: string;
    before: string;
    after: string;
    change: string;
}

export interface CaseStudy {
    slug: string;
    company: string;
    industry: string;
    industrySlug: string;
    location: string;
    size: string;
    headline: string;
    excerpt: string;
    /** ~60-word GEO summary of outcomes (uses metrics already stated on the page). */
    resultsSummary: string;
    challenge: string;
    solutionFeatures: string[];
    metrics: CaseStudyMetric[];
    quote: string;
    quoteAuthor: string;
    quoteRole: string;
    timeline: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    "slug": "sunrise-dental-austin",
    "company": "Dental workflow",
    "industry": "Dental",
    "industrySlug": "dental",
    "location": "Illustrative scenario",
    "size": "Adapt to your business",
    "headline": "Follow up after an appointment",
    "excerpt": "Patients may have questions about scheduling or billing that need a staff response. Keep public replies general and move individual care details to a private conversation.",
    "resultsSummary": "Example workflow: Send a request after a completed appointment → Review private feedback and assign follow-up → Draft replies without confirming patient or treatment details. Measure your own results; no rating or review-growth outcome is guaranteed.",
    "challenge": "Patients may have questions about scheduling or billing that need a staff response. Keep public replies general and move individual care details to a private conversation.",
    "solutionFeatures": [
      "Send a request after a completed appointment",
      "Review private feedback and assign follow-up",
      "Draft replies without confirming patient or treatment details",
      "Compare locations on a plan that includes multiple businesses"
    ],
    "metrics": [],
    "quote": "",
    "quoteAuthor": "",
    "quoteRole": "",
    "timeline": "A repeatable routine, not a promised timeline",
    "metaTitle": "Dental Review Workflow Example",
    "metaDescription": "Explore a practical dental review workflow with requests, feedback, and replies. An educational example, not a customer testimonial.",
    "keywords": [
      "dental review management",
      "dental review requests"
    ]
  },
  {
    "slug": "wolfpack-bbq-charlotte",
    "company": "Restaurants workflow",
    "industry": "Restaurants",
    "industrySlug": "restaurants",
    "location": "Illustrative scenario",
    "size": "Adapt to your business",
    "headline": "Build a post-visit review routine",
    "excerpt": "During busy service, review requests and replies can be easy to miss. A repeatable handoff helps managers follow up on guest feedback.",
    "resultsSummary": "Example workflow: Send a request after a completed visit → Share a branded QR code on receipts or at the counter → Review food and service feedback with the team. Measure your own results; no rating or review-growth outcome is guaranteed.",
    "challenge": "During busy service, review requests and replies can be easy to miss. A repeatable handoff helps managers follow up on guest feedback.",
    "solutionFeatures": [
      "Send a request after a completed visit",
      "Share a branded QR code on receipts or at the counter",
      "Review food and service feedback with the team",
      "Check the needs-reply inbox before the next shift"
    ],
    "metrics": [],
    "quote": "",
    "quoteAuthor": "",
    "quoteRole": "",
    "timeline": "A repeatable routine, not a promised timeline",
    "metaTitle": "Restaurants Review Workflow Example",
    "metaDescription": "Explore a practical restaurants review workflow with requests, feedback, and replies. An educational example, not a customer testimonial.",
    "keywords": [
      "restaurants review management",
      "restaurants review requests"
    ]
  },
  {
    "slug": "apex-hvac-denver",
    "company": "Home Services workflow",
    "industry": "Home Services",
    "industrySlug": "home-services",
    "location": "Illustrative scenario",
    "size": "Adapt to your business",
    "headline": "Ask for feedback after the job",
    "excerpt": "Service teams need to know which customer experiences require follow-up after technicians leave the site.",
    "resultsSummary": "Example workflow: Trigger a request from a completed-job workflow → Check the actual request audience before sending → Assign private feedback to the right team member. Measure your own results; no rating or review-growth outcome is guaranteed.",
    "challenge": "Service teams need to know which customer experiences require follow-up after technicians leave the site.",
    "solutionFeatures": [
      "Trigger a request from a completed-job workflow",
      "Check the actual request audience before sending",
      "Assign private feedback to the right team member",
      "Draft a reply and verify details before publishing"
    ],
    "metrics": [],
    "quote": "",
    "quoteAuthor": "",
    "quoteRole": "",
    "timeline": "A repeatable routine, not a promised timeline",
    "metaTitle": "Home Services Review Workflow Example",
    "metaDescription": "Explore a practical home services review workflow with requests, feedback, and replies. An educational example, not a customer testimonial.",
    "keywords": [
      "home services review management",
      "home services review requests"
    ]
  },
  {
    "slug": "bellas-salon-portland",
    "company": "Salons & Spas workflow",
    "industry": "Salons & Spas",
    "industrySlug": "salons",
    "location": "Illustrative scenario",
    "size": "Adapt to your business",
    "headline": "Follow up after each appointment",
    "excerpt": "A salon can make feedback collection part of its appointment routine without asking staff to write every reply from scratch.",
    "resultsSummary": "Example workflow: Send an appointment follow-up request → Preview the message with the salon name and link → Review feedback themes with staff. Measure your own results; no rating or review-growth outcome is guaranteed.",
    "challenge": "A salon can make feedback collection part of its appointment routine without asking staff to write every reply from scratch.",
    "solutionFeatures": [
      "Send an appointment follow-up request",
      "Preview the message with the salon name and link",
      "Review feedback themes with staff",
      "Share original customer reviews in a website widget"
    ],
    "metrics": [],
    "quote": "",
    "quoteAuthor": "",
    "quoteRole": "",
    "timeline": "A repeatable routine, not a promised timeline",
    "metaTitle": "Salons & Spas Review Workflow Example",
    "metaDescription": "Explore a practical salons & spas review workflow with requests, feedback, and replies. An educational example, not a customer testimonial.",
    "keywords": [
      "salons & spas review management",
      "salons & spas review requests"
    ]
  },
  {
    "slug": "precision-auto-works-phoenix",
    "company": "Auto Repair workflow",
    "industry": "Auto Repair",
    "industrySlug": "auto-repair",
    "location": "Illustrative scenario",
    "size": "Adapt to your business",
    "headline": "Close the loop after vehicle pickup",
    "excerpt": "Customers may have questions about communication, timing, or the repair experience. Give the service desk a consistent way to follow up.",
    "resultsSummary": "Example workflow: Request feedback after vehicle pickup → Review open requests and customer contact preferences → Respond to service concerns privately. Measure your own results; no rating or review-growth outcome is guaranteed.",
    "challenge": "Customers may have questions about communication, timing, or the repair experience. Give the service desk a consistent way to follow up.",
    "solutionFeatures": [
      "Request feedback after vehicle pickup",
      "Review open requests and customer contact preferences",
      "Respond to service concerns privately",
      "Track response coverage and request completion separately"
    ],
    "metrics": [],
    "quote": "",
    "quoteAuthor": "",
    "quoteRole": "",
    "timeline": "A repeatable routine, not a promised timeline",
    "metaTitle": "Auto Repair Review Workflow Example",
    "metaDescription": "Explore a practical auto repair review workflow with requests, feedback, and replies. An educational example, not a customer testimonial.",
    "keywords": [
      "auto repair review management",
      "auto repair review requests"
    ]
  }
];

export const CASE_STUDY_MAP = Object.fromEntries(CASE_STUDIES.map((study) => [study.slug, study])) as Record<string, CaseStudy>;
export const CASE_STUDY_SLUGS = CASE_STUDIES.map((study) => study.slug);
