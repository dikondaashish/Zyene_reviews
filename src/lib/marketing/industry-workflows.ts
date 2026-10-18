/** Planning examples grounded in existing request, inbox and reporting capabilities. */
export const INDUSTRY_WORKFLOWS: Record<string, { title: string; example: string; steps: string[]; measure: string; links: { label: string; href: string }[] }> = {
  "home-services": {
    title: "A follow-up process for HVAC and home-service visits",
    example: "Example: after a completed repair or maintenance visit, the dispatcher checks contact permission and sends an approved request. Zyene does not connect to field-service software directly; a webhook or your team triggers the request.",
    steps: ["Use job completion as the team's trigger; verify the customer contact rather than importing every old lead.", "Keep repair, installation and maintenance context in your internal records; avoid exposing home addresses or service details in public replies.", "Review private feedback and unanswered public reviews before the next dispatch cycle.", "Use approved API or webhook triggers only after testing your integration's request mapping."],
    measure: "Compare delivered requests and opt-outs by service type. Track qualified calls and booked work separately; request engagement is not proof of a published review or a lead.",
    links: [{ label: "HVAC reputation management guide", href: "/blog/hvac-home-services-reputation-management" }, { label: "HVAC leads from Google Maps", href: "/blog/how-to-get-hvac-leads-from-google-maps" }, { label: "Review collection setup", href: "/features/review-collection" }],
  },
  hotels: {
    title: "Give hotel feedback a clear owner after checkout",
    example: "Example: the front desk confirms an agreed guest contact channel after checkout, then sends the hotel-specific request. Zyene does not connect to property-management systems directly; a webhook or your team triggers the request.",
    steps: ["Check the guest's contact permission and the correct property before sending.", "Use a neutral message that welcomes honest feedback about the stay.", "Assign service complaints to the responsible team and keep guest details out of public replies.", "Review your connected Google, Facebook and Yelp inbox. Other booking and travel sites require their own supported tools or processes."],
    measure: "Record delivery, engagement and follow-up time by property. A guest clicking a link is not confirmation of a published review or a future booking.",
    links: [{ label: "SMS and email request examples", href: "/blog/how-to-ask-customers-for-reviews-sms-email-templates" }, { label: "AI replies with human review", href: "/features/ai-replies" }, { label: "Multi-location plan limits", href: "/pricing" }],
  },
  salons: {
    title: "Build a respectful follow-up after salon appointments",
    example: "Example: the front desk sends an approved message after a completed appointment using the client's agreed channel. Zyene does not connect to salon-booking software directly; a webhook or your team triggers the request.",
    steps: ["Confirm the appointment was completed and check contact preferences before sending.", "Invite honest feedback without requesting a rating or rewarding a review.", "Keep appointment details and private client information out of a public reply.", "Use reviewed AI drafts for concerns needing individual attention; use automatic Google replies only within your chosen settings."],
    measure: "Track request delivery and opt-outs, then assign a realistic response target. Record repeat appointments separately instead of attributing them automatically to reviews.",
    links: [{ label: "Review request templates", href: "/resources/review-request-templates" }, { label: "Automatic reply settings", href: "/features/automatic-review-replies" }, { label: "Review and request analytics", href: "/features/analytics" }],
  },
};
