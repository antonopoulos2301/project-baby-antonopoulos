import { useState } from "react";
import type { MemoryComment, MemoryReaction } from "../types/Memory";

const API = import.meta.env.VITE_API_URL ?? "";
const EMOJIS = ["❤️", "😍", "🥰", "👏", "😂"];

interface Props {
  memoryId: number;
  reactions?: MemoryReaction[];
  comments?: MemoryComment[];
}

function buildCounts(reactions?: MemoryReaction[]): Record<string, number> {
  const base: Record<string, number> = {};
  for (const e of EMOJIS) base[e] = 0;
  for (const r of reactions ?? []) {
    if (e_in(base, r.emoji)) base[r.emoji] = r.count;
  }
  return base;
}

function e_in(obj: Record<string, number>, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
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

export function MemoryEngagement({ memoryId, reactions, comments }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    buildCounts(reactions),
  );
  const [mine, setMine] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`memreact_${memoryId}`);
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

  function applyCounts(data: MemoryReaction[]) {
    setCounts(buildCounts(data));
  }

  function storeMine(emoji: string | null) {
    try {
      if (emoji) localStorage.setItem(`memreact_${memoryId}`, emoji);
      else localStorage.removeItem(`memreact_${memoryId}`);
    } catch {
      // ignore
    }
  }

  async function react(emoji: string) {
    if (busy) return;
    setBusy(true);
    const url = `${API}/api/memories/${memoryId}/reactions`;
    const headers = { "Content-Type": "application/json" };
    try {
      if (mine === emoji) {
        const res = await fetch(url, {
          method: "DELETE",
          headers,
          body: JSON.stringify({ emoji }),
        });
        if (res.ok) {
          applyCounts(await res.json());
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
          applyCounts(await res.json());
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
      const res = await fetch(`${API}/api/memories/${memoryId}/comments`, {
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
    } catch {
      setError("Erro de conexão ao comentar.");
    } finally {
      setSending(false);
    }
  }

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

      {/* Comentários */}
      <div className="mt-5">
        {list.length > 0 && (
          <ul className="mb-4 space-y-3">
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

        <div className="rounded-2xl border border-beige bg-white/60 p-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Seu nome"
            className="mb-2 w-full rounded-xl border border-beige bg-white/80 px-3 py-2 text-sm text-brown-900 outline-none focus:border-sage-500"
          />
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              rows={1}
              placeholder="Escreva um comentário..."
              className="min-h-[40px] flex-1 resize-y rounded-xl border border-beige bg-white/80 px-3 py-2 text-sm text-brown-900 outline-none focus:border-sage-500"
            />
            <button
              type="button"
              onClick={submitComment}
              disabled={sending}
              className="shrink-0 rounded-full bg-sage-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sage-700 disabled:opacity-60"
            >
              {sending ? "..." : "Enviar"}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-peach-500">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
