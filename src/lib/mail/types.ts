/**
 * Types shared across the mail module. Each template exports a render
 * function that produces a RenderedEmail. The provider (Resend by
 * default) actually sends it.
 */

export type Locale = "fr" | "en";

export type RenderedEmail = {
  subject: string;
  html: string;
  /** Plaintext alternative — required for good deliverability. */
  text: string;
};

/**
 * A typed email template. The `id` is used for logging and analytics.
 * Each template owns its data shape via the generic.
 */
export type EmailTemplate<TData> = {
  id: string;
  render(data: TData, locale: Locale): RenderedEmail;
};
