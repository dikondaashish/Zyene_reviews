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
        wrapper.style.cssText = "position:fixed;bottom:16px;z-index:99999;width:360px;max-width:calc(100vw - 32px);border-radius:16px;overflow:hidden;box-shadow:0 4px 24px #0002;";
        wrapper.style[position] = "16px";
        frame.style.height = "220px";
        frame.loading = "eager";
    }
    wrapper.appendChild(frame);
    script.parentNode.insertBefore(wrapper, script);
    var desiredHeight = floating ? 220 : 650;
    function resize() {
        frame.style.height = Math.min(desiredHeight, floating ? Math.max(200, window.innerHeight - 32) : 20000) + "px";
    }
    function receive(event) {
        if (event.origin !== origin || event.source !== frame.contentWindow) return;
        var data = event.data;
        if (!data || data.type !== "zyene-widget-size" || typeof data.height !== "number" || !Number.isFinite(data.height)) return;
        desiredHeight = Math.max(80, Math.min(20000, Math.ceil(data.height)));
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
