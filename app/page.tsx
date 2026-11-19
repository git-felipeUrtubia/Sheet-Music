"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Music2 } from "lucide-react";
import SupportButton from "@/components/shell/SupportButton";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <section className="studio-rise relative overflow-hidden rounded-[2rem_2.8rem_1.6rem_2.2rem] border border-pink-200/80 bg-white/85 px-7 py-10 shadow-xl shadow-pink-200/30 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/80 dark:shadow-black/40 md:px-12 md:py-14">
        <span
          aria-hidden
          className="clef-float pointer-events-none absolute bottom-2 right-8 hidden font-display text-[9rem] leading-none text-pink-200/80 dark:text-pink-500/15 xl:block"
        >
          𝄞
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-400">
          Estudio musical
        </p>
        <h1 className="mt-4 max-w-xl font-display text-5xl leading-[0.98] text-rose-950 dark:text-pink-50 md:text-6xl">
          Entrena tu Lectura Musical
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-rose-900/70 dark:text-pink-100/65">
          Selecciona un modo para explorar el repertorio de partituras o practicar lectura a primera vista en tiempo real.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {["Piano", "Violín", "Flauta"].map((name) => (
            <span
              key={name}
              className="rounded-full border border-pink-200/80 bg-pink-50/80 px-3 py-1 text-xs font-semibold text-rose-800 dark:border-pink-500/25 dark:bg-pink-500/10 dark:text-pink-100"
            >
              {name}
            </span>
          ))}

          <SupportButton variant="sidebar" />

        </div>
      </section>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/sheet_music"
          className="studio-rise group flex h-full flex-col rounded-[1.7rem_2.4rem_1.5rem_2.2rem] border border-pink-200/80 bg-white/90 p-6 shadow-xl shadow-pink-200/30 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-300/40 dark:border-pink-500/20 dark:bg-slate-900/85 dark:shadow-black/40 lg:col-span-2 xl:col-span-1 md:p-7"
          style={{ animationDelay: "80ms" }}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-pink-100 text-rose-700 dark:bg-pink-500/15 dark:text-pink-200">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </span>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:bg-pink-500/15 dark:text-pink-200">
              Repertorio
            </span>
          </div>
          <h2 className="font-display text-3xl leading-tight text-rose-950 dark:text-pink-50 xl:min-h-[4.6rem]">
            Ver Partituras
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-rose-900/65 dark:text-pink-100/60">
            Explora la biblioteca de obras para piano, violín y flauta filtradas por nivel de dificultad.
          </p>
          <div className="mt-5 space-y-2 opacity-40" aria-hidden>
            {[0, 1, 2].map((line) => (
              <div key={line} className="h-px bg-rose-950/30 dark:bg-pink-100/40" />
            ))}
          </div>
          <span className="mt-auto inline-flex items-center pt-6 text-sm font-semibold text-rose-600 transition group-hover:translate-x-1 dark:text-pink-300">
            Explorar catálogo
            <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={1.75} />
          </span>
        </Link>

        <Link
          href="/learn"
          className="studio-rise group flex h-full flex-col rounded-[2.2rem_1.4rem_2rem_1.5rem] border border-pink-200/80 bg-[#FDF2F8]/90 p-6 shadow-xl shadow-pink-200/25 backdrop-blur-xl transition duration-300 hover:-translate-y-1 dark:border-pink-500/20 dark:bg-slate-900/75 md:p-7"
          style={{ animationDelay: "140ms" }}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-rose-700 shadow-sm dark:bg-slate-950/50 dark:text-pink-100">
              <GraduationCap className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-right text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              Paso 1 • Desde Cero
            </span>
          </div>
          <h2 className="font-display text-3xl leading-tight text-rose-950 dark:text-pink-50 xl:min-h-[4.6rem]">
            Aprender a Leer Partituras
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-rose-900/65 dark:text-pink-100/60">
            Domina el pentagrama, los tiempos, los silencios y los símbolos básicos con ejemplos sonoros antes de pasar a la práctica.
          </p>
          <span className="mt-auto inline-flex items-center pt-6 text-sm font-semibold text-emerald-700 transition group-hover:translate-x-1 dark:text-emerald-300">
            Iniciar guía interactiva
            <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={1.75} />
          </span>
        </Link>

        <Link
          href="/exercises"
          className="studio-rise group flex h-full flex-col rounded-[1.4rem_2.2rem_1.5rem_2rem] border border-transparent bg-gradient-to-br from-pink-400 to-rose-400 p-6 text-rose-950 shadow-xl shadow-pink-300/40 transition duration-300 hover:-translate-y-1 md:p-7"
          style={{ animationDelay: "200ms" }}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/40">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </span>
            <span className="rounded-full bg-rose-950/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
              En vivo
            </span>
          </div>
          <h2 className="font-display text-3xl leading-tight xl:min-h-[4.6rem]">Ejercicios Interactivos</h2>
          <p className="mt-3 text-sm leading-relaxed text-rose-950/80">
            Practica lectura de compases por nivel con detección de notas en tiempo real para avanzar.
          </p>
          <span className="mt-auto inline-flex items-center pt-6 text-sm font-semibold transition group-hover:translate-x-1">
            Comenzar práctica
            <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={1.75} />
          </span>
        </Link>

        <Link
          href="/scales"
          className="studio-rise group flex h-full flex-col rounded-[1.8rem_2rem_1.4rem_2.2rem] border border-pink-200/80 bg-white/90 p-6 shadow-xl shadow-pink-200/30 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-300/40 dark:border-pink-500/20 dark:bg-slate-900/85 dark:shadow-black/40 md:p-7 lg:col-span-2 xl:col-span-3"
          style={{ animationDelay: "260ms" }}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-pink-100 text-rose-700 dark:bg-pink-500/15 dark:text-pink-200">
              <Music2 className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:bg-pink-500/15 dark:text-pink-200">
              Hanon · Czerny
            </span>
          </div>
          <h2 className="font-display text-3xl leading-tight text-rose-950 dark:text-pink-50">
            Laboratorio de Escalas
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-rose-900/65 dark:text-pink-100/60">
            Mayores, menores, pentatónicas, blues y modos con digitación, pentagrama a dos claves y metrónomo de 40 a 180 BPM.
          </p>
          <span className="mt-auto inline-flex items-center pt-6 text-sm font-semibold text-rose-600 transition group-hover:translate-x-1 dark:text-pink-300">
            Abrir laboratorio
            <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={1.75} />
          </span>
        </Link>
      </div>

      <footer className="px-2 pb-2 pt-3 text-center text-xs text-rose-900/60 dark:text-pink-100/55">
        Hecho para la comunidad de músicos • Proyecto gratuito y abierto
      </footer>
    </div>
  );
}
