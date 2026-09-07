export function Hero() {
    return (
        <header className="relative overflow-hidden border-b border-beige/60">
            <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-sage-100/70 blur-3xl" />

            <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-peach-100/80 blur-3xl" />

            <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
                <div className="relative overflow-hidden rounded-[2.5rem] border border-beige bg-paper/80 px-6 py-14 shadow-[0_25px_80px_rgba(114,94,73,0.08)] backdrop-blur sm:px-12 sm:py-20 lg:px-20">
                    <div className="pointer-events-none absolute inset-3 rounded-[2rem] border border-dashed border-beige/80" />

                    <span className="absolute left-7 top-6 text-3xl text-sage-500/60 sm:left-12 sm:text-4xl">
                        ❧
                    </span>

                    <span className="absolute right-8 top-7 rotate-180 text-3xl text-sage-500/60 sm:right-12 sm:text-4xl">
                        ❧
                    </span>

                    <div className="relative mx-auto max-w-3xl text-center">
                        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-sage-700 sm:text-sm">
                            Nossas memórias
                        </p>

                        <div className="mx-auto mb-7 flex items-center justify-center gap-3 text-sage-500">
                            <span className="h-px w-10 bg-sage-300 sm:w-16" />

                            <span className="font-display text-xl">
                                ♡
                            </span>

                            <span className="h-px w-10 bg-sage-300 sm:w-16" />
                        </div>

                        <h1 className="font-display text-4xl leading-[1.05] text-brown-900 sm:text-6xl lg:text-7xl">
                            Uma história feita
                            <span className="block italic text-sage-500">
                                para você
                            </span>
                        </h1>

                        <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-brown-500 sm:text-lg sm:leading-8">
                            Pequenos momentos que queremos guardar
                            para sempre, porque cada capítulo da sua
                            história é precioso para nós.
                        </p>

                        <div className="mt-8 flex justify-center">
                            <a
                                href="#guestbook-form"
                                className="inline-flex items-center justify-center rounded-full border border-sage-500 bg-sage-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(143,148,120,0.20)] transition duration-300 hover:-translate-y-0.5 hover:bg-sage-700 hover:shadow-[0_15px_35px_rgba(143,148,120,0.28)] focus:outline-none focus:ring-4 focus:ring-sage-100"
                            >
                                Deixe uma mensagem para o bebê
                                <span className="ml-2 text-base">
                                    ♡
                                </span>
                            </a>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-peach-300" />

                            <span className="text-lg text-peach-500">
                                ♡
                            </span>

                            <span className="h-1.5 w-1.5 rounded-full bg-peach-300" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}