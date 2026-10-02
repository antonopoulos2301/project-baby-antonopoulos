import { useCallback, useEffect, useState } from "react";
import type {
  AdminGuestbookMessage,
  GuestbookStatus,
} from "../types/Guestbook";

const API = import.meta.env.VITE_API_URL ?? "";

type Filter = GuestbookStatus | "ALL";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "PENDING", label: "Pendentes" },
  { value: "APPROVED", label: "Aprovadas" },
  { value: "REJECTED", label: "Reprovadas" },
  { value: "ALL", label: "Todas" },
];

const STATUS_BADGE: Record<GuestbookStatus, string> = {
  PENDING: "bg-peach-100 text-peach-500 border-peach-300",
  APPROVED: "bg-sage-100 text-sage-700 border-sage-300",
  REJECTED: "bg-cream text-brown-500 border-beige",
};

const STATUS_LABEL: Record<GuestbookStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovada",
  REJECTED: "Reprovada",
};

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function GuestbookModeration({ secret }: { secret: string }) {
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [messages, setMessages] = useState<AdminGuestbookMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!secret) {
      setError("Informe a senha de administrador acima.");
      setMessages([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const qs = filter === "ALL" ? "" : `?status=${filter}`;
      const res = await fetch(`${API}/api/guestbook/admin${qs}`, {
        headers: { "x-admin-secret": secret },
      });
      if (res.status === 401) {
        setError("Senha inválida.");
        setMessages([]);
        return;
      }
      if (!res.ok) throw new Error();
      setMessages(await res.json());
    } catch {
      setError("Não foi possível carregar as mensagens.");
    } finally {
      setLoading(false);
    }
  }, [filter, secret]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: number, status: GuestbookStatus) {
    setActingId(id);
    try {
      const res = await fetch(`${API}/api/guestbook/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setError("Não foi possível atualizar a mensagem.");
        return;
      }
      // Remove/atualiza da lista conforme o filtro atual
      setMessages((prev) =>
        filter === "ALL"
          ? prev.map((m) => (m.id === id ? { ...m, status } : m))
          : prev.filter((m) => m.id !== id),
      );
    } catch {
      setError("Erro de conexão.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="rounded-3xl border border-cream bg-cream/40 p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={[
                "rounded-full border px-3 py-1.5 text-sm transition",
                filter === f.value
                  ? "border-sage-500 bg-sage-500 text-white"
                  : "border-beige bg-white/70 text-brown-600 hover:bg-white",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-full border border-beige bg-white/70 px-3 py-1.5 text-sm text-brown-600 transition hover:bg-white"
        >
          ↻ Atualizar
        </button>
      </div>

      {loading && (
        <p className="py-10 text-center text-sm text-brown-500">Carregando...</p>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-peach-300 bg-peach-100 p-4 text-center text-sm text-brown-700">
          {error}
        </div>
      )}

      {!loading && !error && messages.length === 0 && (
        <p className="py-10 text-center text-sm text-brown-500">
          Nenhuma mensagem aqui.
        </p>
      )}

      {!loading && !error && messages.length > 0 && (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li
              key={m.id}
              className="rounded-2xl border border-beige bg-white/70 p-4"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-semibold text-brown-700">{m.name}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[m.status]}`}
                >
                  {STATUS_LABEL[m.status]}
                </span>
              </div>
              <p className="text-xs text-brown-300">
                {m.email} · {formatDate(m.createdAt)}
              </p>
              <p className="mt-2 text-sm leading-6 text-brown-600">{m.message}</p>

              <div className="mt-3 flex gap-2">
                {m.status !== "APPROVED" && (
                  <button
                    type="button"
                    disabled={actingId === m.id}
                    onClick={() => setStatus(m.id, "APPROVED")}
                    className="rounded-full bg-sage-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-sage-700 disabled:opacity-60"
                  >
                    ✓ Aprovar
                  </button>
                )}
                {m.status !== "REJECTED" && (
                  <button
                    type="button"
                    disabled={actingId === m.id}
                    onClick={() => setStatus(m.id, "REJECTED")}
                    className="rounded-full border border-peach-300 bg-peach-100 px-4 py-1.5 text-sm font-medium text-peach-500 transition hover:bg-peach-300 hover:text-white disabled:opacity-60"
                  >
                    ✕ Reprovar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
