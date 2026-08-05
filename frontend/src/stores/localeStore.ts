import { create } from 'zustand'
import type { Locale } from '../i18n'

const saved = localStorage.getItem('tripflow-language')
const initialLocale: Locale = saved === 'en' || saved === 'ja' || saved === 'zh' ? saved : 'ko'

export const useLocaleStore = create<{
  locale: Locale
  setLocale: (locale: Locale) => void
}>((set) => ({
  locale: initialLocale,
  setLocale: (locale) => {
    localStorage.setItem('tripflow-language', locale)
    document.documentElement.lang = locale
    set({ locale })
  },
}))
