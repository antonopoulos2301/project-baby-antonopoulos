export function EmptyState() {
    return (
        <div className="mx-auto max-w-xl rounded-[2rem] border border-dashed border-beige bg-cream/50 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-100 font-display text-2xl text-sage-500">
                ♡
            </div>

            <h3 className="mt-6 font-display text-3xl text-brown-900">
                Nossa história está começando
            </h3>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-brown-500">
                Em breve, nossas primeiras memórias
                aparecerão aqui.
            </p>
        </div>
    );
}