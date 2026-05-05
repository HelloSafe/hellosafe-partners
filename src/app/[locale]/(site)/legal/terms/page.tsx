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
  return pageMetadata({ locale, path: "/legal/terms", titleKey: "terms" });
}

/**
 * CGU du programme partenaires. À faire valider par un avocat avant
 * lancement public — c'est un brouillon de travail, pas un texte
 * juridiquement opposable en l'état.
 */
export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalLayout
      title="Conditions générales d'utilisation"
      updated="5 mai 2026"
    >
      <p>
        Les présentes conditions générales d&apos;utilisation (« CGU »)
        régissent l&apos;accès et l&apos;utilisation du programme
        partenaires HelloSafe accessible à l&apos;adresse{" "}
        <strong>partners.hellosafe.com</strong> (le « Site »).
      </p>
      <p>
        En créant un compte ou en utilisant le Site, vous acceptez sans
        réserve les présentes CGU.
      </p>

      <h2>1. Définitions</h2>
      <ul>
        <li>
          <strong>Partenaire</strong> : personne morale ou physique inscrite
          au programme.
        </li>
        <li>
          <strong>Lien traqué</strong> : URL générée depuis le Site
          permettant d&apos;attribuer une vente à un Partenaire.
        </li>
        <li>
          <strong>Conversion</strong> : souscription validée d&apos;un produit
          d&apos;assurance HelloSafe attribuée à un Partenaire via un Lien
          traqué.
        </li>
        <li>
          <strong>Commission</strong> : rémunération versée au Partenaire
          pour chaque Conversion validée.
        </li>
      </ul>

      <h2>2. Inscription et validation du compte</h2>
      <p>
        L&apos;inscription est gratuite. Toute candidature est soumise à
        validation par notre équipe sous 24 heures ouvrées. HelloSafe se
        réserve le droit de refuser une candidature sans motivation.
      </p>

      <h2>3. Engagements du Partenaire</h2>
      <p>Le Partenaire s&apos;engage à :</p>
      <ul>
        <li>fournir des informations exactes lors de son inscription ;</li>
        <li>
          ne pas utiliser de méthodes promotionnelles trompeuses, agressives
          ou contraires aux bonnes pratiques (spam, brand bidding sur les
          marques HelloSafe et partenaires, faux contenus) ;
        </li>
        <li>
          respecter la réglementation applicable, notamment en matière de
          publicité et de protection des consommateurs ;
        </li>
        <li>
          ne pas générer de trafic artificiel, frauduleux ou non sollicité.
          Toute violation entraîne la suspension immédiate du compte et
          l&apos;annulation des Commissions correspondantes.
        </li>
      </ul>

      <h2>4. Commissions et paiements</h2>
      <p>
        Les Commissions sont calculées sur la base des Conversions validées
        et reportées dans le tableau de bord du Partenaire. Une Conversion
        n&apos;est validée qu&apos;à l&apos;issue de la période de rétractation
        légale et après vérification de l&apos;absence de fraude.
      </p>
      <p>
        Le paiement des Commissions intervient mensuellement, à compter
        d&apos;un seuil minimum de 50 € accumulés. Les modalités précises
        (Stripe Connect, RIB, justificatifs) sont communiquées au moment de
        l&apos;activation du module de paiement.
      </p>

      <h2>5. Suspension et résiliation</h2>
      <p>
        HelloSafe peut suspendre ou clôturer un compte Partenaire en cas de
        manquement aux présentes CGU, de fraude avérée ou présumée, ou
        d&apos;arrêt du programme.
      </p>
      <p>
        Le Partenaire peut clôturer son compte à tout moment depuis ses
        paramètres ou en écrivant à{" "}
        <a href="mailto:partners@hellosafe.com">partners@hellosafe.com</a>.
      </p>

      <h2>6. Propriété intellectuelle</h2>
      <p>
        HelloSafe concède au Partenaire un droit non exclusif, non cessible
        et révocable d&apos;utiliser ses marques, logos et contenus
        marketing dans le seul cadre de la promotion du programme. Toute
        autre utilisation est interdite.
      </p>

      <h2>7. Responsabilité</h2>
      <p>
        Le Site est fourni « en l&apos;état ». HelloSafe met en œuvre les
        moyens raisonnables pour assurer sa disponibilité mais ne peut
        garantir une absence totale d&apos;interruption ou d&apos;erreur.
        La responsabilité de HelloSafe est, en tout état de cause, limitée
        au montant des Commissions versées au Partenaire au cours des 12
        derniers mois.
      </p>

      <h2>8. Modification des CGU</h2>
      <p>
        Les présentes CGU peuvent être modifiées à tout moment. Les
        Partenaires sont informés des modifications substantielles par
        email avec un préavis de 15 jours.
      </p>

      <h2>9. Loi applicable et juridiction</h2>
      <p>
        Les présentes CGU sont régies par le droit français. Tout litige
        relève de la compétence exclusive des tribunaux du ressort du
        Tribunal de commerce de Rennes, sauf disposition légale contraire.
      </p>
    </LegalLayout>
  );
}
