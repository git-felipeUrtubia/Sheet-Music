"use client";

import { useEffect, useState } from "react";
import { SHEET_MUSIC_CATALOG } from "@/data/catalog";
import { getCatalog } from "@/lib/sheetData";
import type { SheetMusicItem } from "@/types/catalog";

export function useCatalog() {
  const [catalog, setCatalog] = useState<SheetMusicItem[]>(SHEET_MUSIC_CATALOG);

  useEffect(() => {
    let active = true;
    getCatalog()
      .then((rows) => {
        if (active && rows.length > 0) setCatalog(rows);
      })
      .catch((error) => {
        console.error("No se pudo cargar el catálogo:", error);
      });
    return () => {
      active = false;
    };
  }, []);

  // console.log(catalog)

  return catalog;
}
