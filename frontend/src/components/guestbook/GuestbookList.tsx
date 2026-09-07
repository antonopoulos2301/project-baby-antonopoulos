import { GuestbookCard } from "./GuestbookCard";

import type {
    GuestbookMessage,
} from "../../types/Guestbook";

interface GuestbookListProps {
    messages: GuestbookMessage[];
}

export function GuestbookList({
    messages,
}: GuestbookListProps) {
    if (messages.length === 0) {
        return (
            <div className="rounded-[2rem] border border-dashed border-beige bg-cream/40 px-6 py-14 text-center">
                <span className="font-display text-3xl text-sage-500">
                    ♡
                </span>

                <h3 className="mt-4 font-display text-2xl text-brown-900">
                    Seja a primeira pessoa a escrever
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-brown-500">
                    As mensagens deixadas aqui poderão
                    fazer parte de uma lembrança muito
                    especial no futuro.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-5 md:grid-cols-2">
            {messages.map((message) => (
                <GuestbookCard
                    key={message.id}
                    guestbookMessage={message}
                />
            ))}
        </div>
    );
}