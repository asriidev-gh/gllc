'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, LogIn, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuthStore()
  
  console.log('=== PROTECTED ROUTE RENDER ===')
  console.log('isAuthenticated:', isAuthenticated)
  console.log('isLoading:', isLoading)
  console.log('user:', user)
  console.log('=== PROTECTED ROUTE RENDER END ===')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">
              You need to be logged in to access the dashboard.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/')}
              className="w-full py-3"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Go to Home
            </Button>
            
            <Button
              onClick={() => {
                console.log('=== DEBUG: LOCALSTORAGE CONTENTS ===')
                console.log('auth_token:', localStorage.getItem('auth_token'))
                console.log('user_data:', localStorage.getItem('user_data'))
                console.log('All localStorage keys:', Object.keys(localStorage))
                console.log('=== DEBUG END ===')
              }}
              variant="outline"
              className="w-full py-3"
            >
              Debug localStorage
            </Button>
            
            <Button
              onClick={() => {
                console.log('=== DEBUG: AUTH CONTEXT STATE ===')
                console.log('Current isAuthenticated:', isAuthenticated)
                console.log('Current user:', user)
                console.log('Current isLoading:', isLoading)
                console.log('=== DEBUG END ===')
              }}
              variant="outline"
              className="w-full py-3"
            >
              Debug Auth Context
            </Button>
            
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/')}
                className="text-primary-600 hover:text-primary-700 font-medium underline"
              >
                Sign up here
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}
