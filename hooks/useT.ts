"use client";

import { useEffect, useState } from "react";
import { translations, Lang } from "@/lib/i18n";

export function useT() {
  const [lang, setLang] = useState<Lang>("tr");

  useEffect(() => {
    // İlk yüklemede localStorage'dan oku
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && translations[saved]) setLang(saved);

    // Dil değişince güncelle (custom event)
    const handler = (e: Event) => {
      const newLang = (e as CustomEvent<Lang>).detail;
      if (translations[newLang]) setLang(newLang);
    };
    window.addEventListener("langChange", handler);
    return () => window.removeEventListener("langChange", handler);
  }, []);

  return translations[lang];
}
