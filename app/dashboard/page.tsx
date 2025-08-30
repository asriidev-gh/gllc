'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dashboard } from '@/components/Dashboard'
import { Header } from '@/components/Header'
import { useAuthStore } from '@/stores'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthStore()
  const { t } = useLanguage()

  useEffect(() => {
    // Add a small delay to ensure authentication state is properly loaded
    const timer = setTimeout(() => {
      if (!isLoading && !isAuthenticated) {
        toast.error(t('dashboard.page.authError'))
        router.push('/')
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [isAuthenticated, isLoading, router, t])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('dashboard.page.loading')}</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Dashboard />
    </div>
  )
}
