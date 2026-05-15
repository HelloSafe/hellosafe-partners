import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Hero } from "./_home/Hero";
import { Gains } from "./_home/Gains";
import { ProfileSelector } from "./_home/ProfileSelector";
import { Testimonials } from "./_home/Testimonials";
import {
  FinalCta,
  LogosMarquee,
  Personas,
  Stats,
  Steps,
} from "./_home/sections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({ locale, path: "/", titleKey: "home" });
}

/**
 * Top-level landing page. Composes the sections in order — each section
 * lives under _home/ and pulls its copy from next-intl. Icons + Avatar +
 * PersonaGlyph are shared in _home/icons.tsx.
 */
export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <LogosMarquee />
      <Gains />
      <Stats />
      <ProfileSelector />
      <Testimonials />
      <Personas />
      <Steps />
      <FinalCta />
    </>
  );
}
