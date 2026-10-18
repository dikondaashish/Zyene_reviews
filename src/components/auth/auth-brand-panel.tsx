import { AuthFlowShowcase } from "@/components/auth/auth-flow-showcase";
import "@/components/auth/auth-scene.css";

export function AuthBrandPanel() {
    return (
        <aside className="auth-brand" aria-label="How Zyene Reviews works">
            <div className="auth-brand-panel">
                <h2 className="auth-brand-title">Every review heard.<br /><span>Every reply on brand.</span></h2>
                <AuthFlowShowcase />
            </div>
        </aside>
    );
}
