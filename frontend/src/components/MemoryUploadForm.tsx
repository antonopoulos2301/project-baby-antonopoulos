import { useEffect, useRef, useState } from "react";
import { compressImage } from "../lib/compressImage";

const API = import.meta.env.VITE_API_URL ?? "";

const MEMORY_TYPES: { value: string; label: string }[] = [
  { value: "GRAVIDEZ", label: "Gravidez" },
  { value: "NASCIMENTO", label: "Nascimento" },
  { value: "MARCO", label: "Marco" },
  { value: "ANIVERSÁRIO", label: "Aniversário" },
  { value: "FOTO", label: "Foto" },
  { value: "CARTA", label: "Carta" },
  { value: "OUTRO", label: "Outro" },
];

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; imageUrl: string | null }
  | { kind: "error"; message: string };

export function MemoryUploadForm({ secret }: { secret: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [happenedAt, setHappenedAt] = useState("");
  const [type, setType] = useState("OUTRO");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setHappenedAt("");
    setType("OUTRO");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!secret) {
      setStatus({ kind: "error", message: "Informe a senha de administrador acima." });
      return;
    }
    if (!title.trim()) {
      setStatus({ kind: "error", message: "O título é obrigatório." });
      return;
    }
    if (!happenedAt) {
      setStatus({ kind: "error", message: "A data é obrigatória." });
      return;
    }

    setStatus({ kind: "loading" });

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("happenedAt", happenedAt);
    formData.append("type", type);
    if (file) {
      const small = await compressImage(file);
      if (small.size > 4.4 * 1024 * 1024) {
        setStatus({ kind: "error", message: "A imagem é grande demais, tente outra foto." });
        return;
      }
      formData.append("image", small);
    }

    try {
      const response = await fetch(`${API}/api/memories`, {
        method: "POST",
        headers: { "x-admin-secret": secret },
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setStatus({
          kind: "error",
          message:
            (body?.error ??
              `Não foi possível salvar a memória (erro ${response.status}).`) +
            (body?.detail ? ` [${body.detail}]` : ""),
        });
        return;
      }

      const created = await response.json();
      setStatus({ kind: "success", imageUrl: created.imageUrl ?? null });
      resetForm();
    } catch {
      setStatus({ kind: "error", message: "Erro de conexão ao enviar." });
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-beige bg-white/70 px-4 py-3 text-brown-900 outline-none transition focus:border-sage-500 focus:ring-2 focus:ring-sage-300/50";
  const labelClass = "mb-1.5 block text-sm font-medium text-brown-700";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-cream bg-cream/40 p-6 sm:p-8"
    >
      <div>
        <label className={labelClass}>Título *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Ex.: Primeiro ultrassom"
        />
      </div>

      <div>
        <label className={labelClass}>Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="Um pequeno texto sobre esse momento..."
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Data *</label>
          <input
            type="date"
            value={happenedAt}
            onChange={(e) => setHappenedAt(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Categoria</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClass}
          >
            {MEMORY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Foto</label>
        <input
          ref={fileInputRef}
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
        {status.kind === "loading" ? "Enviando..." : "Salvar memória ♡"}
      </button>

      {status.kind === "success" && (
        <div className="rounded-2xl border border-sage-300 bg-sage-100 p-4 text-center text-sm text-brown-700">
          Memória criada com sucesso! 💙
          {status.imageUrl && (
            <a
              href={status.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all text-xs text-sage-700 underline"
            >
              {status.imageUrl}
            </a>
          )}
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
