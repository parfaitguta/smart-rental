import { createContext, useContext, useEffect, useState } from 'react'
import en from '../locales/en.json'
import kinyarwanda from '../locales/kinyarwanda.json'
import french from '../locales/french.json'

const translations = {
  en,
  kinyarwanda,
  french,
}

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem('app_language')
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage)
    }
    setLoading(false)
  }, [])

  const changeLanguage = (newLanguage) => {
    if (!translations[newLanguage]) return
    setLanguage(newLanguage)
    window.localStorage.setItem('app_language', newLanguage)
  }

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }

    if (value !== undefined && value !== null) {
      return value
    }

    let fallback = translations.en
    for (const k of keys) {
      fallback = fallback?.[k]
      if (fallback === undefined) break
    }

    return fallback || key
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, loading }}>
      {children}
    </LanguageContext.Provider>
  )
}
