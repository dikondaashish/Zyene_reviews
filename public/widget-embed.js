/* Zyene Reviews: responsive, isolated review widgets. */
(function () {
    "use strict";
    var script = document.currentScript;
    if (!script) return;
    var url;
    var origin = new URL(script.src).origin;
    try { url = new URL(script.getAttribute("data-widget-url")); } catch { return; }
    if (url.origin !== origin || !url.pathname.startsWith("/w/")) return;
    var frame = document.createElement("iframe");
    frame.src = url.href;
    frame.title = "Customer reviews";
    frame.loading = "lazy";
    frame.style.cssText = "display:block;width:100%;height:650px;border:0;color-scheme:normal;";
    var position = script.getAttribute("data-position");
    var floating = position === "left" || position === "right";
    var wrapper = document.createElement("div");
    wrapper.className = "zyene-reviews-widget";
    if (floating) {
        wrapper.style.cssText = "position:fixed;bottom:0;z-index:99999;width:240px;max-width:100vw;";
        wrapper.style[position] = "16px";
        frame.style.height = "220px";
        frame.loading = "eager";
    }
    wrapper.appendChild(frame);
    script.parentNode.insertBefore(wrapper, script);
    var desiredHeight = floating ? 220 : 650;
    var expanded = false;
    var normalFrameStyle = frame.style.cssText;
    function resize() {
        frame.style.height = (expanded ? window.innerHeight : Math.min(desiredHeight, floating ? Math.max(200, window.innerHeight - 32) : 20000)) + "px";
    }
    function receive(event) {
        if (event.origin !== origin || event.source !== frame.contentWindow) return;
        var data = event.data;
        if (!data || data.type !== "zyene-widget-size" || typeof data.height !== "number" || !Number.isFinite(data.height)) return;
        desiredHeight = Math.max(80, Math.min(20000, Math.ceil(data.height)));
        if (typeof data.expanded === "boolean" && data.expanded !== expanded) {
            expanded = data.expanded;
            frame.style.cssText = expanded ? "position:fixed;inset:0;z-index:2147483647;display:block;width:100vw;height:100vh;border:0;color-scheme:normal;" : normalFrameStyle;
            if (!floating) wrapper.style.minHeight = expanded ? desiredHeight + "px" : "";
        }
        if (floating && typeof data.width === "number" && Number.isFinite(data.width)) wrapper.style.width = Math.max(100, Math.min(480, Math.ceil(data.width))) + "px";
        resize();
    }
    window.addEventListener("message", receive);
    window.addEventListener("resize", resize);
    var observer = new MutationObserver(function () {
        if (!wrapper.isConnected) {
            window.removeEventListener("message", receive);
            window.removeEventListener("resize", resize);
            observer.disconnect();
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
}());
