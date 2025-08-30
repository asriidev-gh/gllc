'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores'
import { Header } from '@/components/Header'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading } = useAuthStore()
  const { t } = useLanguage()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated) {
      // Check if there's a redirect URL in the query params
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get('redirect')
      if (redirect) {
        router.push(redirect)
      } else {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error(t('auth.login.error.fillFields'))
      return
    }

    try {
      await login(email, password)
      
      // Check if there's a redirect URL
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get('redirect')
      
      if (redirect) {
        router.push(redirect)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Login failed:', error)
      toast.error(t('auth.login.error.failed'))
    }
  }

  const handleDemoLogin = async () => {
    try {
      await login('student@example.com', 'demo123')
      
      // Check if there's a redirect URL
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get('redirect')
      
      if (redirect) {
        router.push(redirect)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Demo login failed:', error)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="absolute top-24 left-4 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('auth.login.backToHome')}</span>
            </Button>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.login.title')}</h2>
            <p className="text-gray-600">{t('auth.login.subtitle')}</p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.login.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.login.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('ui.loading') : t('auth.login.submit')}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleDemoLogin}
                className="w-full"
                disabled={isLoading}
              >
                {t('auth.login.demo')}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/signup')}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  )
}
