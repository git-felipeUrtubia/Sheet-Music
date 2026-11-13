// app/page.tsx
"use client"

import SettingsModal from "@/components/settings/SettingsModal";
import Link from "next/link";
import React, { useState } from "react";

export default function HomePage() {

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);


  return (
    <main className="min-h-screen bg-[#0A1128] text-[#E2E8F0] flex flex-col justify-between p-6 md:p-12 select-none">
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      {/* Barra superior: Donaciones y Configuración */}
      <header className="w-full max-w-5xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-8 bg-blue-500 rounded-full" />
          <span className="text-xl font-bold tracking-wider uppercase text-[#F1F5F9]">
            SheetMusic
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Botón de Donaciones */}
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#162247] hover:bg-[#1E2E5C] border border-blue-900/60 text-sm font-medium text-[#E2E8F0] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>☕</span>
            <span>Apoyar proyecto</span>
          </button>

          {/* Botón de Configuración (Engranaje) */}
          <button
            type="button"
            aria-label="Configuración"
            className="p-2.5 rounded-lg bg-[#162247] hover:bg-[#1E2E5C] border border-blue-900/60 text-[#E2E8F0] transition-all duration-200 hover:rotate-45 active:scale-95 cursor-pointer"
            onClick={() => setIsSettingsOpen(true)}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Contenedor Central: Título y Opciones del Menú */}
      <section className="w-full max-w-4xl mx-auto my-auto py-12 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#F1F5F9] mb-4">
          Entrena tu Lectura Musical
        </h1>
        <p className="text-base md:text-lg text-[#94A3B8] max-w-xl mb-12">
          Selecciona un modo para explorar el repertorio de partituras o practicar lectura a primera vista en tiempo real.
        </p>

        {/* Grid de Opciones Principales */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Opción 1: Ver Partituras */}
          <Link
            href="/sheet_music"
            className="group relative flex flex-col items-start text-left p-8 rounded-2xl bg-[#111C3D] hover:bg-[#172652] border-2 border-blue-900/50 hover:border-blue-400/80 transition-all duration-300 hover:-translate-y-1 shadow-xl cursor-pointer"
          >
            <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2 group-hover:text-blue-300 transition-colors">
              Ver Partituras
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
              Explora la biblioteca de obras para piano, violín y flauta filtradas por nivel de dificultad.
            </p>
            <span className="mt-auto inline-flex items-center text-sm font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
              Explorar catálogo →
            </span>
          </Link>

          {/* Opción 2: Ejercicios */}
          <Link
            href="/exercises"
            className="group relative flex flex-col items-start text-left p-8 rounded-2xl bg-[#111C3D] hover:bg-[#172652] border-2 border-blue-900/50 hover:border-blue-400/80 transition-all duration-300 hover:-translate-y-1 shadow-xl cursor-pointer"
          >
            <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2 group-hover:text-blue-300 transition-colors">
              Ejercicios Interactivos
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
              Practica lectura de compases por nivel con detección de notas en tiempo real para avanzar.
            </p>
            <span className="mt-auto inline-flex items-center text-sm font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
              Comenzar práctica →
            </span>
          </Link>

          {/* Tarjeta 1: Aprender desde Cero (Paso previo recomendado) */}
          <Link
            href="/learn"
            className="group relative flex flex-col justify-between p-6 md:p-8 rounded-2xl bg-[#111C3D] border-2 border-blue-900/60 hover:border-emerald-400/80 hover:bg-[#162247] shadow-2xl transition-all duration-200 cursor-pointer"
          >
            <div>
              {/* Badge superior e ícono */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#0A1128] border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  🎓
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                  Paso 1 • Desde Cero
                </span>
              </div>

              {/* Título y Descripción */}
              <h2 className="text-xl font-extrabold text-[#F1F5F9] group-hover:text-emerald-300 transition-colors">
                Aprender a Leer Partituras
              </h2>
              <p className="text-xs md:text-sm text-[#94A3B8] mt-2 leading-relaxed">
                Domina el pentagrama, los tiempos, los silencios y los símbolos básicos con ejemplos sonoros antes de pasar a la práctica.
              </p>
            </div>

            {/* Call to action inferior */}
            <div className="mt-6 pt-4 border-t border-blue-900/40 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Iniciar guía interactiva</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

        </div>
      </section>

      {/* Pie de página simple */}
      <footer className="w-full max-w-5xl mx-auto text-center text-xs text-[#64748B]">
        Hecho para la comunidad de músicos • Proyecto gratuito y abierto
      </footer>

    </main>
  );
}