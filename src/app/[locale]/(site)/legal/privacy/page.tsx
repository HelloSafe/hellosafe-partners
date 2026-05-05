import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LegalLayout } from "../_components/LegalLayout";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({ locale, path: "/legal/privacy", titleKey: "privacy" });
}

/**
 * Politique de confidentialité (RGPD). Liste les traitements, les sous-
 * traitants, les durées de conservation, les droits des personnes.
 * À auditer par un DPO avant la mise en prod publique.
 */
export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalLayout title="Politique de confidentialité" updated="5 mai 2026">
      <p>
        HelloSafe SAS (ci-après « HelloSafe », « nous ») accorde une
        importance particulière à la protection de vos données personnelles.
        Cette politique décrit les traitements que nous opérons sur vos
        données dans le cadre du programme partenaires HelloSafe.
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement est <strong>HelloSafe SAS</strong>, dont
        les coordonnées sont disponibles dans nos{" "}
        <Link href={"/legal/mentions" as never}>mentions légales</Link>.
      </p>

      <h2>2. Données collectées et finalités</h2>
      <p>Nous traitons les catégories de données suivantes :</p>
      <ul>
        <li>
          <strong>Données d&apos;inscription</strong> (email, nom, mot de
          passe haché, raison sociale, site web, audience, pays) : pour créer
          et gérer votre compte partenaire. Base légale : exécution du
          contrat.
        </li>
        <li>
          <strong>Données de profil</strong> (logo, baseline, persona) : pour
          la personnalisation de votre espace et du livrable Coach. Base
          légale : exécution du contrat.
        </li>
        <li>
          <strong>Données de tracking affilié</strong> (IP hashée, user-agent,
          referer, pays approximatif) : pour mesurer les clics sur vos liens
          traqués. Les IP ne sont jamais stockées en clair, uniquement leur
          hash SHA-256 salé. Base légale : intérêt légitime à mesurer
          l&apos;activité du programme.
        </li>
        <li>
          <strong>Données de conversion</strong> (montant, commission,
          identifiant de commande externe, statut) : pour calculer vos
          commissions. Base légale : exécution du contrat.
        </li>
        <li>
          <strong>Données d&apos;analyses Coach</strong> (référence client,
          tranche d&apos;âge, destination, etc.) : pour générer les analyses
          de couverture que vous remettez à vos clients. Base légale :
          exécution du contrat.
        </li>
      </ul>

      <h2>3. Sous-traitants</h2>
      <p>
        Nous utilisons les sous-traitants suivants, tous engagés
        contractuellement à respecter le RGPD :
      </p>
      <ul>
        <li>
          <strong>Vercel Inc.</strong> (États-Unis) — hébergement et CDN.
          Transfert hors UE encadré par les clauses contractuelles types.
        </li>
        <li>
          <strong>Neon Inc.</strong> (États-Unis, infrastructure hébergée en
          UE) — base de données Postgres.
        </li>
        <li>
          <strong>Resend Inc.</strong> (États-Unis) — emails transactionnels.
        </li>
        <li>
          <strong>Inngest Inc.</strong> (États-Unis) — file de tâches
          asynchrones (envoi d&apos;emails, journalisation des clics).
        </li>
        <li>
          <strong>Upstash Inc.</strong> (États-Unis, infrastructure UE) —
          rate-limiting Redis (stocke uniquement des compteurs anonymes par
          IP, pas de PII).
        </li>
        <li>
          <strong>Sentry / PostHog</strong> — observabilité (erreurs,
          analytics produit). PostHog est configuré en mode sans cookie
          tiers ; aucun enregistrement de session n&apos;est effectué.
        </li>
        <li>
          <strong>Google LLC</strong> — authentification optionnelle via
          OAuth 2.0 (uniquement si vous choisissez « Se connecter avec
          Google »).
        </li>
      </ul>

      <h2>4. Durées de conservation</h2>
      <ul>
        <li>Compte partenaire : pendant toute la durée de la relation, plus 3 ans après la dernière activité (prescription commerciale).</li>
        <li>Logs de connexion et tracking : 13 mois (recommandation CNIL).</li>
        <li>Données de facturation et commissions : 10 ans (obligation comptable).</li>
        <li>Données d&apos;analyses Coach : 3 ans après la création.</li>
      </ul>

      <h2>5. Vos droits</h2>
      <p>
        Conformément au RGPD vous disposez des droits suivants : accès,
        rectification, effacement, limitation, opposition, portabilité, et
        retrait du consentement (lorsqu&apos;applicable). Vous pouvez les
        exercer en écrivant à{" "}
        <a href="mailto:dpo@hellosafe.com">dpo@hellosafe.com</a>.
      </p>
      <p>
        Vous avez également le droit d&apos;introduire une réclamation auprès
        de la CNIL (
        <a href="https://www.cnil.fr" target="_blank" rel="noopener">
          cnil.fr
        </a>
        ).
      </p>

      <h2>6. Cookies</h2>
      <p>
        Nous utilisons uniquement des <strong>cookies essentiels</strong> au
        fonctionnement du Site (session d&apos;authentification, attribution
        d&apos;un clic affilié à un partenaire). Ces cookies ne nécessitent
        pas votre consentement préalable au sens de l&apos;article 82 de la
        loi Informatique et Libertés.
      </p>
      <p>
        Notre outil d&apos;analyse produit (PostHog) est configuré en mode{" "}
        <em>cookieless</em> : il ne dépose aucun cookie tiers et ne pratique
        ni session-replay ni autocapture des champs de formulaires.
      </p>

      <h2>7. Sécurité</h2>
      <p>
        Mots de passe hachés avec scrypt, transferts en HTTPS, IP
        anonymisées avant stockage, principe du moindre privilège sur les
        accès administrateurs. Les incidents de sécurité majeurs sont
        notifiés à la CNIL et aux personnes concernées dans les 72 heures.
      </p>
    </LegalLayout>
  );
}
