"use client";

import { useState } from "react";
import { LayoutTemplate, LayoutGrid, MessageSquare, PanelTop, Star, Palette, Settings2, Sparkles, Code2, Save } from "lucide-react";
import { toast } from "sonner";
import { parseWidgetConfig, type WidgetConfig } from "@/lib/widgets/config";
import { WidgetTemplatePicker } from "@/components/widgets/builder/widget-template-picker";
import { WidgetContentControls } from "@/components/widgets/builder/widget-content-controls";
import { WidgetDesignControls } from "@/components/widgets/builder/widget-design-controls";
import { WidgetBuilderPreview } from "@/components/widgets/builder/widget-builder-preview";
import { WidgetInstall } from "@/components/widgets/builder/widget-install";
import "@/components/widgets/builder/widget-builder.css";

const sections = [
    { name: "Templates", icon: LayoutTemplate }, { name: "Content", icon: MessageSquare },
    { name: "AI Features", icon: Sparkles }, { name: "Layout", icon: LayoutGrid },
    { name: "Header", icon: PanelTop }, { name: "Review", icon: Star },
    { name: "Theme", icon: Palette }, { name: "Settings", icon: Settings2 },
];
export function WidgetBuilder({ businessSlug, initialConfig }: { businessSlug: string; initialConfig?: WidgetConfig }) {
    const [config, setConfig] = useState(() => initialConfig || parseWidgetConfig(null));
    const [section, setSection] = useState("Templates");
    const update = <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) => setConfig(previous => ({ ...previous, [key]: value }));
    const save = () => {
        try { localStorage.setItem(`zyene-widget:${businessSlug}`, JSON.stringify(config)); toast.success("Draft saved in this browser"); }
        catch { toast.error("Unable to save this draft. You can still copy the installation code."); }
    };
    return <div className="wb-builder">
        <nav className="wb-rail" aria-label="Widget settings">{sections.map(({ name, icon: Icon }) =>
            <button key={name} aria-current={section === name ? "page" : undefined} onClick={() => setSection(name)}><Icon size={21} /><span>{name}</span></button>
        )}</nav>
        <aside className="wb-controls">
            <div className="wb-controls-title"><h3>{section === "Templates" ? "Select a template to start with" : section}</h3><button onClick={save} aria-label="Save widget draft" title="Save draft in this browser"><Save size={17} /></button></div>
            <div className="wb-controls-scroll">
                {section === "Templates" ? <WidgetTemplatePicker config={config} onChange={setConfig} /> :
                    section === "Install" ? <WidgetInstall slug={businessSlug} config={config} /> :
                        ["Layout", "Theme", "Settings"].includes(section) ? <WidgetDesignControls config={config} update={update} section={section} onChange={setConfig} /> :
                            <WidgetContentControls config={config} update={update} section={section} />}
            </div>
            <div className="wb-controls-footer"><button className="wb-primary" onClick={() => setSection("Install")}><Code2 size={18} /> Add to website</button></div>
        </aside>
        <WidgetBuilderPreview slug={businessSlug} config={config} />
    </div>;
}
