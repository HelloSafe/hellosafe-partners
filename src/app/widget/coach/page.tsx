import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { partners } from "@/db/schema";
import { CoachWidget } from "./_widget/CoachWidget";
import type { WidgetTheme } from "./_widget/types";

type SearchParams = {
  p?: string;
  lang?: string;
  color?: string;
  theme?: string;
  source?: string;
};

export const dynamic = "force-dynamic";

export default async function WidgetCoachPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;
  const partnerCode = sp.p ?? null;
  const lang: "fr" | "en" = sp.lang === "en" ? "en" : "fr";
  const theme: WidgetTheme = {
    color: normalizeColor(sp.color) ?? "#563bff",
    mode: ["light", "dark", "auto"].includes(sp.theme ?? "")
      ? (sp.theme as WidgetTheme["mode"])
      : "auto",
  };
  const source = sp.source ?? null;

  let partner: { code: string; companyName: string | null } = {
    code: "preview",
    companyName: null,
  };

  if (partnerCode) {
    const found = await db
      .select({
        partnerCode: partners.partnerCode,
        companyName: partners.companyName,
        status: partners.status,
      })
      .from(partners)
      .where(eq(partners.partnerCode, partnerCode))
      .limit(1);
    if (found[0] && found[0].status === "approved") {
      partner = {
        code: found[0].partnerCode,
        companyName: found[0].companyName,
      };
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "16px",
        background: "transparent",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <CoachWidget
        partner={partner}
        lang={lang}
        theme={theme}
        source={source}
      />
    </main>
  );
}

function normalizeColor(input: string | undefined): string | null {
  if (!input) return null;
  const v = input.startsWith("#") ? input : `#${input}`;
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) return v;
  return null;
}
