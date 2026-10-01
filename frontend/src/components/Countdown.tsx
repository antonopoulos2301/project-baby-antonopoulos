import { useEffect, useState } from "react";

// 🎯 Data-alvo: chegada do bebê.
// Para mudar, altere só esta linha. Formato: new Date(ano, mês-1, dia).
// (mês começa em 0, então abril = 3). Ex.: 06/04/2026 -> new Date(2026, 3, 6).
const TARGET_DATE = new Date(2026, 3, 6, 0, 0, 0);

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function calc(): TimeLeft {
  const diff = TARGET_DATE.getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    done: false,
  };
}

export function Countdown() {
  const [time, setTime] = useState<TimeLeft>(() => calc());

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  if (time.done) {
    return (
      <div className="mt-9">
        <div className="mx-auto max-w-md rounded-3xl border border-sage-300 bg-sage-100/70 px-6 py-6">
          <p className="font-display text-2xl text-brown-900 sm:text-3xl">
            O grande dia chegou! ♡
          </p>
          <p className="mt-2 text-sm text-brown-500">
            Bem-vindo(a) ao mundo.
          </p>
        </div>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  const items = [
    { label: "dias", value: String(time.days) },
    { label: "horas", value: pad(time.hours) },
    { label: "min", value: pad(time.minutes) },
    { label: "seg", value: pad(time.seconds) },
  ];

  return (
    <div className="mt-9">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-peach-500">
        Contagem para a chegada
      </p>

      <div className="flex items-stretch justify-center gap-2.5 sm:gap-4">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex min-w-[62px] flex-col items-center rounded-2xl border border-beige bg-white/70 px-2.5 py-3 sm:min-w-[82px] sm:px-5 sm:py-4"
          >
            <span className="font-display text-3xl tabular-nums text-brown-900 sm:text-4xl">
              {it.value}
            </span>
            <span className="mt-1 text-[0.6rem] uppercase tracking-wider text-brown-500 sm:text-xs">
              {it.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
