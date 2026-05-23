import { Badge } from "@/components/ui/badge";

export function QuestionsPageClientStatusBadge({ hasMerchantAnswer }: { hasMerchantAnswer: boolean }) {
    if (hasMerchantAnswer) {
        return <Badge variant="secondary">Answered</Badge>;
    }
    return (
        <Badge variant="outline" className="border-chart-4/35 bg-chart-4/12 text-chart-4">
            Needs answer
        </Badge>
    );
}
