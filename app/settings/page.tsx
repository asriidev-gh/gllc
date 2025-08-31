'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Bell, Shield, Palette, Globe, Lock, Key, User, Mail, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/Header'
import { useAuthStore } from '@/stores'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'
import { RoleSwitcher } from '@/components/RoleSwitcher'

// Settings interfaces
interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto'
  fontSize: 'small' | 'medium' | 'large'
  colorScheme: 'blue' | 'green' | 'purple' | 'orange'
  animationSpeed: 'fast' | 'normal' | 'slow'
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  courseUpdates: boolean
  securityAlerts: boolean
}

interface LanguageRegionSettings {
  language: string
  region: string
  timezone: string
  dateFormat: string
  timeFormat: string
  currency: string
}

export default function SettingsPage() {
  const { user, changePassword, logUserAction } = useAuthStore()
  const { t } = useLanguage()
  
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  
  // State for showing different settings sections
  const [activeSection, setActiveSection] = useState<string | null>(null)
  
  // Settings state
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'light',
    fontSize: 'medium',
    colorScheme: 'blue',
    animationSpeed: 'normal'
  })
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
    courseUpdates: true,
    securityAlerts: true
  })
  
  const [languageRegionSettings, setLanguageRegionSettings] = useState<LanguageRegionSettings>({
    language: 'English',
    region: 'United States',
    timezone: 'UTC-8',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    currency: 'USD'
  })

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedAppearance = localStorage.getItem('appearance-settings')
        const savedNotifications = localStorage.getItem('notification-settings')
        const savedLanguageRegion = localStorage.getItem('language-region-settings')
        
        if (savedAppearance) {
          setAppearanceSettings(JSON.parse(savedAppearance))
        }
        if (savedNotifications) {
          setNotificationSettings(JSON.parse(savedNotifications))
        }
        if (savedLanguageRegion) {
          setLanguageRegionSettings(JSON.parse(savedLanguageRegion))
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
    
    loadSettings()
  }, [])

  // Apply theme changes
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement
      
      // Remove existing theme classes
      root.classList.remove('theme-light', 'theme-dark')
      
      // Apply current theme
      if (appearanceSettings.theme === 'dark') {
        root.classList.add('theme-dark')
        document.body.classList.add('dark')
      } else if (appearanceSettings.theme === 'light') {
        root.classList.add('theme-light')
        document.body.classList.remove('dark')
      } else if (appearanceSettings.theme === 'auto') {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          root.classList.add('theme-dark')
          document.body.classList.add('dark')
        } else {
          root.classList.add('theme-light')
          document.body.classList.remove('dark')
        }
      }
    }
    
    applyTheme()
    
    // Listen for system theme changes when auto is selected
    if (appearanceSettings.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme()
      mediaQuery.addEventListener('change', handleChange)
      
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [appearanceSettings.theme])

  // Apply font size changes
  useEffect(() => {
    const root = document.documentElement
    root.style.fontSize = appearanceSettings.fontSize === 'small' ? '14px' : 
                          appearanceSettings.fontSize === 'large' ? '18px' : '16px'
  }, [appearanceSettings.fontSize])

  // Apply color scheme changes
  useEffect(() => {
    const root = document.documentElement
    
    // Remove existing color scheme classes
    root.classList.remove('color-scheme-blue', 'color-scheme-green', 'color-scheme-purple', 'color-scheme-orange')
    
    // Add current color scheme class
    root.classList.add(`color-scheme-${appearanceSettings.colorScheme}`)
    
    // Also set CSS custom property for immediate use
    root.style.setProperty('--primary-color', getColorSchemeValue(appearanceSettings.colorScheme))
  }, [appearanceSettings.colorScheme])

  const getColorSchemeValue = (scheme: string) => {
    switch (scheme) {
      case 'green': return '#10B981'
      case 'purple': return '#8B5CF6'
      case 'orange': return '#F59E0B'
      default: return '#3B82F6' // blue
    }
  }

  // Save settings to localStorage
  const saveAppearanceSettings = (newSettings: Partial<AppearanceSettings>) => {
    const updatedSettings = { ...appearanceSettings, ...newSettings }
    setAppearanceSettings(updatedSettings)
    localStorage.setItem('appearance-settings', JSON.stringify(updatedSettings))
    
    toast.success('Appearance settings updated!', {
      duration: 2000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
      },
    })
  }

  const saveNotificationSettings = (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...notificationSettings, ...newSettings }
    setNotificationSettings(updatedSettings)
    localStorage.setItem('notification-settings', JSON.stringify(updatedSettings))
    
    toast.success('Notification preferences updated!', {
      duration: 2000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
      },
    })
  }

  const saveLanguageRegionSettings = (newSettings: Partial<LanguageRegionSettings>) => {
    const updatedSettings = { ...languageRegionSettings, ...newSettings }
    setLanguageRegionSettings(updatedSettings)
    localStorage.setItem('language-region-settings', JSON.stringify(updatedSettings))
    
    toast.success('Language & region settings updated!', {
      duration: 2000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
      },
    })
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setIsChangingPassword(true)
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match!')
      setIsChangingPassword(false)
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long!')
      setIsChangingPassword(false)
      return
    }
    
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      
      // Log the successful password change
      logUserAction('PASSWORD_CHANGE_SUCCESS', 'Password changed successfully')
      
      toast.success('Password changed successfully!', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#fff',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#10B981',
        },
      })
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
    } catch (error) {
      console.error('Failed to change password:', error)
      
      // Log the failed password change attempt
              logUserAction('PASSWORD_CHANGE_FAILED', t('settings.page.password.failedToChangePasswordError').replace('{error}', error instanceof Error ? error.message : t('settings.page.password.unknown')))
      
              toast.error(error instanceof Error ? error.message : t('settings.page.password.failedToChangePassword'), {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#EF4444',
        },
      })
      
              setPasswordError(error instanceof Error ? error.message : t('settings.page.password.failedToChangePassword'))
    } finally {
      setIsChangingPassword(false)
    }
  }

  const openSection = (section: string) => {
    setActiveSection(section)
  }

  const closeSection = () => {
    setActiveSection(null)
  }

  const toggleNotification = (key: keyof NotificationSettings) => {
    saveNotificationSettings({ [key]: !notificationSettings[key] })
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Please sign in to access settings</h1>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Settings className="w-8 h-8 text-blue-600 mr-3" />
                {t('settings.page.title')}
              </h1>
              <p className="text-gray-600 mt-2">{t('settings.page.subtitle')}</p>
            </div>

            {/* Account Settings - Always Visible */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                {t('settings.page.security.title')}
              </h2>
              
              {/* Email Section */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                <div>
                  <p className="font-medium text-gray-900">Email Address</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <span className="text-sm text-gray-500">{t('settings.page.password.emailCannotBeChanged')}</span>
              </div>

              {/* Password Section */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Password</p>
                  <p className="text-sm text-gray-600">{t('settings.page.password.lastChanged')}: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : t('settings.page.password.unknown')}</p>
                </div>
                <Button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  variant="outline"
                  size="sm"
                >
                  <Key className="w-4 h-4 mr-2" />
                  {t('settings.page.security.changePassword')}
                </Button>
              </div>

              {/* Password Change Form */}
              {showPasswordForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.page.security.changePassword')}</h3>
                  
                  {passwordError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                      {passwordError}
                    </div>
                  )}
                  
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.page.security.currentPassword')}
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                        disabled={isChangingPassword}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        placeholder={t('settings.page.password.enterCurrentPassword')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.page.security.newPassword')}
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                        minLength={6}
                        disabled={isChangingPassword}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        placeholder={t('settings.page.password.enterNewPassword')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.page.security.confirmPassword')}
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                        disabled={isChangingPassword}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        placeholder="Confirm your new password"
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button type="submit" className="flex-1" disabled={isChangingPassword}>
                        <Lock className="w-4 h-4 mr-2" />
                        <span>{isChangingPassword ? t('settings.page.password.changingPassword') : t('settings.page.password.changePassword')}</span>
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        disabled={isChangingPassword}
                        onClick={() => {
                          setShowPasswordForm(false)
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                          setPasswordError('')
                        }}
                      >
                        {t('settings.page.password.cancel')}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </div>

            {/* Quick Actions - Always Visible */}
            <div className="p-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('settings.page.quickActions.title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => openSection('audit')}
                >
                  <Shield className="w-5 h-5 mr-3 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{t('settings.page.quickActions.viewAuditLogs.title')}</p>
                    <p className="text-sm text-gray-600">{t('settings.page.quickActions.viewAuditLogs.description')}</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => openSection('notifications')}
                >
                  <Bell className="w-5 h-5 mr-3 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{t('settings.page.quickActions.notificationPreferences.title')}</p>
                    <p className="text-sm text-gray-600">{t('settings.page.quickActions.notificationPreferences.description')}</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => openSection('appearance')}
                >
                  <Palette className="w-5 h-5 mr-3 text-purple-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{t('settings.page.quickActions.appearance.title')}</p>
                    <p className="text-sm text-gray-600">{t('settings.page.quickActions.appearance.description')}</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => openSection('language')}
                >
                  <Globe className="w-5 h-5 mr-3 text-orange-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{t('settings.page.quickActions.languageRegion.title')}</p>
                    <p className="text-sm text-gray-600">{t('settings.page.quickActions.languageRegion.description')}</p>
                  </div>
                </Button>
              </div>
            </div>

            {/* Role Switcher - For Demo Purposes */}
            <div className="p-6 border-t border-gray-200">
              <RoleSwitcher />
            </div>

            {/* Dynamic Settings Sections - Only shown when activated */}
            <AnimatePresence>
              {activeSection === 'audit' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200"
                >
                  <div className="p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-green-600" />
                        Audit Logs
                      </h2>
                      <Button
                        onClick={closeSection}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Close
                      </Button>
                    </div>
                    <p className="text-gray-600 mb-4">View and monitor your account activity and security events.</p>
                    <Button 
                      onClick={() => window.location.href = '/audit'}
                      className="w-full"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Go to Audit Page
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeSection === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-blue-600" />
                        Notification Preferences
                      </h2>
                      <Button
                        onClick={closeSection}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Close
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-600">Receive notifications via email</p>
                        </div>
                        <button 
                          onClick={() => toggleNotification('emailNotifications')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Push Notifications</p>
                          <p className="text-sm text-gray-600">Receive push notifications in browser</p>
                        </div>
                        <button 
                          onClick={() => toggleNotification('pushNotifications')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Course Updates</p>
                          <p className="text-sm text-gray-600">Get notified about new lessons and progress</p>
                        </div>
                        <button 
                          onClick={() => toggleNotification('courseUpdates')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings.courseUpdates ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.courseUpdates ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Security Alerts</p>
                          <p className="text-sm text-gray-600">Important security notifications</p>
                        </div>
                        <button 
                          onClick={() => toggleNotification('securityAlerts')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings.securityAlerts ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.securityAlerts ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'appearance' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                                              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                          <Palette className="w-5 h-5 mr-2 text-purple-600" />
                          {t('settings.page.appearance.title')}
                        </h2>
                      <Button
                        onClick={closeSection}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Close
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                        <select 
                          value={appearanceSettings.theme}
                          onChange={(e) => saveAppearanceSettings({ theme: e.target.value as 'light' | 'dark' | 'auto' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="light">Light Theme</option>
                          <option value="dark">Dark Theme</option>
                          <option value="auto">Auto (System)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                        <select 
                          value={appearanceSettings.fontSize}
                          onChange={(e) => saveAppearanceSettings({ fontSize: e.target.value as 'small' | 'medium' | 'large' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
                        <select 
                          value={appearanceSettings.colorScheme}
                          onChange={(e) => saveAppearanceSettings({ colorScheme: e.target.value as 'blue' | 'green' | 'purple' | 'orange' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="blue">Blue (Default)</option>
                          <option value="green">Green</option>
                          <option value="purple">Purple</option>
                          <option value="orange">Orange</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Animation Speed</label>
                        <select 
                          value={appearanceSettings.animationSpeed}
                          onChange={(e) => saveAppearanceSettings({ animationSpeed: e.target.value as 'fast' | 'normal' | 'slow' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="fast">Fast</option>
                          <option value="normal">Normal</option>
                          <option value="slow">Slow</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'language' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                                              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                          <Globe className="w-5 h-5 mr-2 text-orange-600" />
                          {t('settings.page.language.title')}
                        </h2>
                      <Button
                        onClick={closeSection}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Close
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select 
                          value={languageRegionSettings.language}
                          onChange={(e) => saveLanguageRegionSettings({ language: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="English">🇺🇸 English</option>
                          <option value="Spanish">🇪🇸 Español</option>
                          <option value="French">🇫🇷 Français</option>
                          <option value="German">🇩🇪 Deutsch</option>
                          <option value="Chinese">🇨🇳 中文</option>
                          <option value="Japanese">🇯🇵 日本語</option>
                          <option value="Korean">🇰🇷 한국어</option>
                          <option value="Tagalog">🇵🇭 Tagalog</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                        <select 
                          value={languageRegionSettings.region}
                          onChange={(e) => saveLanguageRegionSettings({ region: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="United States">🇺🇸 United States</option>
                          <option value="Philippines">🇵🇭 Philippines</option>
                          <option value="United Kingdom">🇬🇧 United Kingdom</option>
                          <option value="Canada">🇨🇦 Canada</option>
                          <option value="Australia">🇦🇺 Australia</option>
                          <option value="Japan">🇯🇵 Japan</option>
                          <option value="South Korea">🇰🇷 South Korea</option>
                          <option value="China">🇨🇳 China</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select 
                          value={languageRegionSettings.timezone}
                          onChange={(e) => saveLanguageRegionSettings({ timezone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="UTC-8">Pacific Time (UTC-8)</option>
                          <option value="UTC-7">Mountain Time (UTC-7)</option>
                          <option value="UTC-6">Central Time (UTC-6)</option>
                          <option value="UTC-5">Eastern Time (UTC-5)</option>
                          <option value="UTC+0">GMT/UTC (UTC+0)</option>
                          <option value="UTC+8">Philippines Time (UTC+8)</option>
                          <option value="UTC+9">Japan/Korea Time (UTC+9)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                        <select 
                          value={languageRegionSettings.dateFormat}
                          onChange={(e) => saveLanguageRegionSettings({ dateFormat: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                        <select 
                          value={languageRegionSettings.timeFormat}
                          onChange={(e) => saveLanguageRegionSettings({ timeFormat: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="12-hour">12-hour</option>
                          <option value="24-hour">24-hour</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select 
                          value={languageRegionSettings.currency}
                          onChange={(e) => saveLanguageRegionSettings({ currency: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="PHP">PHP (₱)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="JPY">JPY (¥)</option>
                          <option value="KRW">KRW (₩)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}
