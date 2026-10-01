import { Choice, NumberField, TextField, Toggle, type WidgetFieldsProps } from "@/components/widgets/builder/widget-fields";
import { isBadgeLayout, type WidgetConfig } from "@/lib/widgets/config";

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
        {!isBadgeLayout(config.layout) && <>
        <Toggle label="Show widget title" value={config.showTitle} onChange={v => update("showTitle", v)} />
        <TextField label="Widget title" value={config.title} maxLength={100} onChange={v => update("title", v)} />
        <TextField label="Caption" value={config.caption} maxLength={250} onChange={v => update("caption", v)} />
        <Toggle label="Show header" value={config.showHeader} onChange={v => update("showHeader", v)} />
        <Choice label="Header style" value={config.headerStyle} options={["google-reviews", "rating", "reviews-count", "centered", "wall"]} onChange={v => update("headerStyle", v as WidgetConfig["headerStyle"])} />
        </>}
        <Toggle label="Show overall rating" value={config.showRating} onChange={v => update("showRating", v)} />
        <Toggle label="Show review count" value={config.showCount} onChange={v => update("showCount", v)} />
        <Toggle label="Write a review button" value={config.showButton} onChange={v => update("showButton", v)} />
        <p className="wb-note">The review button uses the Google review link configured for this business.</p>
    </>;
    if (section === "AI Features") return <>
        {!isBadgeLayout(config.layout) && <>
        <Toggle label="AI-generated summary card" value={config.showSummary} onChange={v => update("showSummary", v)} />
        <p className="wb-note">Summarizes the visible reviews for your business. Generate the summary below before publishing an AI template.</p>
        </>}
        {isBadgeLayout(config.layout) && <p className="wb-note">Choose a carousel, grid, list or review wall to display an AI summary card.</p>}
    </>;
    return <>
        <Toggle label="Reviewer photo" value={config.showAvatar} onChange={v => update("showAvatar", v)} />
        <Toggle label="Reviewer name" value={config.showName} onChange={v => update("showName", v)} />
        <Toggle label="Google published-review mark" value={config.showVerified} onChange={v => update("showVerified", v)} />
        <Toggle label="Review source" value={config.showSource} onChange={v => update("showSource", v)} />
        <Choice label="Source style" value={config.sourceStyle} options={["avatar", "inline", "right"]} onChange={v => update("sourceStyle", v as WidgetConfig["sourceStyle"])} />
        <Choice label="Review card style" value={config.reviewStyle} options={["classic", "bubble"]} onChange={v => update("reviewStyle", v as WidgetConfig["reviewStyle"])} />
        <Toggle label="Review rating" value={config.showReviewRating} onChange={v => update("showReviewRating", v)} />
        <Toggle label="Review date" value={config.showDate} onChange={v => update("showDate", v)} />
        <Toggle label="Review photos" value={config.showPhotos} onChange={v => update("showPhotos", v)} />
        <Toggle label="Business owner reply" value={config.showReply} onChange={v => update("showReply", v)} />
        <Choice label="Review text" value={config.textMode} options={["short", "full"]} onChange={v => update("textMode", v as WidgetConfig["textMode"])} />
        <Choice label="Preview text length" value={config.textLength} options={["brief", "extended"]} onChange={v => update("textLength", v as WidgetConfig["textLength"])} />
        <p className="wb-note">Long reviews include a Read more button. Photos appear when the original review contains synced images.</p>
    </>;
}
