export interface ResponseExampleItem {
    label: string;
    template: string;
}

export const STAR_RESPONSE_EXAMPLES: ResponseExampleItem[] = [
    {
        label: "1-Star Review Example",
        template:
            "Hi [Name], thank you for letting us know about your experience at [Business Name]. This fell short of what we aim to deliver. Please contact our manager at [Phone/Email] so we can look into what happened and follow up directly.",
    },
    {
        label: "2-Star Review Example",
        template:
            "Hi [Name], we appreciate you sharing candid feedback about your visit to [Business Name]. We are sorry for the frustration around [wait time / issue] and are reviewing this with our team. Reach out at [Phone/Email] if you would like to discuss it further.",
    },
    {
        label: "3-Star Review Example",
        template:
            "Hi [Name], thank you for taking the time to review [Business Name]. We are glad [positive aspect] worked well, and we hear your note about [area to improve]. Your feedback helps us tighten our process for future visits.",
    },
    {
        label: "4-Star Review Example",
        template:
            "Hi [Name], thank you for the 4-star review and for choosing [Business Name]! We are glad you had a solid experience with [Service/Product], and we appreciate any notes on how we can make your next visit even smoother.",
    },
    {
        label: "5-Star Review Example",
        template:
            "Hi [Name], thank you for the 5-star review! Our team at [Business Name] truly appreciates you mentioning [Specific Detail]. Thanks for supporting a local business—we look forward to seeing you again.",
    },
];

export const SITUATION_TEMPLATES: ResponseExampleItem[] = [
    {
        label: "Wait time or scheduling delay",
        template:
            "Hi [Name], thank you for your patience and for sharing this feedback. We know your time is valuable and are sorry our schedule ran behind during your visit. We are reviewing our dispatch and check-in timing with the team.",
    },
    {
        label: "Pricing or estimate question",
        template:
            "Hi [Name], thank you for raising this. We want our estimates and invoices to be clear before work begins. Please call our office at [Phone] so we can walk through the invoice details with you directly.",
    },
    {
        label: "Specific staff shout-out",
        template:
            "Hi [Name], thank you for taking a moment to recognize [Team Member]! We shared your review with them and the rest of our crew at [Business Name]. We appreciate your support.",
    },
    {
        label: "Unverified or unfamiliar review",
        template:
            "Hi [Name], we take all feedback seriously, though we do not have a record matching your name at [Business Name]. Please email [Email] with your visit date so we can look into this.",
    },
];

export const INDUSTRY_TEMPLATES: ResponseExampleItem[] = [
    {
        label: "Restaurants & cafes",
        template:
            "Hi [Name], thanks for dining with us at [Restaurant Name]! We are glad you enjoyed [Dish/Atmosphere] and appreciate you sharing your experience with other local diners.",
    },
    {
        label: "Dental & medical-adjacent practices",
        template:
            "Thank you for sharing feedback about your experience with our team. We appreciate your kind words and look forward to continuing to serve our community. (Note: never confirm patient status or care details in a public reply.)",
    },
    {
        label: "Home services (plumbing, HVAC, electrical)",
        template:
            "Hi [Name], thank you for trusting [Company Name] with your [repair/install]. We are glad our technician arrived on time and explained everything clearly. Call us anytime you need a hand.",
    },
    {
        label: "Auto repair shops",
        template:
            "Hi [Name], thanks for bringing your vehicle to [Shop Name]. We appreciate you trusting our mechanics with your [service] and are glad the process went smoothly. Drive safe!",
    },
];

