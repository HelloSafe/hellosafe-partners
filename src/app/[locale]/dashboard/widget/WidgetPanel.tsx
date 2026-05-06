"use client";

import { useEffect, useMemo, useState } from "react";
import { useDashboardSession } from "../DashboardShell";
import { useLocale } from "next-intl";

const PRESET_COLORS = [
  { name: "Atlas", value: "#563bff" },
  { name: "Indigo", value: "#4338ca" },
  { name: "Ocean", value: "#0ea5e9" },
  { name: "Emerald", value: "#10b981" },
  { name: "Sunset", value: "#f97316" },
  { name: "Crimson", value: "#dc2626" },
  { name: "Slate", value: "#0f172a" },
];

export function WidgetPanel() {
  const session = useDashboardSession();
  const locale = useLocale();
  const isEn = locale === "en";

  const [color, setColor] = useState("#563bff");
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");
  const [lang, setLang] = useState<"fr" | "en">(isEn ? "en" : "fr");
  const [copied, setCopied] = useState<"snippet" | "iframe" | null>(null);
  const [origin, setOrigin] = useState("https://partners.hellosafe.com");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  const previewUrl = useMemo(() => {
    const qs = new URLSearchParams({
      p: session.partner.partnerCode,
      lang,
      theme,
      color: color.replace("#", ""),
      preview: "1",
    });
    return `${origin}/widget/coach?${qs.toString()}`;
  }, [origin, session.partner.partnerCode, lang, theme, color]);

  const snippet = useMemo(() => {
    const attrs = [
      `src="${origin}/embed.js"`,
      `data-partner="${session.partner.partnerCode}"`,
      `data-lang="${lang}"`,
      `data-theme="${theme}"`,
      color !== "#563bff" ? `data-color="${color}"` : null,
    ]
      .filter(Boolean)
      .join("\n        ");
    return `<script ${attrs}></script>`;
  }, [origin, session.partner.partnerCode, lang, theme, color]);

  const iframeSnippet = useMemo(() => {
    return `<iframe
  src="${previewUrl}"
  width="100%" height="640"
  frameborder="0"
  scrolling="no"
  title="HelloSafe Coach"
  style="max-width:760px;display:block;margin:0 auto"></iframe>`;
  }, [previewUrl]);

  const copy = (kind: "snippet" | "iframe") => {
    navigator.clipboard.writeText(kind === "snippet" ? snippet : iframeSnippet);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="space-y-10 max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            {isEn ? "Embed widget · NEW" : "Widget à intégrer · NOUVEAU"}
          </p>
          <h1 className="mt-2 text-3xl lg:text-4xl font-bold tracking-tight">
            {isEn
              ? "Drop the Coach on your site in one line."
              : "Mets le Coach sur ton site en une ligne."}
          </h1>
          <p className="mt-3 text-ink-700 max-w-2xl">
            {isEn
              ? "A free coverage check your readers can take in 30 seconds. Every CTA click is tracked back to you and earns commission like any other link."
              : "Un diagnostic gratuit de couverture pour tes lecteurs, en 30 secondes. Chaque clic CTA est tracké et te rapporte une commission comme tes autres liens."}
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Live preview */}
        <section className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-surface-200 bg-surface-50 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-danger-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-warning-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-success-500/60" />
              <span className="ml-3 text-ink-500 font-mono">{origin.replace(/^https?:\/\//, "")}/widget/coach</span>
            </div>
            <span className="text-ink-500">
              {isEn ? "Live preview" : "Aperçu en direct"}
            </span>
          </div>
          <div className="p-6 bg-surface-50 min-h-[640px]">
            <iframe
              key={previewUrl}
              src={previewUrl}
              className="w-full min-h-[600px] rounded-xl border-0 bg-transparent block"
              scrolling="no"
              title="HelloSafe Coach preview"
            />
          </div>
        </section>

        {/* Customizer + embed code */}
        <section className="space-y-6">
          {/* Customize */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6">
            <h2 className="text-lg font-bold tracking-tight">
              {isEn ? "Customize" : "Personnaliser"}
            </h2>
            <p className="text-sm text-ink-500 mt-1">
              {isEn
                ? "These settings update the embed code below."
                : "Ces réglages mettent à jour le code d'intégration."}
            </p>

            <div className="mt-5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                {isEn ? "Accent color" : "Couleur d'accent"}
              </label>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      color === c.value
                        ? "border-ink-900 scale-110"
                        : "border-white shadow"
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                    aria-label={c.name}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-12 rounded cursor-pointer border border-surface-300"
                  title="Custom"
                />
                <span className="font-mono text-xs text-ink-500">{color}</span>
              </div>
            </div>

            <div className="mt-5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                {isEn ? "Theme" : "Thème"}
              </label>
              <div className="mt-2 flex gap-2">
                {(["light", "dark", "auto"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTheme(m)}
                    className={`flex-1 h-10 rounded-lg border text-sm font-semibold capitalize ${
                      theme === m
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-surface-300 text-ink-700 hover:border-brand-300"
                    }`}
                  >
                    {m === "light"
                      ? isEn
                        ? "Light"
                        : "Clair"
                      : m === "dark"
                      ? isEn
                        ? "Dark"
                        : "Sombre"
                      : "Auto"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                {isEn ? "Language shown to visitors" : "Langue affichée aux visiteurs"}
              </label>
              <div className="mt-2 flex gap-2">
                {(["fr", "en"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`flex-1 h-10 rounded-lg border text-sm font-semibold uppercase ${
                      lang === l
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-surface-300 text-ink-700 hover:border-brand-300"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Embed code (script) */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  {isEn ? "Recommended embed" : "Intégration recommandée"}
                </h2>
                <p className="text-sm text-ink-500 mt-1">
                  {isEn
                    ? "Drop one line where you want the widget to appear. The iframe auto-resizes to its content."
                    : "Colle cette ligne où tu veux voir le widget. L'iframe s'adapte automatiquement à son contenu."}
                </p>
              </div>
              <button
                onClick={() => copy("snippet")}
                className="shrink-0 h-9 px-4 rounded-lg bg-ink-900 text-white text-sm font-semibold hover:bg-ink-700"
              >
                {copied === "snippet" ? "✓ " + (isEn ? "Copied" : "Copié") : isEn ? "Copy" : "Copier"}
              </button>
            </div>
            <pre className="mt-4 rounded-xl bg-ink-900 text-white text-[0.78rem] leading-relaxed font-mono p-4 overflow-x-auto whitespace-pre-wrap break-all">
              {snippet}
            </pre>
          </div>

          {/* Iframe fallback */}
          <details className="rounded-2xl border border-surface-200 bg-white">
            <summary className="cursor-pointer list-none px-6 py-4 flex items-center justify-between text-sm font-semibold">
              <span>
                {isEn
                  ? "Static iframe (for sites that block external scripts)"
                  : "iframe statique (pour les sites qui bloquent les scripts externes)"}
              </span>
              <span className="text-ink-500">↓</span>
            </summary>
            <div className="px-6 pb-6">
              <p className="text-sm text-ink-500 mb-3">
                {isEn
                  ? "No auto-resize, but works on WordPress.com, Webflow CMS embed, Notion, etc."
                  : "Pas d'auto-resize, mais fonctionne sur WordPress.com, Webflow CMS embed, Notion, etc."}
              </p>
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-xs uppercase tracking-wider font-semibold text-ink-500">HTML</span>
                <button
                  onClick={() => copy("iframe")}
                  className="h-8 px-3 rounded-md bg-ink-900 text-white text-xs font-semibold hover:bg-ink-700"
                >
                  {copied === "iframe" ? "✓ " + (isEn ? "Copied" : "Copié") : isEn ? "Copy" : "Copier"}
                </button>
              </div>
              <pre className="rounded-xl bg-ink-900 text-white text-[0.72rem] leading-relaxed font-mono p-4 overflow-x-auto whitespace-pre-wrap break-all">
                {iframeSnippet}
              </pre>
            </div>
          </details>

          {/* Tips */}
          <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-5 text-sm text-ink-700 space-y-2">
            <p className="font-semibold text-brand-900">
              💡 {isEn ? "Best placements" : "Meilleurs emplacements"}
            </p>
            <ul className="space-y-1 list-disc pl-5">
              <li>
                {isEn
                  ? "End of a destination guide article (\"Now check your cover\")"
                  : "À la fin d'un article guide-destination (\"Maintenant, vérifie ta couverture\")"}
              </li>
              <li>
                {isEn
                  ? "Newsletter teaser linked to a blog post that hosts the widget"
                  : "Teaser newsletter renvoyant vers un article qui héberge le widget"}
              </li>
              <li>
                {isEn
                  ? "Sidebar of your insurance category page"
                  : "Sidebar d'une page catégorie « assurance voyage »"}
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
