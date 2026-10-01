import { WIDGET_TEMPLATES, LAYOUT_LABELS } from "@/lib/widgets/templates";
import { parseWidgetConfig, WIDGET_LAYOUTS, type WidgetConfig } from "@/lib/widgets/config";
import { WidgetTemplateThumbnail } from "@/components/widgets/builder/widget-template-thumbnail";

export function WidgetTemplatePicker({ config, onChange, layoutsOnly = false }: {
    config: WidgetConfig; onChange: (config: WidgetConfig) => void; layoutsOnly?: boolean;
}) {
    const items = layoutsOnly ? WIDGET_LAYOUTS.map(layout => ({ id: layout, name: LAYOUT_LABELS[layout], config: { ...config, layout, preset: "custom" } })) : WIDGET_TEMPLATES;
    return <div className="wb-template-grid">{items.map(item => {
        const next = parseWidgetConfig(item.config);
        const selected = layoutsOnly ? config.layout === next.layout : config.preset === item.id;
        return <div key={item.id} className={`wb-template ${selected ? "wb-selected" : ""}`}>
            <WidgetTemplateThumbnail config={next} /><span>{item.name}</span>
            <button type="button" className="wb-template-select" aria-label={item.name} aria-pressed={selected} onClick={() => onChange(next)} />
        </div>;
    })}</div>;
}
