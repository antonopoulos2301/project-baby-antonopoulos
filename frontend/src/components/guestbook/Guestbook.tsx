import {
    useEffect,
    useState,
} from "react";

import { GuestbookForm } from "./GuestbookForm";
import { GuestbookList } from "./GuestbookList";

import { guestbookService } from "../../services/GuestbookService";

import type {
    GuestbookMessage,
} from "../../types/Guestbook";

export function Guestbook() {
    const [messages, setMessages] =
        useState<GuestbookMessage[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        async function loadMessages() {
            try {
                const data =
                    await guestbookService.findAll();

                setMessages(data);
            } catch (error) {
                console.error(error);

                setError(
                    "Não foi possível carregar o livro de visitas."
                );
            } finally {
                setLoading(false);
            }
        }

        loadMessages();
    }, []);

    return (
        <section className="border-t border-beige/50 bg-cream/30">
            <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
                <header className="mx-auto max-w-2xl text-center">
                    <span className="font-display text-3xl text-sage-500">
                        ♡
                    </span>

                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-sage-700">
                        Livro de visitas
                    </p>

                    <h2 className="mt-4 font-display text-4xl leading-tight text-brown-900 sm:text-5xl">
                        Deixe algumas palavras
                        <span className="block italic text-sage-500">
                            para eu ler no futuro
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-brown-500 sm:text-base">
                        Amigos e familiares também fazem parte
                        desta história. Deixe uma mensagem que
                        possa ser guardada por muitos anos.
                    </p>
                </header>

                <div
                    id="guestbook-form"
                    className="mx-auto mt-12 max-w-2xl scroll-mt-10"
                >
                    <GuestbookForm />
                </div>

                <div className="mt-20">
                    <div className="mb-8 flex items-center gap-4">
                        <div className="h-px flex-1 bg-beige/70" />

                        <h3 className="font-display text-2xl text-brown-900 sm:text-3xl">
                            Mensagens para você
                        </h3>

                        <div className="h-px flex-1 bg-beige/70" />
                    </div>

                    {loading && (
                        <div className="py-14 text-center text-sm text-brown-500">
                            Carregando mensagens...
                        </div>
                    )}

                    {error && (
                        <div className="rounded-2xl border border-peach-300 bg-peach-100 p-5 text-center text-sm text-brown-700">
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <GuestbookList
                            messages={messages}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}