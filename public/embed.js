/*!
 * HelloSafe Atlas — Coach widget embed
 * https://partners.hellosafe.com
 *
 * Usage:
 *   <script src="https://partners.hellosafe.com/embed.js"
 *           data-partner="hs-XXXXXX"
 *           data-color="#563bff"
 *           data-theme="auto"
 *           data-lang="fr"></script>
 *
 * The script renders an iframe in place where it appears in the DOM and
 * auto-resizes it to fit the widget's content height. CSS-isolated.
 */
(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) {
    // Fallback for some loaders.
    var all = document.getElementsByTagName("script");
    for (var i = all.length - 1; i >= 0; i--) {
      if (all[i].src && all[i].src.indexOf("/embed.js") !== -1) {
        script = all[i];
        break;
      }
    }
  }
  if (!script) return;

  function attr(name, fallback) {
    var v = script.getAttribute("data-" + name);
    return v == null || v === "" ? fallback : v;
  }

  // Resolve the host origin from the script src so the widget always
  // talks to the same backend that served the script.
  var origin;
  try {
    origin = new URL(script.src, window.location.href).origin;
  } catch {
    origin = "";
  }

  var partner = attr("partner", "");
  var color = attr("color", "");
  var theme = attr("theme", "auto"); // light | dark | auto
  var lang = attr("lang", document.documentElement.lang === "en" ? "en" : "fr");
  var source = window.location.hostname;

  if (!partner) {
    console.warn("[HelloSafe] embed.js: missing data-partner attribute");
    return;
  }

  var qs = new URLSearchParams();
  qs.set("p", partner);
  qs.set("lang", lang);
  qs.set("theme", theme);
  if (color) qs.set("color", color);
  qs.set("source", source);
  var src = origin + "/widget/coach?" + qs.toString();

  // Build container + iframe.
  var container = document.createElement("div");
  container.className = "hs-coach-embed";
  container.style.cssText = [
    "all: initial",
    "display: block",
    "width: 100%",
    "max-width: 760px",
    "margin: 16px auto",
    "font-family: inherit",
  ].join(";");

  var iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.title = "HelloSafe Coach";
  iframe.loading = "lazy";
  iframe.allow = "clipboard-write";
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute(
    "sandbox",
    "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation",
  );
  iframe.style.cssText = [
    "display: block",
    "border: 0",
    "width: 100%",
    "min-height: 540px",
    "background: transparent",
    "transition: height 220ms ease",
  ].join(";");

  container.appendChild(iframe);

  // Insert just before the script tag so it lands at the correct position.
  if (script.parentNode) {
    script.parentNode.insertBefore(container, script);
  }

  // Auto-resize on postMessage from the widget.
  window.addEventListener("message", function (ev) {
    if (!ev.data || ev.data.type !== "hellosafe:widget:resize") return;
    if (ev.source !== iframe.contentWindow) return;
    var h = parseInt(ev.data.height, 10);
    if (!isFinite(h)) return;
    var capped = Math.max(420, Math.min(2400, h + 8));
    iframe.style.height = capped + "px";
  });
})();
