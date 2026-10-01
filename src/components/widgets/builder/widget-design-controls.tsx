import { WIDGET_THEMES, isBadgeLayout, type WidgetConfig } from "@/lib/widgets/config";
import { Choice, NumberField, Toggle, type WidgetFieldsProps } from "@/components/widgets/builder/widget-fields";
import { WidgetTemplatePicker } from "@/components/widgets/builder/widget-template-picker";
import { WIDGET_ACCENTS, WIDGET_COLORS } from "@/lib/widgets/palette";

export function WidgetDesignControls({ config, update, section, onChange }: WidgetFieldsProps & { section: string; onChange: (config: WidgetConfig) => void }) {
    const horizontal = config.layout === "carousel" || config.layout === "slider";
    const sticker = ["light-sticker", "bold-sticker", "tag-sticker", "oval-sticker", "achievement"].includes(config.layout);
    if (section === "Layout") return <>
        <WidgetTemplatePicker config={config} onChange={onChange} layoutsOnly />
        <NumberField label="Maximum width (px)" value={config.width} min={280} max={1600} onChange={v => update("width", v)} />
        {["carousel", "grid", "masonry"].includes(config.layout) && <NumberField label="Desktop columns (0 = auto)" value={config.columns} min={0} max={6} onChange={v => update("columns", v)} />}
        {!isBadgeLayout(config.layout) && <NumberField label="Item spacing (px)" value={config.gap} min={0} max={40} onChange={v => update("gap", v)} />}
        {isBadgeLayout(config.layout) ? <>
            <Toggle label="Floating on website" value={config.floating} onChange={v => update("floating", v)} />
            <Choice label="Position" value={config.position} options={["left", "right"]} onChange={v => update("position", v as WidgetConfig["position"])} />
            <Choice label="Alignment" value={config.badgeAlign} options={["left", "center", "right"]} onChange={v => update("badgeAlign", v as WidgetConfig["badgeAlign"])} />
            {sticker && <NumberField label="Sticker size (px)" value={config.badgeSize} min={80} max={240} onChange={v => update("badgeSize", v)} />}
            {(sticker || config.layout === "card-badge") && <Choice label="Label" value={config.badgeLabel} options={["none", "excellent", "google-rating"]} onChange={v => update("badgeLabel", v as WidgetConfig["badgeLabel"])} />}
            {config.layout !== "review-request" && <><Toggle label="Google icon" value={config.showGoogleIcon} onChange={v => update("showGoogleIcon", v)} />
                <Choice label="Click action" value={config.clickAction} options={["popup", "google", "none"]} onChange={v => update("clickAction", v as WidgetConfig["clickAction"])} /></>}
        </> : horizontal && <>
            <Toggle label="Navigation arrows" value={config.showArrows} onChange={v => update("showArrows", v)} />
            <Toggle label="Pagination" value={config.showPagination} onChange={v => update("showPagination", v)} />
            <Toggle label="Auto slide" value={config.autoplay} onChange={v => update("autoplay", v)} />
            <NumberField label="Auto slide interval (seconds)" value={config.autoplayDelay} min={2} max={20} onChange={v => update("autoplayDelay", v)} />
            <NumberField label="Animation duration (ms)" value={config.animationDuration} min={150} max={1500} onChange={v => update("animationDuration", v)} />
            {config.layout === "carousel" && <><NumberField label="Rows" value={config.rows} min={1} max={6} onChange={v => update("rows", v)} />
                <NumberField label="Rows on mobile" value={config.mobileRows} min={1} max={3} onChange={v => update("mobileRows", v)} /></>}
            <Choice label="Scroll mode" value={config.scrollMode} options={["item", "page"]} onChange={v => update("scrollMode", v as WidgetConfig["scrollMode"])} />
            <Toggle label="Swipe navigation" value={config.swipe} onChange={v => update("swipe", v)} />
        </>}
        <p className="wb-note">Layouts adjust to the website width. Carousels support touch swipes and keyboard scrolling.</p>
    </>;
    if (section === "Settings") return <>
        <Choice label="Font" value={config.font} options={["sans-serif", "serif", "inherit"]} onChange={v => update("font", v as WidgetConfig["font"])} />
        <NumberField label="Review text size (px)" value={config.fontSize} min={12} max={22} onChange={v => update("fontSize", v)} />
        <Toggle label="Right-to-left text" value={config.rtl} onChange={v => update("rtl", v)} />
        <p className="wb-note">Widgets load your latest synced reviews automatically. After changing a design, copy its new installation code to your website.</p>
    </>;
    return <>
        <div className="wb-theme-grid">{WIDGET_THEMES.map(theme => <button type="button" key={theme} aria-pressed={config.theme === theme}
            className={`wb-theme ${config.theme === theme ? "wb-selected" : ""}`} onClick={() => onChange({ ...config, theme, background: undefined, cardColor: undefined, textColor: undefined, mutedColor: undefined, borderColor: undefined })}>
            <span className={`wb-theme-sample wb-theme-${theme}`}><b>G</b><span>★★★★★</span><i style={{ background: config.accent }} /></span>{theme.replaceAll("-", " ")}
        </button>)}</div>
        <label className="wb-color">Accent color<input type="color" value={config.accent} onChange={e => update("accent", e.target.value)} /></label>
        <div className="wb-swatches">{WIDGET_ACCENTS.map(color =>
            <button key={color} type="button" aria-label={`Use ${color} accent`} aria-pressed={config.accent === color} style={{ background: color }} onClick={() => update("accent", color)} />)}</div>
        <label className="wb-color">Star color<input type="color" value={config.stars} onChange={e => update("stars", e.target.value)} /></label>
        <NumberField label="Corner radius (px)" value={config.radius} min={0} max={32} onChange={v => update("radius", v)} />
        <details className="wb-custom-theme"><summary>Customize theme</summary>{([
            ["background", "Widget background"], ["cardColor", "Review background"], ["textColor", "Text color"],
            ["mutedColor", "Date and count color"], ["borderColor", "Review outline"], ["verifiedColor", "Google mark color"],
        ] as const).map(([key, label]) => <label className="wb-color" key={key}>{label}<input type="color" value={config[key] || (key === "background" ? WIDGET_COLORS.lightBackground : key === "cardColor" ? WIDGET_COLORS.lightCard : key === "verifiedColor" ? config.accent : WIDGET_COLORS.lightText)} onChange={e => update(key, e.target.value)} /></label>)}</details>
    </>;
}
