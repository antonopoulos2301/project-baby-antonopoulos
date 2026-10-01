import { useEffect, useState } from "react";

type Team = "FILIPE" | "MELINA";

interface PollResults {
  filipe: number;
  melina: number;
  total: number;
  votes: { name: string; team: Team }[];
}

export function Poll() {
  const [results, setResults] = useState<PollResults | null>(null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Team | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadResults() {
    try {
      const res = await fetch("/api/poll", { cache: "no-store" });
      if (res.ok) setResults(await res.json());
    } catch {
      // silencioso: apenas não atualiza o placar
    }
  }

  useEffect(() => {
    loadResults();
    const id = setInterval(loadResults, 20000);
    return () => clearInterval(id);
  }, []);

  async function handleVote() {
    setError(null);
    setSuccess(null);

    if (name.trim().length < 2) {
      setError("Digite seu nome para votar.");
      return;
    }
    if (!selected) {
      setError("Escolha um time: 💙 ou 💗");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), team: selected }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Não foi possível registrar seu voto.");
        return;
      }

      setResults(data as PollResults);
      setSuccess(
        `Voto de ${name.trim()} registrado! ${
          selected === "FILIPE" ? "💙" : "💗"
        }`,
      );
      setName("");
      setSelected(null);
    } catch {
      setError("Erro de conexão ao enviar seu voto.");
    } finally {
      setSending(false);
    }
  }

  const total = results?.total ?? 0;
  const filipe = results?.filipe ?? 0;
  const melina = results?.melina ?? 0;
  const filipePct = total > 0 ? Math.round((filipe / total) * 100) : 50;
  const melinaPct = total > 0 ? 100 - filipePct : 50;

  const namesOf = (team: Team) =>
    (results?.votes ?? []).filter((v) => v.team === team).map((v) => v.name);

  return (
    <section className="pt-16 sm:pt-24">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sage-700">
          Chá revelação · 03 de outubro
        </p>
        <h2 className="mt-3 font-display text-4xl text-brown-900 sm:text-5xl">
          Menino ou menina?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-brown-500 sm:text-base">
          Deixe seu palpite! Escolha um time e vote.
        </p>
      </div>

      {/* Cards dos times */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TeamCard
          title="Team Filipe"
          subtitle="Menino 💙"
          count={filipe}
          pct={filipePct}
          accent="sky"
          selected={selected === "FILIPE"}
          disabled={sending}
          onSelect={() => setSelected("FILIPE")}
          names={namesOf("FILIPE")}
        />
        <TeamCard
          title="Team Melina"
          subtitle="Menina 💗"
          count={melina}
          pct={melinaPct}
          accent="pink"
          selected={selected === "MELINA"}
          disabled={sending}
          onSelect={() => setSelected("MELINA")}
          names={namesOf("MELINA")}
        />
      </div>

      {/* Barra de proporção */}
      {total > 0 && (
        <div className="mt-8">
          <div className="flex h-5 w-full overflow-hidden rounded-full border border-beige bg-white/70">
            <div
              className="bg-sky-400 transition-all duration-500"
              style={{ width: `${filipePct}%` }}
            />
            <div
              className="bg-pink-400 transition-all duration-500"
              style={{ width: `${melinaPct}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs font-medium text-brown-500">
            <span>💙 {filipePct}%</span>
            <span>
              {total} {total === 1 ? "voto" : "votos"}
            </span>
            <span>{melinaPct}% 💗</span>
          </div>
        </div>
      )}

      {/* Formulário de voto */}
      <div className="mx-auto mt-8 max-w-md">
        <div className="rounded-3xl border border-cream bg-cream/40 p-5 sm:p-6">
          <label className="mb-1.5 block text-sm font-medium text-brown-700">
            Seu nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Como você quer ser identificado(a)"
            className="w-full rounded-2xl border border-beige bg-white/70 px-4 py-3 text-brown-900 outline-none transition focus:border-sage-500 focus:ring-2 focus:ring-sage-300/50"
          />

          {selected && (
            <p className="mt-3 text-center text-sm text-brown-500">
              Você escolheu:{" "}
              <strong>
                {selected === "FILIPE" ? "Team Filipe 💙" : "Team Melina 💗"}
              </strong>
            </p>
          )}

          <button
            onClick={handleVote}
            disabled={sending}
            className="mt-4 w-full rounded-full bg-brown-900 px-6 py-3.5 font-medium text-paper transition hover:bg-brown-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Enviando..." : "Confirmar meu voto ♡"}
          </button>

          {success && (
            <p className="mt-3 text-center text-sm text-sage-700">{success}</p>
          )}
          {error && (
            <p className="mt-3 text-center text-sm text-peach-500">{error}</p>
          )}
        </div>
      </div>
    </section>
  );
}

interface TeamCardProps {
  title: string;
  subtitle: string;
  count: number;
  pct: number;
  accent: "sky" | "pink";
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  names: string[];
}

function TeamCard({
  title,
  subtitle,
  count,
  pct,
  accent,
  selected,
  disabled,
  onSelect,
  names,
}: TeamCardProps) {
  const isSky = accent === "sky";

  const ring = selected
    ? isSky
      ? "border-sky-400 ring-2 ring-sky-300"
      : "border-pink-400 ring-2 ring-pink-300"
    : "border-beige";

  const bg = isSky ? "bg-sky-50/70" : "bg-pink-50/70";
  const bigText = isSky ? "text-sky-600" : "text-pink-500";

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`flex flex-col rounded-3xl border ${ring} ${bg} p-6 text-left transition hover:-translate-y-0.5 disabled:cursor-default disabled:hover:translate-y-0`}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-2xl text-brown-900">{title}</h3>
        <span className={`font-display text-3xl ${bigText}`}>{count}</span>
      </div>
      <p className="mt-1 text-sm text-brown-500">{subtitle}</p>

      <p className={`mt-3 text-xs font-semibold ${bigText}`}>{pct}%</p>

      {names.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {names.slice(0, 12).map((n, i) => (
            <span
              key={`${n}-${i}`}
              className="rounded-full bg-white/70 px-2.5 py-1 text-xs text-brown-500"
            >
              {n}
            </span>
          ))}
          {names.length > 12 && (
            <span className="px-1 py-1 text-xs text-brown-300">
              +{names.length - 12}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
