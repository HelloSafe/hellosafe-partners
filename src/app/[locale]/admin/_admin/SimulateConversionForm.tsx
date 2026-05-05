"use client";

import { useState } from "react";

export function SimulateConversionForm({
  onDone,
}: {
  onDone: () => Promise<void>;
}) {
  const [shortCode, setShortCode] = useState("");
  const [amount, setAmount] = useState("79");
  const [commission, setCommission] = useState("12");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/test-conversion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          shortCode: shortCode.trim(),
          amount: Number(amount),
          commission: Number(commission),
          status: "validated",
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setMsg(`Erreur : ${d.error ?? res.status}`);
      } else {
        setMsg(`Conversion créée : ${d.externalOrderId}`);
        setShortCode("");
        await onDone();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mt-4 grid gap-3 sm:grid-cols-[1fr_100px_100px_auto]"
    >
      <input
        required
        value={shortCode}
        onChange={(e) => setShortCode(e.target.value)}
        placeholder="shortCode (ex: wr4h2cx5)"
        className="rounded-lg border border-surface-300 px-3 h-10 text-sm font-mono"
      />
      <input
        required
        type="number"
        step="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount €"
        className="rounded-lg border border-surface-300 px-3 h-10 text-sm"
      />
      <input
        required
        type="number"
        step="0.01"
        value={commission}
        onChange={(e) => setCommission(e.target.value)}
        placeholder="Commission €"
        className="rounded-lg border border-surface-300 px-3 h-10 text-sm"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-brand-500 text-white text-sm font-semibold px-4 h-10 hover:bg-brand-600 disabled:opacity-50"
      >
        Créer {busy ? "…" : "→"}
      </button>
      {msg && <p className="sm:col-span-4 text-xs text-ink-500">{msg}</p>}
    </form>
  );
}
