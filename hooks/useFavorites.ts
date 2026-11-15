"use client";

import { useCallback, useEffect, useState } from "react";
import { getFavorites, toggleFavorite } from "@/lib/sheetData";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const toggle = useCallback((scoreId: string) => {
    setFavorites(toggleFavorite(scoreId));
  }, []);

  return {
    favorites,
    toggleFavorite: toggle,
    isFavorite: (scoreId: string) => favorites.includes(scoreId),
  };
}
