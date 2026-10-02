import type { Memory } from "../types/Memory";
import { MemoryEngagement } from "./MemoryEngagement";

interface MemoryCardProps {
    memory: Memory;
    index: number;
}

const memoryTypeLabels: Record<string, string> = {
    GRAVIDEZ: "Gravidez",
    NASCIMENTO: "Nascimento",
    MARCO: "Nova descoberta",
    ANIVERSARIO: "Aniversário",
    FOTO: "Fotografia",
    CARTA: "Carta",
    OUTRO: "Memória",

    PREGNANCY: "Gravidez",
    BIRTH: "Nascimento",
    MILESTONE: "Nova descoberta",
    BIRTHDAY: "Aniversário",
    PHOTO: "Fotografia",
    LETTER: "Carta",
    OTHER: "Memória",
};

const memoryTypeStyles: Record<string, string> = {
    GRAVIDEZ:
        "bg-sage-100 text-sage-700 border-sage-300",

    NASCIMENTO:
        "bg-peach-100 text-peach-500 border-peach-300",

    MARCO:
        "bg-cream text-brown-500 border-beige",

    ANIVERSARIO:
        "bg-peach-100 text-brown-500 border-peach-300",

    CARTA:
        "bg-sage-100 text-sage-700 border-sage-300",

    FOTO:
        "bg-cream text-brown-500 border-beige",

    OUTRO:
        "bg-cream text-brown-500 border-beige",
};

function formatDate(date: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(date));
}

export function MemoryCard({
    memory,
    index,
}: MemoryCardProps) {
    const left = index % 2 === 0;

    const typeStyle =
        memoryTypeStyles[memory.type] ??
        "bg-cream text-brown-500 border-beige";

    const typeLabel =
        memoryTypeLabels[memory.type] ??
        memory.type;

    return (
        <article className="relative grid pl-10 sm:grid-cols-2 sm:gap-16 sm:pl-0">
            <div className="absolute left-0 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-beige bg-paper sm:left-1/2 sm:-translate-x-1/2">
                <div className="h-2 w-2 rounded-full bg-sage-500" />
            </div>

            <div
                className={[
                    left
                        ? "sm:col-start-1"
                        : "sm:col-start-2",

                    left
                        ? "sm:text-right"
                        : "sm:text-left",
                ].join(" ")}
            >
                <div
                    className={[
                        "group overflow-hidden rounded-[2rem]",
                        "border border-beige/70 bg-white/70",
                        "shadow-[0_18px_60px_rgba(114,94,73,0.08)]",
                        "transition duration-300",
                        "hover:-translate-y-1",
                        "hover:shadow-[0_25px_70px_rgba(114,94,73,0.13)]",
                    ].join(" ")}
                >
                    {memory.imageUrl && (
                        <div className="overflow-hidden">
                            <img
                                src={memory.imageUrl}
                                alt={memory.title}
                                className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                            />
                        </div>
                    )}

                    <div className="p-6 sm:p-8">
                        <div
                            className={[
                                "inline-flex rounded-full border px-3 py-1",
                                "text-[11px] font-semibold uppercase tracking-[0.18em]",
                                typeStyle,
                            ].join(" ")}
                        >
                            {typeLabel}
                        </div>

                        <p className="mt-4 text-xs font-medium uppercase tracking-widest text-brown-300">
                            {formatDate(memory.happenedAt)}
                        </p>

                        <h3 className="mt-3 font-display text-2xl leading-tight text-brown-900 sm:text-3xl">
                            {memory.title}
                        </h3>

                        {memory.description && (
                            <p className="mt-5 text-sm leading-7 text-brown-500 sm:text-base">
                                {memory.description}
                            </p>
                        )}

                        <div
                            className={[
                                "mt-7 flex items-center gap-2",
                                left
                                    ? "sm:justify-end"
                                    : "sm:justify-start",
                            ].join(" ")}
                        >
                            <span className="h-px w-8 bg-beige" />

                            <span className="font-display text-lg text-peach-300">
                                ♡
                            </span>

                            <span className="h-px w-8 bg-beige" />
                        </div>

                        <MemoryEngagement
                            memoryId={memory.id}
                            reactions={memory.reactions}
                            comments={memory.comments}
                        />
                    </div>
                </div>
            </div>
        </article>
    );
}