import {
    useState,
    type FormEvent,
} from "react";

import { guestbookService } from "../../services/GuestbookService";

import type {
    GuestbookMessage,
} from "../../types/Guestbook";

interface GuestbookFormProps {
    onCreated: (
        message: GuestbookMessage
    ) => void;
}

export function GuestbookForm({
    onCreated,
}: GuestbookFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const [sending, setSending] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setSending(true);
        setError(null);
        setSuccess(false);

        try {
            const created =
                await guestbookService.create({
                    name,
                    email,
                    message,
                });

            onCreated(created);

            setName("");
            setEmail("");
            setMessage("");

            setSuccess(true);
        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível enviar sua mensagem."
            );
        } finally {
            setSending(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-beige/70 bg-white/70 p-6 shadow-[0_20px_70px_rgba(114,94,73,0.08)] sm:p-10"
        >
            <div>
                <label
                    htmlFor="guest-name"
                    className="mb-2 block text-sm font-semibold text-brown-700"
                >
                    Seu nome
                </label>

                <input
                    id="guest-name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                        setName(event.target.value)
                    }
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="Como você gostaria de assinar?"
                    className="w-full rounded-2xl border border-beige bg-paper px-4 py-3 text-brown-900 outline-none transition placeholder:text-brown-300 focus:border-sage-500 focus:ring-4 focus:ring-sage-100"
                />
            </div>

            <div className="mt-5">
                <label
                    htmlFor="guest-email"
                    className="mb-2 block text-sm font-semibold text-brown-700"
                >
                    Seu e-mail
                </label>

                <input
                    id="guest-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    required
                    maxLength={254}
                    placeholder="voce@exemplo.com"
                    className="w-full rounded-2xl border border-beige bg-paper px-4 py-3 text-brown-900 outline-none transition placeholder:text-brown-300 focus:border-sage-500 focus:ring-4 focus:ring-sage-100"
                />

                <p className="mt-2 text-xs leading-5 text-brown-300">
                    Seu e-mail será armazenado de forma
                    privada e não aparecerá no mural.
                </p>
            </div>

            <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-4">
                    <label
                        htmlFor="guest-message"
                        className="text-sm font-semibold text-brown-700"
                    >
                        Sua mensagem
                    </label>

                    <span className="text-xs text-brown-300">
                        {message.length}/1000
                    </span>
                </div>

                <textarea
                    id="guest-message"
                    value={message}
                    onChange={(event) =>
                        setMessage(event.target.value)
                    }
                    required
                    minLength={5}
                    maxLength={1000}
                    rows={6}
                    placeholder="Escreva algumas palavras para o bebê ler no futuro..."
                    className="w-full resize-none rounded-2xl border border-beige bg-paper px-4 py-3 leading-7 text-brown-900 outline-none transition placeholder:text-brown-300 focus:border-sage-500 focus:ring-4 focus:ring-sage-100"
                />
            </div>

            {error && (
                <div className="mt-5 rounded-2xl border border-peach-300 bg-peach-100 px-4 py-3 text-sm text-brown-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-5 rounded-2xl border border-sage-300 bg-sage-100 px-4 py-3 text-sm text-sage-700">
                    Sua mensagem foi guardada com carinho. ♡
                </div>
            )}

            <button
                type="submit"
                disabled={sending}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-sage-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
                {sending
                    ? "Guardando mensagem..."
                    : "Deixar uma mensagem ♡"}
            </button>
        </form>
    );
}