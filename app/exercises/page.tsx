"use client";

import { useState } from "react";
import DifficultySelector from "@/components/exercises/DifficultySelector";
import ExerciseArena from "@/components/exercises/ExerciseArena";
import { DifficultyLevel } from "@/types/exercise";

export default function ExercisesPage() {
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | null>(null);

  console.log(selectedLevel);
  return (
    <div className="mx-auto w-full max-w-6xl">
      {selectedLevel == null ? (
        <DifficultySelector selectedLevel={setSelectedLevel} />
      ) : (
        <ExerciseArena onBack={setSelectedLevel} level={selectedLevel} />
      )}
    </div>
  );
}
