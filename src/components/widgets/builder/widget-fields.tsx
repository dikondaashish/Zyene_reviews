import type { WidgetConfig } from "@/lib/widgets/config";

export type WidgetFieldsProps = { config: WidgetConfig; update: <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) => void };
export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
    return <label className="wb-toggle"><span>{label}</span><input type="checkbox" checked={value} onChange={event => onChange(event.target.checked)} /></label>;
}
export function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
    return <label className="wb-field"><span>{label}</span><input type="number" value={value} min={min} max={max}
        onChange={event => onChange(Math.max(min, Math.min(max, Number(event.target.value))))} /></label>;
}
export function Choice({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
    return <label className="wb-field"><span>{label}</span><select value={value} onChange={event => onChange(event.target.value)}>
        {options.map(option => <option value={option} key={option}>{option.replaceAll("-", " ")}</option>)}
    </select></label>;
}
export function TextField({ label, value, maxLength, onChange }: { label: string; value: string; maxLength: number; onChange: (value: string) => void }) {
    return <label className="wb-field"><span>{label}</span><input value={value} maxLength={maxLength} onChange={event => onChange(event.target.value)} /></label>;
}
