import { useEffect, useState } from "react";
import { Hero } from "./components/Hero";
import { Timeline } from "./components/Timeline";
import { EmptyState } from "./components/EmptyState";
import { LoadingState } from "./components/LoadingState";
import { memoryService } from "./services/MemoryService";
import { Poll } from "./components/Poll";
import { Footer } from "./components/Footer";
import type { Memory } from "./types/Memory";
import { Guestbook } from "./components/guestbook/Guestbook";

function App() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMemories() {
      try {
        const data =
          await memoryService.findAll();

        setMemories(data);
      } catch (error) {
        console.error(error);

        setError(
          "Não foi possível carregar nossas memórias."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMemories();
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <Hero />

      <main className="mx-auto max-w-5xl px-5 pb-24 sm:px-8 lg:px-10">
        <Poll />

        <section className="pt-16 sm:pt-24">
          <div className="mb-14 text-center">
            <span className="font-display text-2xl text-sage-500">
              ♡
            </span>

            <h2 className="mt-2 font-display text-4xl text-brown-900 sm:text-5xl">
              Nossa história
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-brown-500 sm:text-base">
              Cada pequeno momento merece um lugar
              especial para ser lembrado.
            </p>
          </div>

          {loading && <LoadingState />}

          {error && (
            <div className="rounded-3xl border border-peach-300 bg-peach-100 p-8 text-center text-brown-700">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            memories.length === 0 && (
              <EmptyState />
            )}

          {!loading &&
            !error &&
            memories.length > 0 && (
              <Timeline memories={memories} />
            )}
        </section>
      </main>

      <Guestbook />

      <Footer />
    </div>
  );
}

export default App;