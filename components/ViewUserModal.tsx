'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Shield, GraduationCap, Users, Calendar, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/contexts/LanguageContext'

interface ViewUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

export const ViewUserModal: React.FC<ViewUserModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const { t } = useLanguage()

  if (!isOpen || !user) return null

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return <Shield className="w-4 h-4 text-purple-600" />
      case 'ADMIN': return <Shield className="w-4 h-4 text-blue-600" />
      case 'TEACHER': return <GraduationCap className="w-4 h-4 text-green-600" />
      case 'STUDENT': return <Users className="w-4 h-4 text-gray-600" />
      default: return <Users className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return 'bg-purple-100 text-purple-800'
      case 'ADMIN': return 'bg-blue-100 text-blue-800'
      case 'TEACHER': return 'bg-green-100 text-green-800'
      case 'STUDENT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {t('admin.dashboard.users.viewUser.title') || 'User Details'}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {t('admin.dashboard.users.viewUser.subtitle') || 'View user information and details'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Details */}
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('admin.dashboard.users.viewUser.basicInfo') || 'Basic Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.viewUser.name') || 'Full Name'}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.viewUser.email') || 'Email Address'}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('admin.dashboard.users.viewUser.accountInfo') || 'Account Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.viewUser.role') || 'User Role'}
                  </label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                    {getRoleIcon(user.role)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.viewUser.status') || 'Account Status'}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('admin.dashboard.users.viewUser.personalInfo') || 'Personal Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.viewUser.age') || 'Age'}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900">{user.age || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.viewUser.grade') || 'Grade Level'}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900">{user.grade || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.viewUser.school') || 'School/Institution'}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900">{user.school || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Language Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('admin.dashboard.users.viewUser.languagePreferences') || 'Language Preferences'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('admin.dashboard.users.viewUser.nativeLanguage') || 'Native Language'}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900">{user.nativeLanguage || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('admin.dashboard.users.viewUser.targetLanguages') || 'Target Languages'}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {user.targetLanguages && user.targetLanguages.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.targetLanguages.map((language: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">N/A</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('admin.dashboard.users.viewUser.interests') || 'Learning Interests'}
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                {user.interests && user.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">N/A</p>
                )}
              </div>
            </div>

            {/* Activity Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('admin.dashboard.users.viewUser.activityInfo') || 'Activity Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.viewUser.lastLogin') || 'Last Login'}
                  </label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{formatDate(user.lastLogin)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.viewUser.createdAt') || 'Account Created'}
                  </label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('admin.dashboard.users.viewUser.courseInfo') || 'Course Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.viewUser.coursesCount') || 'Enrolled Courses'}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900">{user.coursesCount || 0}</p>
                  </div>
                </div>

                {user.studentsCount !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.dashboard.users.viewUser.studentsCount') || 'Students (Teacher)'}
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-gray-900">{user.studentsCount}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={onClose}
                variant="outline"
                className="px-6"
              >
                {t('admin.dashboard.users.viewUser.close') || 'Close'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
