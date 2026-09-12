import type { ReactNode } from "react";

/** Spanish marketing routes - Phase 8.3 */
export default function EsMarketingLayout({ children }: { children: ReactNode }) {
    return <div lang="es">
        <p className="marketing-container py-3 text-sm text-muted-foreground">Esta sección está en español. El registro, la facturación y algunas herramientas del panel están disponibles en inglés.</p>
        {children}
    </div>;
}
