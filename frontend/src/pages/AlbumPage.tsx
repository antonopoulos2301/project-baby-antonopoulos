import { useEffect, useState } from "react";
import type { Photo } from "../types/Photo";
import { Engagement } from "../components/Engagement";

const API = import.meta.env.VITE_API_URL ?? "";

export function AlbumPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/photos`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        setPhotos(await res.json());
      } catch {
        setError("Não foi possível carregar o álbum.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") setIndex((i) => (i === null ? i : Math.min(i + 1, photos.length - 1)));
      if (e.key === "ArrowLeft") setIndex((i) => (i === null ? i : Math.max(i - 1, 0)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos.length]);

  const current = index !== null ? photos[index] : null;

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-beige/60">
        <div className="mx-auto max-w-5xl px-5 py-12 text-center sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sage-700">
            Nossas fotos
          </p>
          <h1 className="mt-3 font-display text-4xl text-brown-900 sm:text-5xl">
            Álbum de fotos
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-brown-500 sm:text-base">
            Toque em uma foto para ampliar, reagir e comentar. 💙💗
          </p>
          <a
            href="/"
            className="mt-6 inline-block text-sm text-sage-700 underline hover:text-brown-500"
          >
            ← Voltar para o site
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        {loading && (
          <p className="py-16 text-center text-sm text-brown-500">
            Carregando o álbum...
          </p>
        )}

        {error && !loading && (
          <div className="rounded-3xl border border-peach-300 bg-peach-100 p-8 text-center text-brown-700">
            {error}
          </div>
        )}

        {!loading && !error && photos.length === 0 && (
          <div className="rounded-3xl border border-beige bg-cream/40 p-12 text-center">
            <span className="font-display text-3xl text-sage-500">❧</span>
            <p className="mt-3 text-brown-500">
              Ainda não há fotos no álbum. Em breve, novas lembranças aqui. ♡
            </p>
          </div>
        )}

        {!loading && !error && photos.length > 0 && (
          <div className="columns-2 gap-4 sm:columns-3 [&>*]:mb-4">
            {photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setIndex(i)}
                className="group block w-full break-inside-avoid overflow-hidden rounded-2xl border border-beige/70 bg-white/70 shadow-[0_12px_40px_rgba(114,94,73,0.08)] transition hover:-translate-y-0.5"
              >
                <img
                  src={p.imageUrl}
                  alt={p.title ?? "Foto"}
                  loading="lazy"
                  className="w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                {p.title && (
                  <p className="px-3 py-2 text-left text-sm text-brown-600">
                    {p.title}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {current && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-brown-900/80 backdrop-blur-sm"
          onClick={() => setIndex(null)}
        >
          <div className="flex min-h-full items-start justify-center p-4 sm:p-8">
            <div
              className="relative w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Barra superior */}
              <div className="mb-3 flex items-center justify-between text-paper">
                <span className="text-sm opacity-80">
                  {(index ?? 0) + 1} / {photos.length}
                </span>
                <button
                  type="button"
                  onClick={() => setIndex(null)}
                  aria-label="Fechar"
                  className="rounded-full px-2 text-3xl leading-none transition hover:opacity-70"
                >
                  ×
                </button>
              </div>

              <div className="overflow-hidden rounded-3xl bg-paper">
                <div className="relative bg-brown-900/5">
                  <img
                    src={current.imageUrl}
                    alt={current.title ?? "Foto"}
                    className="max-h-[65vh] w-full object-contain"
                  />

                  {index !== null && index > 0 && (
                    <button
                      type="button"
                      onClick={() => setIndex(index - 1)}
                      aria-label="Anterior"
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-paper/80 px-3 py-2 text-xl text-brown-700 shadow transition hover:bg-paper"
                    >
                      ‹
                    </button>
                  )}
                  {index !== null && index < photos.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setIndex(index + 1)}
                      aria-label="Próxima"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-paper/80 px-3 py-2 text-xl text-brown-700 shadow transition hover:bg-paper"
                    >
                      ›
                    </button>
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  {current.title && (
                    <h2 className="font-display text-2xl text-brown-900">
                      {current.title}
                    </h2>
                  )}

                  <Engagement
                    key={current.id}
                    basePath={`/api/photos/${current.id}`}
                    reactionKey={`photoreact_${current.id}`}
                    reactions={current.reactions}
                    comments={current.comments}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
