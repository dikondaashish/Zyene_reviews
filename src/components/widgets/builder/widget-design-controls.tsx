import { WIDGET_THEMES, isBadgeLayout, type WidgetConfig } from "@/lib/widgets/config";
import { Choice, NumberField, Toggle, type WidgetFieldsProps } from "@/components/widgets/builder/widget-fields";
import { WidgetTemplatePicker } from "@/components/widgets/builder/widget-template-picker";

export function WidgetDesignControls({ config, update, section, onChange }: WidgetFieldsProps & { section: string; onChange: (config: WidgetConfig) => void }) {
    if (section === "Layout") return <>
        <WidgetTemplatePicker config={config} onChange={onChange} layoutsOnly />
        <NumberField label="Maximum width (px)" value={config.width} min={280} max={1600} onChange={v => update("width", v)} />
        {!isBadgeLayout(config.layout) && <NumberField label="Desktop columns (0 = auto)" value={config.columns} min={0} max={6} onChange={v => update("columns", v)} />}
        <NumberField label="Item spacing (px)" value={config.gap} min={0} max={40} onChange={v => update("gap", v)} />
        {isBadgeLayout(config.layout) ? <>
            <Toggle label="Floating on website" value={config.floating} onChange={v => update("floating", v)} />
            <Choice label="Position" value={config.position} options={["left", "right"]} onChange={v => update("position", v as WidgetConfig["position"])} />
        </> : <>
            <Toggle label="Navigation arrows" value={config.showArrows} onChange={v => update("showArrows", v)} />
            <Toggle label="Pagination" value={config.showPagination} onChange={v => update("showPagination", v)} />
            <Toggle label="Auto slide every 5 seconds" value={config.autoplay} onChange={v => update("autoplay", v)} />
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
            className={`wb-theme ${config.theme === theme ? "wb-selected" : ""}`} onClick={() => update("theme", theme)}>
            <span className={`wb-theme-sample wb-theme-${theme}`}><b>G</b><span>★★★★★</span><i style={{ background: config.accent }} /></span>{theme.replaceAll("-", " ")}
        </button>)}</div>
        <label className="wb-color">Accent color<input type="color" value={config.accent} onChange={e => update("accent", e.target.value)} /></label>
        <div className="wb-swatches">{["#197bff", "#8855ff", "#df5287", "#e9563f", "#f58220", "#f5c842", "#50ad55", "#242424"].map(color =>
            <button key={color} type="button" aria-label={`Use ${color} accent`} aria-pressed={config.accent === color} style={{ background: color }} onClick={() => update("accent", color)} />)}</div>
        <label className="wb-color">Star color<input type="color" value={config.stars} onChange={e => update("stars", e.target.value)} /></label>
        <NumberField label="Corner radius (px)" value={config.radius} min={0} max={32} onChange={v => update("radius", v)} />
    </>;
}
