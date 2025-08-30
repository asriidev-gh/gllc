'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Globe, Edit, Save, X, Camera } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/Header'
import { useAuthStore, useUserStore } from '@/stores'
import { recordLearningActivity } from '@/lib/learningActivity'
import AvatarSelector from '@/components/AvatarSelector'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUserAvatar } = useAuthStore()
  const { profile, updateProfile } = useUserStore()
  const { t } = useLanguage()
  
  const [isEditing, setIsEditing] = useState(false)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    targetLanguages: user?.targetLanguages || [],
    nativeLanguage: user?.nativeLanguage || '',
    bio: profile?.bio || ''
  })

  // Load user avatar from localStorage on mount
  useEffect(() => {
    if (user?.email) {
      const userData = JSON.parse(localStorage.getItem('users') || '{}')
      const savedAvatar = userData[user.email]?.avatar || user?.avatar || null
      if (savedAvatar && savedAvatar !== user?.avatar) {
        updateUserAvatar(savedAvatar)
      }
    }
  }, [user?.email, user?.avatar, updateUserAvatar])

  const handleSave = async () => {
    try {
      await updateProfile({
        bio: formData.bio
      })
      
      // Record profile update activity
      if (user?.email) {
        recordLearningActivity(user.email, 'profile_updated', 'Profile information updated')
      }
      
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      age: user?.age || '',
      targetLanguages: user?.targetLanguages || [],
      nativeLanguage: user?.nativeLanguage || '',
      bio: profile?.bio || ''
    })
    setIsEditing(false)
  }

  const handleAvatarChange = (newAvatar: string) => {
    updateUserAvatar(newAvatar)
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">{t('profile.page.signInRequired')}</h1>
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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('profile.page.title')}</h1>
            <p className="text-gray-600">{t('profile.page.subtitle')}</p>
          </motion.div>

          {/* Profile Content */}
          <div className="bg-white rounded-xl shadow-sm border p-8">
            {/* Avatar Section */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold mb-4">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    user.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <button
                  onClick={() => setShowAvatarSelector(true)}
                  className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg border-2 border-primary-200 hover:border-primary-400 transition-colors"
                >
                  <Camera className="w-4 h-4 text-primary-600" />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>

            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.page.personalInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{user.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{user.email}</span>
                </div>
                {user.age && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{user.age} years old</span>
                  </div>
                )}
                {user.nativeLanguage && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Native: {user.nativeLanguage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('profile.page.bio')}</h3>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {t('profile.page.edit')}
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder={t('profile.page.bioPlaceholder')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <div className="flex space-x-3">
                    <Button onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      {t('profile.page.save')}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" />
                      {t('profile.page.cancel')}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {profile?.bio || t('profile.page.bioPlaceholder')}
                </p>
              )}
            </div>

            {/* Target Languages */}
            {user.targetLanguages && user.targetLanguages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {user.targetLanguages.map((lang, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <AvatarSelector
          currentAvatar={user.avatar || null}
          onAvatarChange={handleAvatarChange}
          userName={user.name || ''}
          isOpen={showAvatarSelector}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}
    </>
  )
}
