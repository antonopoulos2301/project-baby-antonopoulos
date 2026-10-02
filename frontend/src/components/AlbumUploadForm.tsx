import { useEffect, useRef, useState } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export function AlbumUploadForm({ secret }: { secret: string }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!secret) {
      setStatus({ kind: "error", message: "Informe a senha de administrador acima." });
      return;
    }
    if (!file) {
      setStatus({ kind: "error", message: "Selecione uma foto." });
      return;
    }

    setStatus({ kind: "loading" });
    const data = new FormData();
    if (title.trim()) data.append("title", title.trim());
    data.append("image", file);

    try {
      const res = await fetch(`${API}/api/photos`, {
        method: "POST",
        headers: { "x-admin-secret": secret },
        body: data,
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus({
          kind: "error",
          message:
            (body?.error ?? `Não foi possível enviar (erro ${res.status}).`) +
            (body?.detail ? ` [${body.detail}]` : ""),
        });
        return;
      }
      setStatus({ kind: "success" });
      setTitle("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setStatus({ kind: "error", message: "Erro de conexão ao enviar a foto." });
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-beige bg-white/70 px-4 py-3 text-brown-900 outline-none transition focus:border-sage-500 focus:ring-2 focus:ring-sage-300/50";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-5 rounded-3xl border border-cream bg-cream/40 p-6 sm:p-8"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl text-brown-900">
          Adicionar foto ao álbum
        </h2>
        <p className="mt-2 text-sm text-brown-500">
          Usa a mesma senha de administrador acima.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-brown-700">
          Legenda (opcional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className={inputClass}
          placeholder="Ex.: Primeiro passeio no parque"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-brown-700">
          Foto *
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-brown-500 file:mr-4 file:rounded-full file:border-0 file:bg-sage-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-sage-700"
        />
        {preview && (
          <img
            src={preview}
            alt="Pré-visualização"
            className="mt-3 max-h-56 rounded-2xl object-cover"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={status.kind === "loading"}
        className="w-full rounded-full bg-brown-900 px-6 py-3.5 font-medium text-paper transition hover:bg-brown-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status.kind === "loading" ? "Enviando..." : "Enviar para o álbum 📸"}
      </button>

      {status.kind === "success" && (
        <div className="rounded-2xl border border-sage-300 bg-sage-100 p-4 text-center text-sm text-brown-700">
          Foto adicionada ao álbum! 💙
        </div>
      )}
      {status.kind === "error" && (
        <div className="rounded-2xl border border-peach-300 bg-peach-100 p-4 text-center text-sm text-brown-700">
          {status.message}
        </div>
      )}
    </form>
  );
}
