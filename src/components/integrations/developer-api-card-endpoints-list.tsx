import { Badge } from "@/components/ui/badge";
import { DEVELOPER_API_ENDPOINTS } from "./developer-api-card-constants";

export function DeveloperApiCardEndpointsList() {
    return (
        <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                Available Endpoints
            </label>
            <div className="rounded-lg border divide-y bg-muted/30">
                {DEVELOPER_API_ENDPOINTS.map((ep) => (
                    <div key={ep.path} className="flex items-center gap-3 px-3 py-2.5">
                        <Badge
                            variant="outline"
                            className={`font-mono text-[10px] shrink-0 ${
                                ep.method === "POST"
                                    ? "text-chart-2 border-chart-2/40 dark:text-chart-2 dark:border-chart-2/30"
                                    : "text-primary border-primary/30 dark:text-primary dark:border-primary/40"
                            }`}
                        >
                            {ep.method}
                        </Badge>
                        <span className="font-mono text-xs text-foreground">{ep.path}</span>
                        <span className="text-xs text-muted-foreground ml-auto hidden sm:block">{ep.desc}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
