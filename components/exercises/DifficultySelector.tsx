import { DifficultyLevel } from "@/types/exercise";

interface DifficultySelectorProps {
  selectedLevel: (level: DifficultyLevel) => void;
}

export default function DifficultySelector({ selectedLevel }: DifficultySelectorProps) {
  const chooseLevel = (level: DifficultyLevel) => {
    selectedLevel(level);
  };

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="studio-rise mb-5 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-400">
          Sala de práctica
        </p>
        <h1 className="mt-3 font-display text-4xl text-rose-950 dark:text-pink-50 md:text-5xl">
          Selecciona el Nivel de Práctica
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-rose-900/65 dark:text-pink-100/60 md:text-base">
          Elige la complejidad de los compases para iniciar el reconocimiento de notas en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
        <button
          type="button"
          className="studio-rise group relative flex min-h-[280px] cursor-pointer flex-col justify-between overflow-hidden rounded-[2rem_2.6rem_1.6rem_2.2rem] border border-pink-200/80 bg-white/85 p-7 text-left shadow-xl shadow-pink-200/30 backdrop-blur-xl transition duration-300 hover:-translate-y-1 dark:border-pink-500/20 dark:bg-slate-900/80 lg:col-span-3 lg:row-span-2"
          onClick={() => chooseLevel("principiante")}
        >
          <span className="pointer-events-none absolute -right-2 bottom-0 font-display text-8xl text-emerald-200/80 dark:text-emerald-400/15">
            01
          </span>
          <div>
            <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              Nivel 1
            </span>
            <h2 className="mt-5 font-display text-5xl text-rose-950 dark:text-pink-50">Principiante</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-rose-900/65 dark:text-pink-100/60">
              Figuras redondas y blancas en compás de 4/4. Ideal para ubicar notas centrales sin presión de tiempo.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 transition group-hover:translate-x-1 dark:text-emerald-300">
            Iniciar nivel →
          </span>
        </button>

        <button
          type="button"
          className="studio-rise group relative flex min-h-[200px] cursor-pointer flex-col justify-between overflow-hidden rounded-[1.5rem_2rem_1.4rem_1.8rem] border border-pink-200/80 bg-[#FDF2F8]/90 p-6 text-left shadow-xl shadow-pink-200/25 backdrop-blur-xl transition duration-300 hover:-translate-y-1 dark:border-pink-500/20 dark:bg-slate-900/75 lg:col-span-3"
          style={{ animationDelay: "80ms" }}
          onClick={() => chooseLevel("intermedio")}
        >
          <span className="pointer-events-none absolute right-4 top-3 font-display text-6xl text-sky-200/90 dark:text-sky-400/15">
            02
          </span>
          <div>
            <span className="inline-block rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-200">
              Nivel 2
            </span>
            <h2 className="mt-4 font-display text-4xl text-rose-950 dark:text-pink-50">Intermedio</h2>
            <p className="mt-2 text-sm leading-relaxed text-rose-900/65 dark:text-pink-100/60">
              Negras, corcheas y alteraciones simples (sostenidos y bemoles) alternando posiciones.
            </p>
          </div>
          <span className="text-xs font-semibold text-sky-700 transition group-hover:translate-x-1 dark:text-sky-300">
            Iniciar nivel →
          </span>
        </button>

        <button
          type="button"
          className="studio-rise group relative flex min-h-[200px] cursor-pointer flex-col justify-between overflow-hidden rounded-[2rem_1.4rem_2.1rem_1.5rem] border border-transparent bg-gradient-to-br from-pink-400 to-rose-400 p-6 text-left text-rose-950 shadow-xl shadow-pink-300/40 transition duration-300 hover:-translate-y-1 lg:col-span-3"
          style={{ animationDelay: "140ms" }}
          onClick={() => chooseLevel("avanzado")}
        >
          <span className="pointer-events-none absolute right-4 top-2 font-display text-6xl text-rose-950/15">
            03
          </span>
          <div>
            <span className="inline-block rounded-full bg-rose-950/10 px-3 py-1 text-xs font-semibold">
              Nivel 3
            </span>
            <h2 className="mt-4 font-display text-4xl">Avanzado</h2>
            <p className="mt-2 text-sm leading-relaxed text-rose-950/80">
              Lectura rápida con saltos de octava, líneas adicionales y ritmos sincopados.
            </p>
          </div>
          <span className="text-xs font-semibold transition group-hover:translate-x-1">Iniciar nivel →</span>
        </button>
      </div>
    </section>
  );
}
