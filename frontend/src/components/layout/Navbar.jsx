// frontend/src/components/layout/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { LogOut, Home, Globe, Menu, X, MessageSquare, User, Settings, ChevronDown, Check, Moon, Sun, Wallet } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { language, changeLanguage, t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const isHomePage = location.pathname === '/'
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [darkMode, setDarkMode] = useState(false)

  // Check dark mode on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    applyTheme(savedDarkMode)
  }, [])

  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
      document.body.style.backgroundColor = '#111827'
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
      document.body.style.backgroundColor = '#f3f4f6'
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode)
    applyTheme(newDarkMode)
  }

  // Fetch unread messages count
  useEffect(() => {
    if (!user) return
    const fetchUnread = async () => {
      try {
        const res = await api.get('/messages/unread')
        setUnreadMessages(res.data.count)
      } catch (err) {
        console.error('Error fetching unread messages:', err)
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 15000)
    return () => clearInterval(interval)
  }, [user])

  const languages = [
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'kinyarwanda', flag: '🇷🇼', label: 'Ikinyarwanda' },
    { code: 'french', flag: '🇫🇷', label: 'Français' },
  ]

  const getCurrentLanguageName = () => {
    const lang = languages.find(l => l.code === language)
    return lang ? `${lang.flag} ${lang.label}` : '🌐 Language'
  }

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode)
    setShowLanguageMenu(false)
  }

  const getUserInitials = () => {
    if (!user?.full_name) return 'U'
    return user.full_name.charAt(0).toUpperCase()
  }

  // Get navigation items based on user role
  const getNavItems = () => {
    if (!user) return []
    
    switch (user.role) {
      case 'admin':
        return [
          { name: t('nav.dashboard'), path: '/admin/dashboard', icon: '📊' },
          { name: t('nav.users'), path: '/admin/users', icon: '👥' },
          { name: t('nav.properties'), path: '/admin/properties', icon: '🏠' },
          { name: t('nav.reports'), path: '/admin/reports', icon: '📈' },
          { name: t('nav.settings'), path: '/admin/settings', icon: '⚙️' },
        ]
      case 'landlord':
        return [
          { name: t('nav.dashboard'), path: '/landlord/dashboard', icon: '📊' },
          { name: t('nav.properties'), path: '/landlord/properties', icon: '🏠' },
          { name: t('nav.rentals'), path: '/landlord/rentals', icon: '📄' },
          { name: t('nav.tenants'), path: '/landlord/tenants', icon: '👥' },
          { name: t('nav.payments'), path: '/landlord/payments', icon: '💰' },
          { name: 'Wallet', path: '/landlord/wallet', icon: '💰' },
        ]
      case 'renter':
        return [
          { name: t('home.search_properties'), path: '/search', icon: '🔍' },
          { name: t('nav.requests'), path: '/my-requests', icon: '📨' },
          { name: t('nav.rentals'), path: '/my-rentals', icon: '📄' },
          { name: t('nav.invoices'), path: '/my-invoices', icon: '🧾' },
          { name: t('nav.messages'), path: '/messages', icon: '💬' },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    const handleClickOutside = () => {
      setShowProfileMenu(false)
    }
    if (showProfileMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showProfileMenu])

  // Navbar classes based on dark mode
  const navbarBgClass = darkMode 
    ? 'bg-gray-900 border-gray-800' 
    : 'bg-gradient-to-r from-blue-900 to-black border-blue-800'
  
  const buttonBgClass = darkMode
    ? 'bg-gray-800 hover:bg-gray-700 border-gray-700'
    : 'bg-blue-800 hover:bg-blue-700 border-blue-700'
  
  const textColorClass = darkMode ? 'text-gray-200' : 'text-white'
  const hoverBgClass = darkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-800'
  const activeBgClass = darkMode ? 'bg-gray-700' : 'bg-blue-600'

  if (!user && !isHomePage) {
    return (
      <nav className={`shadow-lg border-b ${navbarBgClass}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className={`text-xl font-bold ${textColorClass}`}>
            {t('common.app_name')}
          </Link>
          
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
              }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${buttonBgClass} ${textColorClass}`}
              >
                <Globe size={18} />
                <span className="hidden sm:inline">{getCurrentLanguageName()}</span>
              </button>
              
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${
                        language === lang.code ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                      {language === lang.code && <Check size={16} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4">
            <Link to="/login" className={`${textColorClass} hover:text-blue-200`}>
              {t('common.login')}
            </Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500">
              {t('common.register')}
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  if (!user) return null

  return (
    <nav className={`shadow-lg border-b sticky top-0 z-50 ${navbarBgClass}`}>
      <div className="px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className={`text-xl font-bold ${textColorClass}`}>
              {t('common.app_name')}
            </Link>
            
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? `${activeBgClass} ${textColorClass}`
                      : `${textColorClass} ${hoverBgClass}`
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {/* Messages Link with Unread Badge */}
              <Link
                to="/messages"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors relative ${
                  location.pathname === '/messages'
                    ? `${activeBgClass} ${textColorClass}`
                    : `${textColorClass} ${hoverBgClass}`
                }`}
              >
                <MessageSquare size={18} />
                <span>{t('common.messages')}</span>
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
              }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${buttonBgClass} ${textColorClass}`}
              >
                <Globe size={18} />
                <span className="hidden sm:inline">{getCurrentLanguageName()}</span>
              </button>
              
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${
                        language === lang.code ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                      {language === lang.code && <Check size={16} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowProfileMenu(!showProfileMenu)
                }}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {getUserInitials()}
                </div>
                <ChevronDown size={16} className={textColorClass} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">{user?.full_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 capitalize mt-1">{user?.role}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <User size={16} />
                    {t('nav.profile')}
                  </Link>
                  
                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings size={16} />
                    {t('nav.settings')}
                  </Link>

                  {user?.role === 'landlord' && (
                    <Link
                      to="/landlord/wallet"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Wallet size={16} />
                      Wallet
                    </Link>
                  )}

                  <div className="border-t dark:border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors w-full text-left"
                    >
                      <LogOut size={16} />
                      {t('common.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`lg:hidden p-2 rounded-lg ${hoverBgClass} ${textColorClass}`}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Links */}
        {showMobileMenu && (
          <div className={`lg:hidden mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-blue-800'}`}>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? `${activeBgClass} ${textColorClass}`
                      : `${textColorClass} ${hoverBgClass}`
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Messages Link in Mobile Menu */}
              <Link
                to="/messages"
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors relative ${
                  location.pathname === '/messages'
                    ? `${activeBgClass} ${textColorClass}`
                    : `${textColorClass} ${hoverBgClass}`
                }`}
              >
                <MessageSquare size={18} />
                <span>{t('common.messages')}</span>
                {unreadMessages > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </Link>

              <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-blue-700'} mt-2 pt-2`}>
                <Link
                  to="/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg ${textColorClass} ${hoverBgClass}`}
                >
                  <User size={18} />
                  {t('nav.profile')}
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg ${textColorClass} ${hoverBgClass}`}
                >
                  <Settings size={18} />
                  {t('nav.settings')}
                </Link>
                {user?.role === 'landlord' && (
                  <Link
                    to="/landlord/wallet"
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg ${textColorClass} ${hoverBgClass}`}
                  >
                    <Wallet size={18} />
                    Wallet
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-red-300 ${hoverBgClass} w-full text-left`}
                >
                  <LogOut size={18} />
                  {t('common.logout')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}