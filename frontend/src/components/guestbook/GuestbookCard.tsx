import type {
    GuestbookMessage,
} from "../../types/Guestbook";

interface GuestbookCardProps {
    guestbookMessage: GuestbookMessage;
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }
    ).format(new Date(date));
}

export function GuestbookCard({
    guestbookMessage,
}: GuestbookCardProps) {
    return (
        <article className="relative rounded-[2rem] border border-beige/70 bg-white/70 p-6 shadow-[0_15px_50px_rgba(114,94,73,0.07)] sm:p-8">
            <div className="absolute right-6 top-5 font-display text-2xl text-peach-300">
                ♡
            </div>

            <blockquote className="pr-8 font-display text-xl leading-8 text-brown-900 sm:text-2xl sm:leading-9">
                “{guestbookMessage.message}”
            </blockquote>

            <div className="mt-7 flex items-end justify-between gap-4 border-t border-beige/60 pt-5">
                <div>
                    <p className="font-semibold text-sage-700">
                        {guestbookMessage.name}
                    </p>

                    <time className="mt-1 block text-xs text-brown-300">
                        {formatDate(guestbookMessage.createdAt)}
                    </time>
                </div>

                <span className="text-sage-300">
                    ❧
                </span>
            </div>
        </article>
    );
}