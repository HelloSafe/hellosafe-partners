import type { Locale, PersonaContent, PersonaSlug } from "../types";
import { BLOG_FR, BLOG_EN } from "./blog";
import { AGENCY_FR, AGENCY_EN } from "./agency";
import { VISA_FR, VISA_EN } from "./visa";
import { CREATOR_FR, CREATOR_EN } from "./creator";
import { STUDENT_FR, STUDENT_EN } from "./student";

export const PERSONAS: Record<Locale, Record<PersonaSlug, PersonaContent>> = {
  fr: {
    blog: BLOG_FR,
    agency: AGENCY_FR,
    visa: VISA_FR,
    creator: CREATOR_FR,
    student: STUDENT_FR,
  },
  en: {
    blog: BLOG_EN,
    agency: AGENCY_EN,
    visa: VISA_EN,
    creator: CREATOR_EN,
    student: STUDENT_EN,
  },
};
