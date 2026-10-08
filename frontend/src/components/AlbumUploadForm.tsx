import { useEffect, useRef, useState } from "react";

const API = import.meta.env.VITE_API_URL ?? "";
const MAX_BYTES = 10 * 1024 * 1024; // mesmo limite do backend

type ItemStatus = "pending" | "uploading" | "done" | "error";

interface Item {
  id: string;
  file: File;
  preview: string;
  status: ItemStatus;
  error?: string;
}

let seq = 0;

export function AlbumUploadForm({ secret }: { secret: string }) {
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;

  // libera as pré-visualizações ao sair da página
  useEffect(() => {
    return () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.preview));
  }, []);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setSummary(null);
    const novos: Item[] = Array.from(list)
      .filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name))
      .map((file) => {
        const tooBig = file.size > MAX_BYTES;
        return {
          id: `f${++seq}`,
          file,
          preview: URL.createObjectURL(file),
          status: tooBig ? "error" : "pending",
          error: tooBig ? "Arquivo maior que 10 MB" : undefined,
        } as Item;
      });
    setItems((prev) => [...prev, ...novos]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const it = prev.find((i) => i.id === id);
      if (it) URL.revokeObjectURL(it.preview);
      return prev.filter((i) => i.id !== id);
    });
  }

  function setStatus(id: string, status: ItemStatus, error?: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status, error } : i)));
  }

  async function uploadOne(item: Item): Promise<"ok" | "auth" | "fail"> {
    setStatus(item.id, "uploading");
    const data = new FormData();
    if (title.trim()) data.append("title", title.trim());
    data.append("image", item.file);
    try {
      const res = await fetch(`${API}/api/photos`, {
        method: "POST",
        headers: { "x-admin-secret": secret },
        body: data,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg =
          res.status === 401
            ? "Senha inválida"
            : (body?.error ?? `Erro ${res.status}`) + (body?.detail ? ` [${body.detail}]` : "");
        setStatus(item.id, "error", msg);
        return res.status === 401 ? "auth" : "fail";
      }
      setStatus(item.id, "done");
      return "ok";
    } catch {
      setStatus(item.id, "error", "Erro de conexão");
      return "fail";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSummary(null);

    if (!secret) {
      setFormError("Informe a senha de administrador acima.");
      return;
    }
    // envia as pendentes e tenta de novo as que deram erro de envio
    const queue = itemsRef.current.filter(
      (i) => i.status === "pending" || (i.status === "error" && i.file.size <= MAX_BYTES),
    );
    if (queue.length === 0) {
      setFormError("Selecione ao menos uma foto.");
      return;
    }

    setRunning(true);
    let ok = 0;
    let fail = 0;
    // uma por vez: mais leve para o servidor gratuito
    for (const item of queue) {
      const result = await uploadOne(item);
      if (result === "ok") ok++;
      else {
        fail++;
        // senha errada: não adianta continuar
        if (result === "auth") break;
      }
    }
    setRunning(false);

    // remove da lista as que subiram com sucesso
    setItems((prev) => {
      prev.filter((i) => i.status === "done").forEach((i) => URL.revokeObjectURL(i.preview));
      return prev.filter((i) => i.status !== "done");
    });

    if (fail === 0) {
      setSummary(`${ok} ${ok === 1 ? "foto adicionada" : "fotos adicionadas"} ao álbum! 💗`);
      setTitle("");
    } else {
      setSummary(
        `${ok} enviada${ok === 1 ? "" : "s"}, ${fail} com erro. As que falharam continuam abaixo — é só clicar em enviar de novo.`,
      );
    }
  }

  const total = items.length;
  const doneCount = items.filter((i) => i.status === "done").length;
  const current = items.findIndex((i) => i.status === "uploading");
  const sendable = items.filter(
    (i) => i.status === "pending" || (i.status === "error" && i.file.size <= MAX_BYTES),
  ).length;

  const inputClass =
    "w-full rounded-2xl border border-beige bg-white/70 px-4 py-3 text-brown-900 outline-none transition focus:border-sage-500 focus:ring-2 focus:ring-sage-300/50";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-cream bg-cream/40 p-6 sm:p-8"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl text-brown-900">Adicionar fotos ao álbum</h2>
        <p className="mt-2 text-sm text-brown-500">
          Selecione várias de uma vez. Elas são otimizadas e enviadas uma a uma.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-brown-700">
          Legenda (opcional — vale para todas desta leva)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          disabled={running}
          className={inputClass}
          placeholder="Ex.: Chá revelação"
        />
      </div>

      <div>
        <label
          className={[
            "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-beige bg-white/50 px-4 py-8 text-center transition hover:border-sage-300 hover:bg-white/80",
            running ? "pointer-events-none opacity-60" : "",
          ].join(" ")}
        >
          <span className="text-3xl">📸</span>
          <span className="text-sm font-medium text-brown-700">
            Toque para escolher as fotos
          </span>
          <span className="text-xs text-brown-300">Você pode selecionar várias</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>
      </div>

      {total > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-brown-500">
            <span>
              {total} {total === 1 ? "foto selecionada" : "fotos selecionadas"}
            </span>
            {!running && (
              <button
                type="button"
                onClick={() => {
                  items.forEach((i) => URL.revokeObjectURL(i.preview));
                  setItems([]);
                }}
                className="underline hover:text-brown-700"
              >
                Limpar tudo
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {items.map((it) => (
              <div
                key={it.id}
                className="relative aspect-square overflow-hidden rounded-xl border border-beige bg-white"
                title={it.error ?? it.file.name}
              >
                <img src={it.preview} alt="" className="h-full w-full object-cover" />

                {it.status === "uploading" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-paper/70 text-xs font-medium text-brown-700">
                    Enviando…
                  </div>
                )}
                {it.status === "done" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-sage-500/60 text-2xl text-white">
                    ✓
                  </div>
                )}
                {it.status === "error" && (
                  <div className="absolute inset-x-0 bottom-0 bg-peach-500/90 px-1 py-0.5 text-center text-[10px] leading-tight text-white">
                    {it.error}
                  </div>
                )}
                {!running && it.status !== "done" && (
                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    aria-label="Remover"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-paper/90 text-sm leading-none text-brown-700 shadow hover:bg-white"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {running && (
        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-beige/60">
            <div
              className="h-full bg-sage-500 transition-all"
              style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-brown-500">
            Enviando {Math.max(current + 1, doneCount)} de {total}… não feche a página.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={running || sendable === 0}
        className="w-full rounded-full bg-brown-900 px-6 py-3.5 font-medium text-paper transition hover:bg-brown-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {running
          ? "Enviando..."
          : sendable > 1
            ? `Enviar ${sendable} fotos para o álbum 📸`
            : "Enviar para o álbum 📸"}
      </button>

      {summary && (
        <div className="rounded-2xl border border-sage-300 bg-sage-100 p-4 text-center text-sm text-brown-700">
          {summary}
        </div>
      )}
      {formError && (
        <div className="rounded-2xl border border-peach-300 bg-peach-100 p-4 text-center text-sm text-brown-700">
          {formError}
        </div>
      )}
    </form>
  );
}
