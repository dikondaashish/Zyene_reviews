export function findVisibleTourTarget(target: string): HTMLElement | null {
    const nodes = document.querySelectorAll<HTMLElement>(`[data-tour-target="${target}"]`);
    for (const el of nodes) {
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const rect = el.getBoundingClientRect();
        if (rect.width >= 8 && rect.height >= 8) return el;
    }
    return null;
}

export async function waitForVisibleTourTarget(
    target: string,
    attempts = 24,
    delayMs = 50,
): Promise<HTMLElement | null> {
    for (let i = 0; i < attempts; i++) {
        const el = findVisibleTourTarget(target);
        if (el) return el;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return findVisibleTourTarget(target);
}

export function readTourTargetRect(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
    };
}

export function scrollTourTargetIntoView(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const topGutter = 88;
    const bottomGutter = 24;
    const offScreen =
        rect.top < topGutter || rect.bottom > window.innerHeight - bottomGutter;
    el.scrollIntoView({
        behavior: "auto",
        block: offScreen ? "center" : "nearest",
        inline: "nearest",
    });
}
