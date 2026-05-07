// frontend/src/components/layout/Navbar.jsx
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { LogOut, User, Bell, Home, Globe } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { language, changeLanguage, t } = useLanguage()
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'kinyarwanda', name: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'french', name: 'Français', flag: '🇫🇷' },
  ]

  const getCurrentLanguageName = () => {
    const lang = languages.find(l => l.code === language)
    return lang ? `${lang.flag} ${lang.name}` : '🌐 Language'
  }

  if (!user && !isHomePage) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">
            {t('common.app_name')}
          </Link>
          
          {/* Language Selector for non-logged in users */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Globe size={18} />
              <span className="hidden sm:inline">{getCurrentLanguageName()}</span>
            </button>
            
            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code)
                      setShowLanguageMenu(false)
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 ${
                      language === lang.code ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                    {language === lang.code && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <Link to="/login" className="text-gray-600 hover:text-blue-600">
              {t('common.login')}
            </Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              {t('common.register')}
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  if (!user) return null

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-blue-600">
            {t('common.app_name')}
          </Link>
          <Link to="/" className="text-gray-600 hover:text-blue-600 flex items-center gap-1">
            <Home size={18} />
            <span>{t('home.title')}</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Language Selector for logged in users */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Globe size={18} />
              <span className="hidden sm:inline">{getCurrentLanguageName()}</span>
            </button>
            
            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code)
                      setShowLanguageMenu(false)
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 ${
                      language === lang.code ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                    {language === lang.code && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{user?.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}