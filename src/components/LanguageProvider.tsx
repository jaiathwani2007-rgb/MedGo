'use client'

import React, { createContext, useContext, useState } from 'react'

type Language = 'en' | 'hi'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.cart': 'Cart',
    'nav.orders': 'Orders',
    'nav.profile': 'Profile',
    'login.title': 'Welcome to MedGo',
    'login.subtitle': 'Log in to order your medicines',
    'login.phone': 'Phone Number',
    'login.password': 'Password',
    'login.submit': 'Login',
    'login.no_account': 'Don\'t have an account?',
    'login.signup_link': 'Sign up',
    'signup.title': 'Create Account',
    'signup.subtitle': 'Join MedGo today',
    'signup.submit': 'Sign Up',
    'signup.has_account': 'Already have an account?',
    'signup.login_link': 'Log in',
    'onboarding.title': 'Complete Your Profile',
    'onboarding.subtitle': 'Just a few more details to get started',
    'onboarding.name': 'Full Name',
    'onboarding.age': 'Age',
    'onboarding.address': 'Delivery Address',
    'onboarding.language': 'Preferred Language',
    'onboarding.submit': 'Save Profile',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
  },
  hi: {
    'nav.home': 'होम',
    'nav.cart': 'कार्ट',
    'nav.orders': 'ऑर्डर',
    'nav.profile': 'प्रोफ़ाइल',
    'login.title': 'MedGo में आपका स्वागत है',
    'login.subtitle': 'अपनी दवाएं ऑर्डर करने के लिए लॉग इन करें',
    'login.phone': 'फ़ोन नंबर',
    'login.password': 'पासवर्ड',
    'login.submit': 'लॉग इन करें',
    'login.no_account': 'क्या आपके पास खाता नहीं है?',
    'login.signup_link': 'साइन अप करें',
    'signup.title': 'खाता बनाएं',
    'signup.subtitle': 'आज ही MedGo से जुड़ें',
    'signup.submit': 'साइन अप करें',
    'signup.has_account': 'क्या आपके पास पहले से खाता है?',
    'signup.login_link': 'लॉग इन करें',
    'onboarding.title': 'अपनी प्रोफ़ाइल पूरी करें',
    'onboarding.subtitle': 'शुरू करने के लिए कुछ और विवरण',
    'onboarding.name': 'पूरा नाम',
    'onboarding.age': 'उम्र',
    'onboarding.address': 'डिलीवरी का पता',
    'onboarding.language': 'पसंदीदा भाषा',
    'onboarding.submit': 'प्रोफ़ाइल सहेजें',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'एक त्रुटि हुई',
    'common.success': 'सफलता',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children, initialLanguage = 'en' }: { children: React.ReactNode, initialLanguage?: Language }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    document.cookie = `medgo_lang=${lang}; path=/; max-age=31536000`
  }

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['en']] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
