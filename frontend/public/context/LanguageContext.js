// frontend/src/context/LanguageContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'

const LanguageContext = createContext()

// Translation dictionaries with actual words
const translations = {
  en: {
    // Common
    common_app_name: 'Smart Rental',
    common_login: 'Login',
    common_register: 'Register',
    common_logout: 'Logout',
    common_dashboard: 'Dashboard',
    common_profile: 'Profile',
    common_settings: 'Settings',
    common_messages: 'Messages',
    
    // Navigation - RENTER
    nav_search: 'Search',
    nav_requests: 'Requests',
    nav_rentals: 'Rentals',
    nav_invoices: 'Invoices',
    nav_reviews: 'Reviews',
    nav_activity: 'Activity',
    
    // Navigation - LANDLORD
    nav_properties: 'Properties',
    nav_tenants: 'Tenants',
    nav_payments: 'Payments',
    
    // Navigation - ADMIN
    nav_users: 'Users',
    nav_reports: 'Reports',
    nav_dashboard: 'Dashboard',
    
    // Home
    home_title: 'Home',
    home_welcome: 'Welcome back',
    
    // Messages
    messages_title: 'Messages',
    messages_unread: 'unread',
    
    // Buttons
    btn_save: 'Save',
    btn_cancel: 'Cancel',
    btn_delete: 'Delete',
    btn_edit: 'Edit',
    btn_view: 'View',
    btn_pay: 'Pay',
  },
  kinyarwanda: {
    // Common
    common_app_name: 'Smart Rental',
    common_login: 'Injira',
    common_register: 'Iyandikishe',
    common_logout: 'Sohora',
    common_dashboard: 'Urubuga',
    common_profile: 'Ibyerekeye',
    common_settings: 'Igenamiterere',
    common_messages: 'Ubutumwa',
    
    // Navigation - RENTER
    nav_search: 'Shakisha',
    nav_requests: 'Ibisabwa',
    nav_rentals: 'Ubukode',
    nav_invoices: 'Fagitire',
    nav_reviews: 'Ibisobanuro',
    nav_activity: 'Ibyakozwe',
    
    // Navigation - LANDLORD
    nav_properties: 'Amazu',
    nav_tenants: 'Abakode',
    nav_payments: 'Amafaranga',
    
    // Navigation - ADMIN
    nav_users: 'Abakoresha',
    nav_reports: 'Raporo',
    nav_dashboard: 'Urubuga',
    
    // Home
    home_title: 'Ahabanza',
    home_welcome: 'Murakaza neza',
    
    // Messages
    messages_title: 'Ubutumwa',
    messages_unread: 'bitasomwa',
    
    // Buttons
    btn_save: 'Bika',
    btn_cancel: 'Hagarika',
    btn_delete: 'Siba',
    btn_edit: 'Hindura',
    btn_view: 'Reba',
    btn_pay: 'Kwishyura',
  },
  french: {
    // Common
    common_app_name: 'Smart Rental',
    common_login: 'Connexion',
    common_register: "S'inscrire",
    common_logout: 'Déconnexion',
    common_dashboard: 'Tableau de bord',
    common_profile: 'Mon profil',
    common_settings: 'Paramètres',
    common_messages: 'Messages',
    
    // Navigation - RENTER
    nav_search: 'Rechercher',
    nav_requests: 'Demandes',
    nav_rentals: 'Locations',
    nav_invoices: 'Factures',
    nav_reviews: 'Avis',
    nav_activity: 'Activité',
    
    // Navigation - LANDLORD
    nav_properties: 'Propriétés',
    nav_tenants: 'Locataires',
    nav_payments: 'Paiements',
    
    // Navigation - ADMIN
    nav_users: 'Utilisateurs',
    nav_reports: 'Rapports',
    nav_dashboard: 'Tableau de bord',
    
    // Home
    home_title: 'Accueil',
    home_welcome: 'Bon retour',
    
    // Messages
    messages_title: 'Messages',
    messages_unread: 'non lu',
    
    // Buttons
    btn_save: 'Enregistrer',
    btn_cancel: 'Annuler',
    btn_delete: 'Supprimer',
    btn_edit: 'Modifier',
    btn_view: 'Voir',
    btn_pay: 'Payer',
  }
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language')
    return saved && (saved === 'en' || saved === 'kinyarwanda' || saved === 'french') ? saved : 'en'
  })

  const changeLanguage = (lang) => {
    if (lang === 'en' || lang === 'kinyarwanda' || lang === 'french') {
      setLanguage(lang)
      localStorage.setItem('language', lang)
    }
  }

  const t = (key) => {
    return translations[language]?.[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)