import { useEffect, useState } from "react";
import type { MemoryComment, MemoryReaction } from "../types/Memory";

const API = import.meta.env.VITE_API_URL ?? "";
const EMOJIS = ["❤️", "😍", "🥰", "👏", "😂"];

interface Props {
  /** Base da API do item, ex.: "/api/memories/12" ou "/api/photos/3" */
  basePath: string;
  /** Chave única para guardar a reação deste item no navegador */
  reactionKey: string;
  reactions?: MemoryReaction[];
  comments?: MemoryComment[];
}

function buildCounts(reactions?: MemoryReaction[]): Record<string, number> {
  const base: Record<string, number> = {};
  for (const e of EMOJIS) base[e] = 0;
  for (const r of reactions ?? []) {
    if (Object.prototype.hasOwnProperty.call(base, r.emoji)) {
      base[r.emoji] = r.count;
    }
  }
  return base;
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function Engagement({ basePath, reactionKey, reactions, comments }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    buildCounts(reactions),
  );
  const [mine, setMine] = useState<string | null>(() => {
    try {
      return localStorage.getItem(reactionKey);
    } catch {
      return null;
    }
  });
  const [busy, setBusy] = useState(false);

  const [list, setList] = useState<MemoryComment[]>(comments ?? []);
  const [name, setName] = useState<string>(() => {
    try {
      return localStorage.getItem("comment_name") ?? "";
    } catch {
      return "";
    }
  });
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sheet, setSheet] = useState<"form" | "list" | null>(null);

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheet(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  function storeMine(emoji: string | null) {
    try {
      if (emoji) localStorage.setItem(reactionKey, emoji);
      else localStorage.removeItem(reactionKey);
    } catch {
      // ignore
    }
  }

  async function react(emoji: string) {
    if (busy) return;
    setBusy(true);
    const url = `${API}${basePath}/reactions`;
    const headers = { "Content-Type": "application/json" };
    try {
      if (mine === emoji) {
        const res = await fetch(url, {
          method: "DELETE",
          headers,
          body: JSON.stringify({ emoji }),
        });
        if (res.ok) {
          setCounts(buildCounts(await res.json()));
          setMine(null);
          storeMine(null);
        }
      } else {
        if (mine) {
          await fetch(url, {
            method: "DELETE",
            headers,
            body: JSON.stringify({ emoji: mine }),
          });
        }
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({ emoji }),
        });
        if (res.ok) {
          setCounts(buildCounts(await res.json()));
          setMine(emoji);
          storeMine(emoji);
        }
      }
    } catch {
      // silencioso
    } finally {
      setBusy(false);
    }
  }

  async function submitComment() {
    setError(null);
    if (name.trim().length < 2) {
      setError("Digite seu nome.");
      return;
    }
    if (text.trim().length < 1) {
      setError("Escreva um comentário.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${API}${basePath}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), text: text.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Não foi possível enviar o comentário.");
        return;
      }
      setList((prev) => [...prev, data as MemoryComment]);
      setText("");
      try {
        localStorage.setItem("comment_name", name.trim());
      } catch {
        // ignore
      }
      setSheet("list");
    } catch {
      setError("Erro de conexão ao comentar.");
    } finally {
      setSending(false);
    }
  }

  const commentCount = list.length;

  return (
    <div className="mt-6 border-t border-beige pt-5 text-left">
      {/* Reações */}
      <div className="flex flex-wrap gap-2">
        {EMOJIS.map((emoji) => {
          const active = mine === emoji;
          const n = counts[emoji] ?? 0;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => react(emoji)}
              disabled={busy}
              className={[
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition",
                active
                  ? "border-peach-300 bg-peach-100"
                  : "border-beige bg-white/70 hover:bg-white",
              ].join(" ")}
            >
              <span className="text-base leading-none">{emoji}</span>
              {n > 0 && (
                <span className="text-xs font-semibold text-brown-500">{n}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ações de comentário */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSheet("form")}
          className="inline-flex items-center gap-2 rounded-full bg-sage-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sage-700"
        >
          <span>✎</span> Comentar
        </button>

        <button
          type="button"
          onClick={() => setSheet("list")}
          className="inline-flex items-center gap-1.5 rounded-full border border-beige bg-white/70 px-4 py-2 text-sm font-medium text-brown-600 transition hover:bg-white"
        >
          <span>💬</span> {commentCount}
        </button>
      </div>

      {/* Bottom sheet: formulário */}
      {sheet === "form" && (
        <BottomSheet title="Deixe um comentário" onClose={() => setSheet(null)}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Seu nome"
            className="mb-3 w-full rounded-2xl border border-beige bg-white/80 px-4 py-3 text-sm text-brown-900 outline-none focus:border-sage-500"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Escreva um comentário..."
            className="w-full resize-y rounded-2xl border border-beige bg-white/80 px-4 py-3 text-sm text-brown-900 outline-none focus:border-sage-500"
          />
          {error && <p className="mt-2 text-sm text-peach-500">{error}</p>}
          <button
            type="button"
            onClick={submitComment}
            disabled={sending}
            className="mt-4 w-full rounded-full bg-brown-900 px-6 py-3 font-medium text-paper transition hover:bg-brown-700 disabled:opacity-60"
          >
            {sending ? "Enviando..." : "Enviar comentário ♡"}
          </button>
        </BottomSheet>
      )}

      {/* Bottom sheet: lista */}
      {sheet === "list" && (
        <BottomSheet
          title={`Comentários (${commentCount})`}
          onClose={() => setSheet(null)}
        >
          {commentCount === 0 ? (
            <p className="py-6 text-center text-sm text-brown-500">
              Seja a primeira pessoa a comentar 💭
            </p>
          ) : (
            <ul className="space-y-4">
              {list.map((c) => (
                <li key={c.id} className="text-sm leading-6">
                  <span className="font-semibold text-brown-700">{c.name}</span>{" "}
                  <span className="text-brown-500">{c.text}</span>
                  <span className="ml-2 text-xs text-brown-300">
                    {formatDate(c.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={() => setSheet("form")}
            className="mt-5 w-full rounded-full border border-sage-500 px-6 py-3 text-sm font-medium text-sage-700 transition hover:bg-sage-100"
          >
            ✎ Comentar
          </button>
        </BottomSheet>
      )}
    </div>
  );
}

interface BottomSheetProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function BottomSheet({ title, onClose, children }: BottomSheetProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-brown-900/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-beige bg-paper p-5 shadow-2xl sm:mb-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-beige" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl text-brown-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full px-2 text-2xl leading-none text-brown-500 transition hover:text-brown-900"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
