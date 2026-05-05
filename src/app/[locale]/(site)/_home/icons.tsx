/**
 * Inline SVG icons + the Avatar + PersonaGlyph helpers used by the
 * landing-page sections. Centralized here so a section can import only
 * the icons it actually needs.
 */

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={className}
      aria-hidden
    >
      <path
        d="M3 8.5l3 3 7-7"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      className={className}
      aria-hidden
    >
      <path
        d="M3 7h8m-3-3l3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <path
        d="M6 10V2m0 0L2 6m4-4l4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      className={className}
      aria-hidden
    >
      <rect
        x="2.5"
        y="5.5"
        width="7"
        height="5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M4 5.5V4a2 2 0 014 0v1.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
}

export function CoinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path
        d="M10 5.5v9M7.5 8c.4-.6 1.2-1 2.5-1 1.5 0 2.5.7 2.5 1.7s-1 1.5-2.5 1.6c-1.5.1-2.5.6-2.5 1.7s1 1.7 2.5 1.7c1.3 0 2.1-.4 2.5-1"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path
        d="M10 5.5V10l3 2"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <path
        d="M10 2.5l6 2v5c0 4-3 6.5-6 7.5-3-1-6-3.5-6-7.5v-5l6-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 10.2l1.8 1.8L13 8.2"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <path
        d="M10 3l1.7 4.3L16 9l-4.3 1.7L10 15l-1.7-4.3L4 9l4.3-1.7L10 3z"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      className={className}
      aria-hidden
    >
      <path
        d="M9 22c-3 0-5-2-5-5s2-5 5-5l1-5h3l-2 6c2 .5 3 2 3 4s-2 5-5 5zm14 0c-3 0-5-2-5-5s2-5 5-5l1-5h3l-2 6c2 .5 3 2 3 4s-2 5-5 5z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Initials avatar with a deterministic palette per name. */
export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const palette = [
    "bg-brand-100 text-brand-700",
    "bg-accent-100 text-accent-900",
    "bg-success-100 text-success-900",
  ];
  const idx =
    [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;
  return (
    <span
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full font-display font-bold text-sm ${palette[idx]}`}
    >
      {initials}
    </span>
  );
}

/**
 * Persona glyphs — abstract icons per persona slug. Replace with real
 * illustrations once Gemini-generated assets land in /public/personas/.
 */
export function PersonaGlyph({ slug }: { slug: string }) {
  const common = "h-16 w-16";
  switch (slug) {
    case "blog":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <rect x="10" y="10" width="44" height="44" rx="10" fill="#DFD7FF" />
          <path d="M20 22h24M20 30h24M20 38h16" stroke="#563BFF" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="46" cy="46" r="7" fill="#FF7049" />
        </svg>
      );
    case "agency":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <path d="M14 46V22l18-8 18 8v24" fill="#DFD7FF" />
          <path d="M14 46h36" stroke="#563BFF" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="26" y="32" width="12" height="14" fill="#FF7049" />
          <path d="M32 14v8" stroke="#140B7A" strokeWidth="2.5" />
        </svg>
      );
    case "visa":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <rect x="14" y="10" width="36" height="44" rx="4" fill="#FFEDDA" />
          <rect x="20" y="18" width="24" height="6" rx="1.5" fill="#FF7049" />
          <path d="M20 30h24M20 36h24M20 42h16" stroke="#B72E24" strokeWidth="2" strokeLinecap="round" />
          <circle cx="46" cy="46" r="6" fill="#20C997" />
        </svg>
      );
    case "creator":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <rect x="12" y="14" width="32" height="36" rx="6" fill="#DFD7FF" />
          <circle cx="28" cy="32" r="8" fill="#563BFF" />
          <path d="M44 22l8-4v28l-8-4z" fill="#FF7049" />
        </svg>
      );
    case "expat":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <circle cx="32" cy="32" r="20" fill="#CFFCDE" />
          <path d="M14 32h36M32 14c5 5 8 11 8 18s-3 13-8 18c-5-5-8-11-8-18s3-13 8-18z" stroke="#0A7474" strokeWidth="2" fill="none" />
          <circle cx="44" cy="22" r="5" fill="#FF7049" />
        </svg>
      );
    case "student":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <path d="M8 28l24-12 24 12-24 12L8 28z" fill="#DFD7FF" />
          <path d="M20 32v10c0 4 5 7 12 7s12-3 12-7V32" stroke="#563BFF" strokeWidth="2.5" fill="none" />
          <path d="M52 28v14" stroke="#FF7049" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "cruise":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <path d="M8 42c4 4 10 4 14 0s10-4 14 0 10 4 14 0" stroke="#0A7474" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M14 38h36L46 28H18l-4 10z" fill="#DFD7FF" />
          <rect x="22" y="20" width="20" height="8" fill="#FF7049" />
          <path d="M32 12v8" stroke="#140B7A" strokeWidth="2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <circle cx="32" cy="32" r="20" fill="#DFD7FF" />
        </svg>
      );
  }
}
