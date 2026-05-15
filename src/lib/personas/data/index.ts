import type { Locale, PersonaContent, PersonaSlug } from "../types";
import { BLOG_FR, BLOG_EN } from "./blog";
import { VISA_FR, VISA_EN } from "./visa";
import { CREATOR_FR, CREATOR_EN } from "./creator";

export const PERSONAS: Record<Locale, Record<PersonaSlug, PersonaContent>> = {
  fr: {
    blog: BLOG_FR,
    visa: VISA_FR,
    creator: CREATOR_FR,
  },
  en: {
    blog: BLOG_EN,
    visa: VISA_EN,
    creator: CREATOR_EN,
  },
};
