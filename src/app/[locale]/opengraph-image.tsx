import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const runtime = "edge";
export const alt = "HelloSafe Atlas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const title = t("pages.home.title");
  const description = t("pages.home.description");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #1E1863 0%, #140B7A 60%, #563BFF 100%)",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top: brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "white",
              color: "#563BFF",
              fontWeight: 800,
              fontSize: 36,
              letterSpacing: -1,
            }}
          >
            h
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span
              style={{
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: -1.5,
              }}
            >
              hellosafe
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 4,
                textTransform: "uppercase",
                background: "rgba(255,255,255,0.15)",
                padding: "6px 14px",
                borderRadius: 999,
              }}
            >
              ATLAS
            </span>
          </div>
        </div>

        {/* Middle: orange "eyebrow" + title + description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 980,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#FFB991",
            }}
          >
            {locale === "fr"
              ? "Programme d'affiliation"
              : "Affiliate program"}
          </span>
          <h1
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              margin: 0,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.85)",
              margin: 0,
            }}
          >
            {description}
          </p>
        </div>

        {/* Bottom: stat row */}
        <div style={{ display: "flex", gap: 48, alignItems: "flex-end" }}>
          <Stat
            value={locale === "fr" ? "jusqu'à 20 %" : "up to 20%"}
            label={locale === "fr" ? "de commission" : "commission"}
          />
          <Stat
            value={locale === "fr" ? "90 jours" : "90 days"}
            label={locale === "fr" ? "cookie d'attribution" : "attribution cookie"}
          />
          <Stat
            value="10,8 %"
            label={locale === "fr" ? "taux de conversion" : "conversion rate"}
          />
          <div style={{ display: "flex", flex: 1 }} />
          <span
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.6)",
              alignSelf: "center",
            }}
          >
            hellosafe-partners.vercel.app
          </span>
        </div>
      </div>
    ),
    size,
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: "#FFB991",
          letterSpacing: -0.5,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: 16,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        {label}
      </span>
    </div>
  );
}
