import {
  Ban, FileSpreadsheet, FlaskConical, History, ListFilter, Merge, Send, Tag, Tags, Upload, UserPlus,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import {
  CrmHeroVisual, CrmImportVisual, CrmProfileVisual,
} from "@/components/marketing/feature-landing/visuals/customer-crm-visuals";

export const CUSTOMER_CRM_CONTENT: FeatureLandingContent = {
  slug: "customer-crm",
  hero: {
    kicker: "Customer list",
    headline: "Know who to ask next.",
    lede: "Names, contact details, notes and tags in one list. Import a CSV, see who finished a request, and ask the right people.",
    visual: <CrmHeroVisual />,
    visualLabel: "Customers page with segment tabs, three selected customers and the bulk action bar",
  },
  flow: {
    title: "From a spreadsheet to the right people asked",
    intro: "Everything happens on the Customers page and each customer’s profile.",
    steps: [
      { icon: Upload, title: "Bring customers in", text: "Add them one at a time or import a CSV with a name, email and phone column.", sample: "customers.csv" },
      { icon: Tags, title: "Organize", text: "Add tags, merge duplicates and search by name, email or phone.", sample: "regulars" },
      { icon: ListFilter, title: "Pick a segment", text: "Filter to who hasn’t completed a request, who is recent, who opted out, or by tag.", sample: "Not completed (61)" },
      { icon: Send, title: "Ask", text: "Select customers and continue in the campaign builder, or send one request from a profile.", sample: "Send Request" },
      { icon: History, title: "Follow along", text: "Each profile keeps a timeline of requests and private feedback, newest first.", sample: "Completed · Oct 12" },
    ],
  },
  rows: [
    {
      eyebrow: "Ask the right people",
      title: "Filter, select and send in a few clicks",
      text: "Segment tabs show who was asked but hasn’t completed a request, who you added or asked recently, and who opted out. Select the people you want and continue in the campaign builder.",
      points: [
        "Search by name, email or phone, or filter by tag",
        "Select up to 500 customers for one bulk action",
        "Opted-out customers are left out automatically",
      ],
      media: {
        kind: "photo",
        src: "/marketing/home/cafe-owner-feedback-candid-v2.webp",
        alt: "A café owner in an apron reading a tablet behind the espresso counter",
        objectPosition: "center 30%",
        overlay: (
          <>
            <OverlayCard icon={ListFilter} title="Not completed · 61 customers" text="Asked before, no completed request yet" tone="dark" />
            <OverlayCard icon={Send} title="24 customers selected" text="Continue in the campaign builder" tone="brand" />
          </>
        ),
      },
    },
    {
      eyebrow: "Import & export",
      title: "Bring in the customers you already have",
      text: "Upload a CSV from your booking tool, POS or spreadsheet. Preview the first rows, confirm you have consent to contact them, and import.",
      points: [
        "A name, email and phone column, with a template to download",
        "Every row needs an email or a phone number",
        "Up to 5,000 rows and 5 MB per file; export to CSV anytime",
      ],
      media: { kind: "visual", node: <CrmImportVisual />, label: "A customer spreadsheet next to the Import Customers dialog" },
    },
    {
      eyebrow: "Customer profile",
      title: "Every request and reply, per customer",
      text: "Open a customer to see their details, tags and a timeline of review requests and private feedback. Send a new request from the same screen.",
      points: [
        "Requests sent, completed and last contacted",
        "Edit the name and tags in place",
        "Mark someone as opted out, or clear it, from the list",
      ],
      media: { kind: "visual", node: <CrmProfileVisual />, label: "Customer profile with tags, summary and activity timeline" },
    },
  ],
  facts: [
    { value: "6", label: "Segment tabs, from All to Opted Out" },
    { value: "5,000", label: "Rows per CSV import" },
    { value: "500", label: "Customers per bulk action" },
    { value: "30 days", label: "The window behind the Recent tab" },
  ],
  capabilities: {
    title: "Tools for a clean, useful list",
    items: [
      { icon: UserPlus, title: "Add by hand", text: "Full name and email, plus an optional phone number and notes." },
      { icon: FileSpreadsheet, title: "CSV import & export", text: "Import with a preview first; export names, contacts, tags and request history." },
      { icon: Tag, title: "Tags", text: "Add or remove tags in bulk and filter the list by tag." },
      { icon: Merge, title: "Merge duplicates", text: "Combine two records for the same person into one." },
      { icon: Ban, title: "Opt-out control", text: "Mark a customer as opted out and no request will reach them." },
      { icon: FlaskConical, title: "Test contacts", text: "Tag a contact zyene:test to keep it out of sends and customer metrics." },
    ],
  },
  note: "A completed request means the customer finished your review page; Zyene can’t confirm that Google published a review. Importing asks you to confirm you have consent to contact everyone in the file.",
  faqs: [
    { question: "How do I import customers from a spreadsheet?", answer: "On the Customers page choose Import CSV and upload a .csv file with name, email and phone columns (a template is provided). Every row needs an email or a phone number. You can import up to 5,000 rows and 5 MB at a time, and you preview the rows and confirm consent first." },
    { question: "What happens to customers who are already in my list?", answer: "When an imported row matches an existing email or phone number, that contact is updated instead of added twice. For duplicates with different details, use Merge duplicate from the customer’s menu." },
    { question: "Can I export my customer list?", answer: "Yes. Export CSV downloads each customer’s name, email, phone, tags, requests sent, last send date and whether they have reviewed." },
    { question: "What do the customer segments mean?", answer: "Not completed: asked at least once with no completed request yet. Completed request: finished a request. Recent: added or asked in the last 30 days. No Contact Info: no email or phone. Opted Out: marked as opted out." },
    { question: "Can I send review requests to many customers at once?", answer: "Yes. Select up to 500 customers and choose Send Request to continue in the campaign builder. Opted-out customers are left out." },
  ],
  related: ["review-requests", "review-campaigns", "review-collection"],
};
