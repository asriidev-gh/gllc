'use client'

import SignupForm from '@/components/SignupForm'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SignupPage() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('auth.signup.title')}</h1>
          <p className="text-gray-600 mt-2">{t('auth.signup.subtitle')}</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
