'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Globe, 
  User, 
  LogIn, 
  Menu, 
  X,
  BookOpen,
  Trophy,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import SignupForm from './SignupForm'
import { LoginForm } from './LoginForm'
import { useAuthStore } from '@/stores'

export function Header() {
  const { isAuthenticated, user, logout, createDemoUser } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showSignupForm, setShowSignupForm] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const pathname = usePathname()
  
  // Check if we're on the dashboard page
  const isOnDashboard = pathname === '/dashboard'

  // Check if we're on any user workspace page (dashboard, profile, settings, achievements, course learning)
  const isOnUserWorkspace = ['/dashboard', '/profile', '/settings', '/achievements', '/assessment'].includes(pathname) || pathname.startsWith('/courses/')

  const handleLogout = () => {
    logout()
  }

  const handleDemoUser = () => {
    createDemoUser()
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-[9999]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Globe className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">
                Global Language Training Center
              </span>
            </Link>

            {/* Desktop Navigation - Only show when NOT on user workspace pages */}
            {!isOnUserWorkspace && (
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
                <Link href="/courses" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Courses
                </Link>
                <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                  About
                </Link>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Contact
                </Link>
              </nav>
            )}

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Demo/Debug buttons - Only show when not authenticated */}
              {!isAuthenticated && (
                <>
                  {/* Demo Button */}
                  <button
                    onClick={handleDemoUser}
                    className="text-xs px-2 py-1 bg-green-200 text-green-600 rounded hover:bg-green-300"
                  >
                    Try Demo
                  </button>
                  
                  {/* Debug Button - Remove in production */}
                  <button
                    onClick={() => {
                      console.log('=== DEBUG: AUTH STATE ===')
                      console.log('isAuthenticated:', isAuthenticated)
                      console.log('user:', user)
                      console.log('localStorage auth_token:', localStorage.getItem('auth_token'))
                      console.log('localStorage user_data:', localStorage.getItem('user_data'))
                      console.log('=== DEBUG END ===')
                    }}
                    className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                  >
                    Debug Auth
                  </button>
                  
                  {/* Test Auth Page Link */}
                  <Link 
                    href="/test-auth"
                    className="text-xs px-2 py-1 bg-blue-200 text-blue-600 rounded hover:bg-blue-300"
                  >
                    Test Auth Page
                  </Link>
                </>
              )}
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Dashboard button - Show when on user workspace pages (profile, settings, achievements) */}
                  {isOnUserWorkspace && pathname !== '/dashboard' && (
                    <Link href="/dashboard">
                      <Button variant="outline" className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Button>
                    </Link>
                  )}
                  
                  {/* Dashboard button - Show when NOT on user workspace pages */}
                  {!isOnUserWorkspace && (
                    <Link href="/dashboard">
                      <Button variant="outline" className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Button>
                    </Link>
                  )}
                  <div className="relative group">
                    <Button variant="outline" className="flex items-center space-x-2">
                      {user?.avatar ? (
                        user.avatar.startsWith('http') ? (
                          // Dicebear or external URL
                          <img
                            src={user.avatar}
                            alt="Profile avatar"
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          // Emoji avatar
                          <span className="text-lg">{user.avatar}</span>
                        )
                      ) : (
                        // Default user icon
                        <User className="w-4 h-4" />
                      )}
                      <span>{user?.name?.split(' ')[0] || 'User'}</span>
                    </Button>
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-1">
                        <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Link>
                        <Link href="/achievements" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Trophy className="w-4 h-4 mr-2" />
                          Achievements
                        </Link>
                        <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowLoginForm(true)}
                    className="flex items-center space-x-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Button>
                  <Button
                    onClick={() => setShowSignupForm(true)}
                    className="flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation - Show on all pages but with different content */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              {/* Main Navigation - Only show when NOT on user workspace pages */}
              {!isOnUserWorkspace && (
                <nav className="space-y-2">
                  <Link href="/" className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                    Home
                  </Link>
                  <Link href="/courses" className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                    Courses
                  </Link>
                  <Link href="/about" className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                    About
                  </Link>
                  <Link href="/contact" className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                    Contact
                  </Link>
                </nav>
              )}
              
              {/* User Workspace Navigation - Show when on user workspace pages */}
              {isOnUserWorkspace && (
                <nav className="space-y-2">
                  <Link href="/dashboard" className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Dashboard
                  </Link>
                  <Link href="/profile" className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                    <User className="w-4 h-4 inline mr-2" />
                    Profile
                  </Link>
                  <Link href="/achievements" className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                    <Trophy className="w-4 h-4 inline mr-2" />
                    Achievements
                  </Link>
                  <Link href="/settings" className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                    <Settings className="w-4 h-4 inline mr-2" />
                    Settings
                  </Link>
                </nav>
              )}
              
              <div className="px-4 pt-4 border-t border-gray-200">
                {/* Demo/Debug buttons - Only show when not authenticated */}
                {!isAuthenticated && (
                  <>
                    {/* Demo Button */}
                    <button
                      onClick={handleDemoUser}
                      className="w-full text-center text-xs px-2 py-1 bg-green-200 text-green-600 rounded hover:bg-green-300 mb-2"
                    >
                      Try Demo
                    </button>
                    
                    {/* Debug Button - Remove in production */}
                    <button
                      onClick={() => {
                        console.log('=== DEBUG: AUTH STATE (MOBILE) ===')
                        console.log('isAuthenticated:', isAuthenticated)
                        console.log('user:', user)
                        console.log('localStorage auth_token:', localStorage.getItem('auth_token'))
                        console.log('localStorage user_data:', localStorage.getItem('user_data'))
                        console.log('=== DEBUG END ===')
                      }}
                      className="w-full text-xs px-2 py-1 bg-gray-200 text-gray-300 mb-2"
                    >
                      Debug Auth
                    </button>
                    
                    {/* Test Auth Page Link */}
                    <Link 
                      href="/test-auth"
                      className="block w-full text-center text-xs px-2 py-1 bg-blue-200 text-blue-600 rounded hover:bg-blue-300 mb-2"
                    >
                      Test Auth Page
                    </Link>
                  </>
                )}
                
                {isAuthenticated ? (
                  <div className="space-y-2">
                    {/* Dashboard button - Only show when NOT on user workspace pages */}
                    {!isOnUserWorkspace && (
                      <Link href="/dashboard" className="block w-full text-left px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowLoginForm(true)}
                      className="w-full justify-center"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => setShowSignupForm(true)}
                      className="w-full justify-center"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Auth Modals */}
      {showSignupForm && (
        <SignupForm />
      )}

      {showLoginForm && (
        <LoginForm
          onClose={() => setShowLoginForm(false)}
          onSwitchToSignup={() => {
            setShowLoginForm(false)
            setShowSignupForm(true)
          }}
        />
      )}
    </>
  )
}
