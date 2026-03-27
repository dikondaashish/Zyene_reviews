"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type SupportedLocale = "en" | "es" | "pt" | "fr" | "de" | "nl"

export interface LocaleConfig {
  code: SupportedLocale
  label: string
  /** Country flag emoji for display */
  flag: string
}

export const SUPPORTED_LOCALES: LocaleConfig[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
]

interface LanguageContextValue {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  currentLocaleConfig: LocaleConfig
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

const STORAGE_KEY = "zyene-locale"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>("en")

  // Load saved locale on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null
    if (saved && SUPPORTED_LOCALES.some((l) => l.code === saved)) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale)
    localStorage.setItem(STORAGE_KEY, newLocale)
    // Also set as cookie for potential server-side use
    document.cookie = `locale=${newLocale};path=/;max-age=31536000;SameSite=Lax`
  }

  const currentLocaleConfig = SUPPORTED_LOCALES.find((l) => l.code === locale) || SUPPORTED_LOCALES[0]

  return (
    <LanguageContext.Provider value={{ locale, setLocale, currentLocaleConfig }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return ctx
}
