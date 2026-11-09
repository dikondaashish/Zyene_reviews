import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Campaign } from "./campaign-detail-types";
import type { CampaignDetailState } from "./use-campaign-detail";

interface CampaignDetailAddContactsFormProps {
    campaign: Campaign;
    detail: CampaignDetailState;
}

export function CampaignDetailAddContactsForm({
    campaign,
    detail,
}: CampaignDetailAddContactsFormProps) {
    const {
        addMode,
        contactName,
        setContactName,
        contactPhone,
        setContactPhone,
        contactEmail,
        setContactEmail,
        bulkPhones,
        setBulkPhones,
    } = detail;

    if (addMode === "single") {
        return (
            <div className="space-y-3">
                <div>
                    <Label htmlFor="contact-name">Name (optional)</Label>
                    <Input
                        id="contact-name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="John Smith"
                    />
                </div>
                {(campaign.channel === "sms" || campaign.channel === "both") && (
                    <div>
                        <Label htmlFor="contact-phone">Phone</Label>
                        <Input
                            id="contact-phone"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>
                )}
                {(campaign.channel === "email" || campaign.channel === "both") && (
                    <div>
                        <Label htmlFor="contact-email">Email</Label>
                        <Input
                            id="contact-email"
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="john@example.com"
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div>
                <Label htmlFor="bulk-phones">
                    {campaign.channel === "email" ? "Email addresses (one per line)"
                        : campaign.channel === "sms" ? "Phone numbers (one per line)"
                        : "Phone numbers or emails (one per line)"}
                </Label>
                <Textarea
                    id="bulk-phones"
                    value={bulkPhones}
                    onChange={(e) => setBulkPhones(e.target.value)}
                    rows={8}
                    placeholder={campaign.channel === "email"
                        ? "ann@example.com\nbo@example.com"
                        : "+15551234567\n(555) 987-6543\nann@example.com"}
                    className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                    {bulkPhones.split("\n").filter((l) => l.trim()).length} contacts
                </p>
            </div>
        </div>
    );
}
