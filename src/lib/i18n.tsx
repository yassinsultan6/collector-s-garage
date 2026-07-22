"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "../../locales/en.json";
import ar from "../../locales/ar.json";

type Lang = "en" | "ar";

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => unknown;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function getNested(obj: Record<string, unknown>, key: string): unknown {
  const parts = key.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (typeof cur === "object" && cur !== null && Object.prototype.hasOwnProperty.call(cur, part)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return cur;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("cg_lang") : null;
      if (saved === "ar") return "ar";
    } catch {
      /* ignore */
    }
    return "en";
  });

  useEffect(() => {
    try {
      localStorage.setItem("cg_lang", lang);
    } catch {}

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const translations = useMemo(() => ({ en, ar }) as Record<Lang, Record<string, unknown>>, []);

  const t = (key: string) => {
    const table = translations[lang];
    const value = getNested(table, key);
    if (value === undefined) return key;
    return value;
  };

  const setLang = (l: Lang) => setLangState(l);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used inside I18nProvider");
  return ctx;
}

export default I18nProvider;
