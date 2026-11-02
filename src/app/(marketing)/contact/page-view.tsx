import { BreadcrumbJsonLd, OrganizationJsonLd, WebPageJsonLd } from "@/components/seo/json-ld";
import { ContactContentSection } from "./contact-content-section";

const CONTACT_URL = "https://zyenereviews.com/contact";

export default function ContactPage() {
    return (
        <>
            <OrganizationJsonLd />
            <WebPageJsonLd type="ContactPage" name="Contact Zyene Reviews" description="Contact Zyene Reviews sales and support. Mon-Fri, 9am-6pm EST; replies within 24 hours." url={CONTACT_URL} />
            <BreadcrumbJsonLd items={[{ name: "Home", url: "https://zyenereviews.com/" }, { name: "Contact", url: CONTACT_URL }]} />
            <ContactContentSection />
        </>
    );
}
