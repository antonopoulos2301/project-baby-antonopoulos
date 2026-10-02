import { useEffect, useState } from "react";
import { MemoryUploadForm } from "../components/MemoryUploadForm";
import { AlbumUploadForm } from "../components/AlbumUploadForm";
import { GuestbookModeration } from "../components/GuestbookModeration";

type Tab = "memoria" | "foto" | "moderacao";

const TABS: { value: Tab; label: string }[] = [
  { value: "memoria", label: "📝 Memórias" },
  { value: "foto", label: "📸 Fotos" },
  { value: "moderacao", label: "💬 Mural" },
];

export function AdminPage() {
  const [secret, setSecret] = useState("");
  const [remember, setRemember] = useState(false);
  const [tab, setTab] = useState<Tab>("memoria");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("adminSecret");
      if (saved) {
        setSecret(saved);
        setRemember(true);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (remember && secret) localStorage.setItem("adminSecret", secret);
      if (!remember) localStorage.removeItem("adminSecret");
    } catch {
      // ignore
    }
  }, [remember, secret]);

  const inputClass =
    "w-full rounded-2xl border border-beige bg-white/70 px-4 py-3 text-brown-900 outline-none transition focus:border-sage-500 focus:ring-2 focus:ring-sage-300/50";

  return (
    <div className="min-h-screen bg-paper px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl text-sage-500">♡</span>
          <h1 className="mt-2 font-display text-4xl text-brown-900">
            Painel de administração
          </h1>
          <p className="mt-3 text-sm leading-6 text-brown-500">
            Gerencie memórias, fotos do álbum e o mural de recados.
          </p>
        </div>

        {/* Senha (compartilhada por todas as abas) */}
        <div className="mb-6 rounded-3xl border border-cream bg-cream/40 p-5 sm:p-6">
          <label className="mb-1.5 block text-sm font-medium text-brown-700">
            Senha de administrador
          </label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <label className="mt-2 flex items-center gap-2 text-sm text-brown-500">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-beige text-sage-500"
            />
            Lembrar senha neste navegador
          </label>
        </div>

        {/* Abas */}
        <div className="mb-6 flex gap-2 rounded-full border border-beige bg-white/60 p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={[
                "flex-1 rounded-full px-3 py-2 text-sm font-medium transition",
                tab === t.value
                  ? "bg-brown-900 text-paper"
                  : "text-brown-600 hover:bg-cream/60",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Conteúdo da aba */}
        {tab === "memoria" && <MemoryUploadForm secret={secret} />}
        {tab === "foto" && <AlbumUploadForm secret={secret} />}
        {tab === "moderacao" && <GuestbookModeration secret={secret} />}

        <p className="mt-6 text-center text-xs text-brown-300">
          <a href="/" className="underline hover:text-brown-500">
            ← Voltar para o site
          </a>
        </p>
      </div>
    </div>
  );
}
