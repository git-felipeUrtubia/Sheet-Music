// components/exercises/DifficultySelector.tsx
import { DifficultyLevel } from "@/types/exercise";
import React from "react";


interface DifficultySelectorProps {
    selectedLevel: (level: DifficultyLevel) => void;
}

export default function DifficultySelector({ selectedLevel }: DifficultySelectorProps) {

    const chooseLevel = (level: DifficultyLevel) => {
        selectedLevel(level)
    }


    return (
        <section className="w-full max-w-4xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#F1F5F9] mb-2">
                    Selecciona el Nivel de Práctica
                </h1>
                <p className="text-sm md:text-base text-[#94A3B8]">
                    Elige la complejidad de los compases para iniciar el reconocimiento de notas en tiempo real.
                </p>
            </div>

            {/* Grid de Tarjetas de Nivel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Tarjeta: Principiante */}
                <button
                    type="button"
                    className="group flex flex-col justify-between text-left p-6 rounded-2xl bg-[#111C3D] hover:bg-[#172652] border-2 border-blue-900/50 hover:border-emerald-400/80 transition-all duration-200 hover:-translate-y-1 shadow-lg cursor-pointer"
                    onClick={() => chooseLevel("principiante")}
                >
                    <div>
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
                            Nivel 1
                        </span>
                        <h2 className="text-2xl font-bold text-[#F1F5F9] group-hover:text-emerald-300 transition-colors mb-2">
                            Principiante
                        </h2>
                        <p className="text-sm text-[#94A3B8] leading-relaxed">
                            Figuras redondas y blancas en compás de 4/4. Ideal para ubicar notas centrales sin presión de tiempo.
                        </p>
                    </div>
                    <span className="mt-8 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                        Iniciar nivel →
                    </span>
                </button>

                {/* Tarjeta: Intermedio */}
                <button
                    type="button"
                    className="group flex flex-col justify-between text-left p-6 rounded-2xl bg-[#111C3D] hover:bg-[#172652] border-2 border-blue-900/50 hover:border-blue-400/80 transition-all duration-200 hover:-translate-y-1 shadow-lg cursor-pointer"
                    onClick={() => chooseLevel("intermedio")}
                >
                    <div>
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
                            Nivel 2
                        </span>
                        <h2 className="text-2xl font-bold text-[#F1F5F9] group-hover:text-blue-300 transition-colors mb-2">
                            Intermedio
                        </h2>
                        <p className="text-sm text-[#94A3B8] leading-relaxed">
                            Negras, corcheas y alteraciones simples (sostenidos y bemoles) alternando posiciones.
                        </p>
                    </div>
                    <span className="mt-8 text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                        Iniciar nivel →
                    </span>
                </button>

                {/* Tarjeta: Avanzado */}
                <button
                    type="button"
                    className="group flex flex-col justify-between text-left p-6 rounded-2xl bg-[#111C3D] hover:bg-[#172652] border-2 border-blue-900/50 hover:border-purple-400/80 transition-all duration-200 hover:-translate-y-1 shadow-lg cursor-pointer"
                    onClick={() => chooseLevel("avanzado")}
                >
                    <div>
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
                            Nivel 3
                        </span>
                        <h2 className="text-2xl font-bold text-[#F1F5F9] group-hover:text-purple-300 transition-colors mb-2">
                            Avanzado
                        </h2>
                        <p className="text-sm text-[#94A3B8] leading-relaxed">
                            Lectura rápida con saltos de octava, líneas adicionales y ritmos sincopados.
                        </p>
                    </div>
                    <span className="mt-8 text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
                        Iniciar nivel →
                    </span>
                </button>

            </div>
        </section>
    );
}