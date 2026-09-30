import { Choice, NumberField, TextField, Toggle, type WidgetFieldsProps } from "@/components/widgets/builder/widget-fields";
import type { WidgetConfig } from "@/lib/widgets/config";

export function WidgetContentControls({ config, update, section }: WidgetFieldsProps & { section: string }) {
    if (section === "Content") return <>
        <p className="wb-note">Reviews come from this business’s connected accounts. Hidden reviews are never displayed.</p>
        <Choice label="Review source" value={config.source} options={["google", "all"]} onChange={v => update("source", v as WidgetConfig["source"])} />
        <NumberField label="Minimum star rating" value={config.minRating} min={1} max={5} onChange={v => update("minRating", v)} />
        <NumberField label="Maximum reviews" value={config.limit} min={1} max={100} onChange={v => update("limit", v)} />
        <Choice label="Sort reviews" value={config.sort} options={["newest", "highest", "oldest"]} onChange={v => update("sort", v as WidgetConfig["sort"])} />
        <Toggle label="Only reviews with text" value={config.textOnly} onChange={v => update("textOnly", v)} />
        <TextField label="Exclude words or names (comma separated)" value={config.exclude} maxLength={200} onChange={v => update("exclude", v)} />
        <p className="wb-note">Filters apply to the latest 100 visible reviews. Overall ratings always include every visible review from the selected source.</p>
    </>;
    if (section === "Header") return <>
        <Toggle label="Show widget title" value={config.showTitle} onChange={v => update("showTitle", v)} />
        <TextField label="Widget title" value={config.title} maxLength={100} onChange={v => update("title", v)} />
        <TextField label="Caption" value={config.caption} maxLength={250} onChange={v => update("caption", v)} />
        <Toggle label="Show header" value={config.showHeader} onChange={v => update("showHeader", v)} />
        <Toggle label="Show overall rating" value={config.showRating} onChange={v => update("showRating", v)} />
        <Toggle label="Show review count" value={config.showCount} onChange={v => update("showCount", v)} />
        <Toggle label="Write a review button" value={config.showButton} onChange={v => update("showButton", v)} />
        <p className="wb-note">The review button uses the Google review link configured for this business.</p>
    </>;
    if (section === "AI Features") return <>
        <Toggle label="Show AI review highlights" value={config.showSummary} onChange={v => update("showSummary", v)} />
        <p className="wb-note">Displays up to three saved AI summaries with their reviewer names. Highlights appear only when visible reviews have already been analyzed in Zyene.</p>
    </>;
    return <>
        <Toggle label="Reviewer photo" value={config.showAvatar} onChange={v => update("showAvatar", v)} />
        <Toggle label="Review date" value={config.showDate} onChange={v => update("showDate", v)} />
        <Toggle label="Review photos" value={config.showPhotos} onChange={v => update("showPhotos", v)} />
        <p className="wb-note">Long reviews include a Read more button. Photos appear when the original review contains synced images.</p>
    </>;
}
