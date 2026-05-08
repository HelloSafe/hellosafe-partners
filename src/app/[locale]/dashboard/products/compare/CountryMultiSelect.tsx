"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { listCountries, flagUrl, type Country } from "@/lib/countries";

export function CountryMultiSelect({
  selected,
  onChange,
  placeholder = "Sélectionner un pays…",
}: {
  selected: string[];
  onChange: (codes: string[]) => void;
  placeholder?: string;
}) {
  const all = useMemo(() => listCountries("fr"), []);
  const byCode = useMemo(
    () => new Map(all.map((c) => [c.code, c])),
    [all],
  );

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Close on click outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    const norm = (s: string) =>
      s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    return all.filter((c) => norm(c.name).includes(norm(q)));
  }, [all, query]);

  const toggle = (code: string) => {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  const remove = (code: string) =>
    onChange(selected.filter((c) => c !== code));

  return (
    <div ref={wrapRef} className="relative">
      <div
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={`flex flex-wrap items-center gap-1.5 min-h-11 rounded-lg border border-surface-300 bg-white px-2 py-1.5 cursor-text transition-colors ${
          open ? "border-brand-500 ring-2 ring-brand-100" : "hover:border-surface-400"
        }`}
      >
        {selected.map((code) => {
          const c = byCode.get(code);
          if (!c) return null;
          return (
            <span
              key={code}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 border border-brand-100 px-2 py-1 text-xs font-medium text-brand-700"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={flagUrl(code)}
                alt=""
                width={16}
                height={12}
                className="h-3 w-auto"
              />
              {c.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(code);
                }}
                className="ml-1 text-brand-500 hover:text-brand-700"
                aria-label={`Retirer ${c.name}`}
              >
                ×
              </button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={selected.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent border-0 outline-none text-sm py-1 placeholder-ink-400"
        />
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border border-surface-300 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-ink-500">
              Aucun pays trouvé.
            </div>
          ) : (
            filtered.slice(0, 80).map((c) => {
              const on = selected.includes(c.code);
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => toggle(c.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                    on ? "bg-brand-50" : "hover:bg-surface-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={flagUrl(c.code)}
                    alt=""
                    width={20}
                    height={14}
                    className="h-3.5 w-auto rounded-sm"
                  />
                  <span className="flex-1 text-sm text-ink-900">{c.name}</span>
                  <span className="text-xs font-mono text-ink-400">{c.code}</span>
                  {on && (
                    <svg viewBox="0 0 16 16" className="h-4 w-4 text-brand-500" aria-hidden>
                      <path
                        d="M3 8.5l3 3 7-7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
