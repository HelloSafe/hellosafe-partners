import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";

export default async function SignupPendingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === "en";
  return (
    <section className="py-20 lg:py-28 bg-surface-50">
      <Container size="narrow" className="text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-success-50 text-success-600 text-3xl">
          ✓
        </span>
        <h1 className="mt-6 text-3xl lg:text-4xl font-bold tracking-tight">
          {isEn
            ? "Your account is under review"
            : "Votre compte est en cours de validation"}
        </h1>
        <p className="mt-4 text-ink-700 leading-relaxed max-w-xl mx-auto">
          {isEn
            ? "Thanks for signing up. Our team reviews every new partner within 24 business hours to keep the network clean. You'll receive an email as soon as your account is approved and you can access your dashboard."
            : "Merci pour votre inscription. Notre équipe valide chaque nouveau partenaire sous 24 heures ouvrées pour garder le réseau propre. Vous recevrez un e-mail dès que votre compte sera approuvé et que votre dashboard sera accessible."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/login">
            {isEn ? "Go to login" : "Aller à la connexion"}
          </LinkButton>
          <LinkButton href="/" variant="outline">
            {isEn ? "Back to site" : "Retour au site"}
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
