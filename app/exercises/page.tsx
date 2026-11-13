"use client";

import { useState } from "react";
import DifficultySelector from "@/components/exercises/DifficultySelector";
import Link from "next/link";
import ExerciseArena from "@/components/exercises/ExerciseArena";
import { DifficultyLevel } from "@/types/exercise";

export default function ExercisesPage() {

    const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | null>(null);

    console.log(selectedLevel)
    return (
        <main className="min-h-screen bg-[#0A1128] text-[#E2E8F0] p-6 md:p-12 flex flex-col select-none">
            <div className="max-w-4xl mx-auto w-full my-auto">

                {/* Navegación superior de la sección */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
                    >
                        <span>←</span>
                        <span>Volver al menú</span>
                    </Link>
                </div>

                {selectedLevel == null ? (
                    <DifficultySelector selectedLevel={setSelectedLevel}/>
                ) : (
                    <ExerciseArena onBack={setSelectedLevel} level={selectedLevel}/>
                )}

            </div>
        </main>
    );
}