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
 * À adapter par Antoine avec les vraies infos juridiques (RCS, SIREN,
 * directeur de publication, hébergeur).
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
        Le site <strong>partners.hellosafe.com</strong> (ci-après « le Site ») est édité par :
      </p>
      <ul>
        <li>Raison sociale : HelloSafe SAS</li>
        <li>Forme juridique : Société par actions simplifiée</li>
        <li>Capital social : [À compléter]</li>
        <li>Siège social : [À compléter]</li>
        <li>RCS : [À compléter]</li>
        <li>SIREN : [À compléter]</li>
        <li>TVA intracommunautaire : [À compléter]</li>
        <li>Email de contact : contact@hellosafe.com</li>
        <li>Directeur de la publication : [À compléter]</li>
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
        HelloSafe agit en qualité d&apos;intermédiaire en assurance, immatriculé
        à l&apos;ORIAS sous le numéro [À compléter] (vérifiable sur{" "}
        <a href="https://www.orias.fr" target="_blank" rel="noopener">
          orias.fr
        </a>
        ). HelloSafe est soumis au contrôle de l&apos;Autorité de contrôle
        prudentiel et de résolution (ACPR), 4 place de Budapest, 75436 Paris.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus présents sur le Site (textes, images,
        logos, code) est la propriété exclusive de HelloSafe SAS ou de ses
        partenaires. Toute reproduction, représentation, modification ou
        adaptation, totale ou partielle, sans autorisation écrite préalable
        est interdite.
      </p>

      <h2>Crédits</h2>
      <p>Conception et développement : équipe HelloSafe.</p>
    </LegalLayout>
  );
}
