import { Container } from "@/components/ui/Container";

/**
 * Shared layout for legal pages. Long-form text, narrow column,
 * consistent typography. Updated date is shown at the top so visitors
 * (and CNIL on audit) can see when the doc was last revised.
 */
export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ds-section">
      <Container className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
          {title}
        </p>
        <p className="mt-2 text-sm text-ink-500">Mise à jour : {updated}</p>
        <article className="prose prose-ink mt-8 max-w-none [&_h2]:mt-12 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-8 [&_h3]:font-semibold [&_p]:mt-3 [&_p]:text-ink-700 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-ink-700 [&_li]:mt-1 [&_a]:text-brand-700 [&_a]:underline">
          {children}
        </article>
      </Container>
    </section>
  );
}
