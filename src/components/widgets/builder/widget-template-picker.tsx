import { WIDGET_TEMPLATES, LAYOUT_LABELS } from "@/lib/widgets/templates";
import { isBadgeLayout, parseWidgetConfig, WIDGET_LAYOUTS, type WidgetConfig } from "@/lib/widgets/config";

function Thumbnail({ config }: { config: WidgetConfig }) {
    const dark = ["dark", "outline-dark", "deep-tint"].includes(config.theme);
    const badge = isBadgeLayout(config.layout);
    return <div className={`wb-thumbnail ${dark ? "wb-thumb-dark" : ""}`} style={{ "--thumb-accent": config.accent } as React.CSSProperties} aria-hidden="true">
        {badge ? <div className={`wb-mini-badge ${config.layout === "oval-sticker" ? "wb-mini-oval" : ""}`}>
            <b>G</b><span>Excellent</span><span className="wb-mini-stars">★★★★★</span><i />
        </div> : <>
            {config.showHeader && <div className="wb-mini-header"><b>G</b><span className="wb-mini-stars">★★★★★</span><i /></div>}
            <div className={`wb-mini-feed wb-mini-${config.layout}`}>
                {Array.from({ length: config.layout === "slider" ? 1 : ["grid", "masonry"].includes(config.layout) ? 4 : 3 }, (_, i) => <div key={i}>
                    <span className="wb-mini-person" /><span className="wb-mini-stars">★★★★★</span><i /><i /><i />
                </div>)}
            </div>
        </>}
    </div>;
}
export function WidgetTemplatePicker({ config, onChange, layoutsOnly = false }: {
    config: WidgetConfig; onChange: (config: WidgetConfig) => void; layoutsOnly?: boolean;
}) {
    const items = layoutsOnly ? WIDGET_LAYOUTS.map(layout => ({ id: layout, name: LAYOUT_LABELS[layout], config: { ...config, layout } })) : WIDGET_TEMPLATES;
    return <div className="wb-template-grid">{items.map(item => {
        const next = parseWidgetConfig(item.config);
        const selected = layoutsOnly ? config.layout === next.layout : JSON.stringify(config) === JSON.stringify(next);
        return <button key={item.id} type="button" className={`wb-template ${selected ? "wb-selected" : ""}`} aria-pressed={selected} onClick={() => onChange(next)}>
            <Thumbnail config={next} /><span>{item.name}</span>
        </button>;
    })}</div>;
}
