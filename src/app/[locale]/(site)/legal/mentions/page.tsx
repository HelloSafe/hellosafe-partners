import { setRequestLocale } from "next-intl/server";
import { LegalLayout } from "../_components/LegalLayout";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({ locale, path: "/legal/mentions", titleKey: "mentions" });
}

/**
 * Mentions légales — obligatoire en France (LCEN art. 6 III).
 * Données société récupérées depuis Pappers (SIREN 883 069 593) le
 * 5 mai 2026.
 */
export default async function MentionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalLayout title="Mentions légales" updated="5 mai 2026">
      <h2>Éditeur du site</h2>
      <p>
        Le site <strong>partners.hellosafe.com</strong> (ci-après « le Site »)
        est édité par :
      </p>
      <ul>
        <li>Raison sociale : HELLO SAFE</li>
        <li>Forme juridique : Société par actions simplifiée (SAS)</li>
        <li>Capital social : 1 588,36 €</li>
        <li>
          Siège social : 5 allée de la Grande Treille, 35200 Rennes, France
        </li>
        <li>RCS : 883 069 593 R.C.S. Rennes</li>
        <li>SIREN : 883 069 593</li>
        <li>TVA intracommunautaire : FR81883069593</li>
        <li>Code NAF : 62.01Z (Programmation informatique)</li>
        <li>Email de contact : contact@hellosafe.com</li>
        <li>
          Président : société BLUE, SAS (SIREN 880 981 808), représentée par
          son représentant légal
        </li>
        <li>
          Directeur de la publication : le représentant légal de la société
          BLUE, en sa qualité de président de HELLO SAFE
        </li>
      </ul>

      <h2>Hébergement</h2>
      <p>Le Site est hébergé par :</p>
      <ul>
        <li>Vercel Inc.</li>
        <li>440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis</li>
        <li>
          <a href="https://vercel.com" target="_blank" rel="noopener">
            vercel.com
          </a>
        </li>
      </ul>

      <h2>Statut d&apos;intermédiaire en assurance</h2>
      <p>
        HELLO SAFE est immatriculée à l&apos;ORIAS sous le numéro{" "}
        <strong>21 008 038</strong> en qualité de courtier en assurance
        (catégorie COA), inscription en date du 1<sup>er</sup> septembre
        2023, autorisée à encaisser des fonds. Le statut est vérifiable sur{" "}
        <a href="https://www.orias.fr" target="_blank" rel="noopener">
          orias.fr
        </a>
        . HELLO SAFE est soumise au contrôle de l&apos;Autorité de contrôle
        prudentiel et de résolution (ACPR), 4 place de Budapest, CS 92459,
        75436 Paris Cedex 09.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus présents sur le Site (textes, images,
        logos, code) est la propriété exclusive de HELLO SAFE ou de ses
        partenaires. Toute reproduction, représentation, modification ou
        adaptation, totale ou partielle, sans autorisation écrite préalable
        est interdite.
      </p>

      <h2>Crédits</h2>
      <p>Conception et développement : équipe HelloSafe.</p>
    </LegalLayout>
  );
}
