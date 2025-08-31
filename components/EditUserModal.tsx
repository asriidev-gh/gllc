'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Shield, GraduationCap, Users, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuthStore } from '@/stores/authStore'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserUpdated: (user: any) => void
  user: any
}

interface EditUserFormData {
  firstName: string
  lastName: string
  email: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPERADMIN'
  age: string
  grade: string
  school: string
  interests: string[]
  nativeLanguage: string
  targetLanguages: string[]
  status: 'active' | 'inactive' | 'suspended'
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onUserUpdated,
  user
}) => {
  const { t } = useLanguage()
  const { user: currentUser } = useAuthStore()
  const [formData, setFormData] = useState<EditUserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'STUDENT',
    age: '',
    grade: '',
    school: '',
    interests: [],
    nativeLanguage: 'English',
    targetLanguages: ['English'],
    status: 'active'
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Available languages for selection
  const availableLanguages = ['English', 'Spanish', 'Tagalog', 'Korean', 'Japanese', 'French', 'German', 'Chinese']
  const availableGrades = ['Elementary', 'Middle School', 'High School', 'College', 'University', 'Adult Learner']

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      const [firstName, ...lastNameParts] = user.name.split(' ')
      const lastName = lastNameParts.join(' ')
      
      setFormData({
        firstName: firstName || '',
        lastName: lastName || '',
        email: user.email || '',
        role: user.role || 'STUDENT',
        age: user.age?.toString() || '',
        grade: user.grade || '',
        school: user.school || '',
        interests: user.interests || [],
        nativeLanguage: user.nativeLanguage || 'English',
        targetLanguages: user.targetLanguages || ['English'],
        status: user.status || 'active'
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleLanguageToggle = (language: string, type: 'native' | 'target') => {
    if (type === 'native') {
      setFormData(prev => ({ ...prev, nativeLanguage: language }))
    } else {
      setFormData(prev => ({
        ...prev,
        targetLanguages: prev.targetLanguages.includes(language)
          ? prev.targetLanguages.filter(l => l !== language)
          : [...prev.targetLanguages, language]
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    
    if (!formData.age) newErrors.age = 'Age is required'
    else if (isNaN(Number(formData.age)) || Number(formData.age) < 5 || Number(formData.age) > 100) {
      newErrors.age = 'Age must be between 5 and 100'
    }
    
    if (!formData.grade) newErrors.grade = 'Grade level is required'
    if (!formData.school.trim()) newErrors.school = 'School is required'
    if (formData.interests.length === 0) newErrors.interests = 'At least one interest is required'
    if (formData.targetLanguages.length === 0) newErrors.targetLanguages = 'At least one target language is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedUser = {
        ...user,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        role: formData.role,
        age: parseInt(formData.age),
        grade: formData.grade,
        school: formData.school,
        interests: formData.interests,
        nativeLanguage: formData.nativeLanguage,
        targetLanguages: formData.targetLanguages,
        status: formData.status,
        updatedAt: new Date().toISOString()
      }
      
      // Call the callback to update the user in the parent component
      onUserUpdated(updatedUser)
      
      // Close modal
      onClose()
      
    } catch (error) {
      console.error('Failed to update user:', error)
      alert('Failed to update user. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="w-4 h-4 text-blue-600" />
      case 'TEACHER': return <GraduationCap className="w-4 h-4 text-green-600" />
      case 'STUDENT': return <Users className="w-4 h-4 text-gray-600" />
      default: return <Users className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
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

  if (!isOpen || !user) return null

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
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {t('admin.dashboard.users.editUser.title') || 'Edit User'}
                  </h2>
                  <p className="text-yellow-100 text-sm">
                    {t('admin.dashboard.users.editUser.subtitle') || 'Modify user information and settings'}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('admin.dashboard.users.editUser.basicInfo') || 'Basic Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.editUser.firstName') || 'First Name'} *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.editUser.lastName') || 'Last Name'} *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('admin.dashboard.users.editUser.accountInfo') || 'Account Information'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.editUser.email') || 'Email Address'} *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.dashboard.users.editUser.role') || 'User Role'}
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="ADMIN">Admin</option>
                      {currentUser?.role === 'SUPERADMIN' && (
                        <option value="SUPERADMIN">SuperAdmin</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.dashboard.users.editUser.status') || 'Account Status'}
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Selection Display */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('admin.dashboard.users.editUser.currentRole') || 'Current Role'}
              </h3>
              <div className={`grid grid-cols-1 gap-4 ${
                currentUser?.role === 'SUPERADMIN' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'
              }`}>
                {(['STUDENT', 'TEACHER', 'ADMIN'] as const).map((role) => (
                  <div
                    key={role}
                    className={`p-4 border-2 rounded-lg ${
                      formData.role === role
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getRoleColor(role)}`}>
                        {getRoleIcon(role)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">{role}</h4>
                        <p className="text-sm text-gray-600">
                          {role === 'STUDENT' && (t('admin.dashboard.users.editUser.roleStudent') || 'Access to courses and learning materials')}
                          {role === 'TEACHER' && (t('admin.dashboard.users.editUser.roleTeacher') || 'Create and manage courses, monitor students')}
                          {role === 'ADMIN' && (t('admin.dashboard.users.editUser.roleAdmin') || 'User management and system oversight')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* SuperAdmin Role - Only visible to SuperAdmins */}
                {currentUser?.role === 'SUPERADMIN' && (
                  <div
                    className={`p-4 border-2 rounded-lg ${
                      formData.role === 'SUPERADMIN'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">SuperAdmin</h4>
                        <p className="text-sm text-gray-600">
                          {t('admin.dashboard.users.editUser.roleSuperAdmin') || 'Full system access and SuperAdmin management'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('admin.dashboard.users.editUser.personalInfo') || 'Personal Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.editUser.age') || 'Age'} *
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.age ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter age"
                    min="5"
                    max="100"
                  />
                  {errors.age && (
                    <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.editUser.grade') || 'Grade Level'} *
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.grade ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select grade level</option>
                    {availableGrades.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                  {errors.grade && (
                    <p className="text-red-500 text-sm mt-1">{errors.grade}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.editUser.school') || 'School/Institution'} *
                  </label>
                  <input
                    type="text"
                    value={formData.school}
                    onChange={(e) => handleInputChange('school', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.school ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter school name"
                  />
                  {errors.school && (
                    <p className="text-red-500 text-sm mt-1">{errors.school}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Language Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('admin.dashboard.users.editUser.languagePreferences') || 'Language Preferences'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('admin.dashboard.users.editUser.nativeLanguage') || 'Native Language'} *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableLanguages.map((language) => (
                      <button
                        key={language}
                        type="button"
                        onClick={() => handleLanguageToggle(language, 'native')}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          formData.nativeLanguage === language
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('admin.dashboard.users.editUser.targetLanguages') || 'Target Languages'} *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableLanguages.map((language) => (
                      <button
                        key={language}
                        type="button"
                        onClick={() => handleLanguageToggle(language, 'target')}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          formData.targetLanguages.includes(language)
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                  {errors.targetLanguages && (
                    <p className="text-red-500 text-sm mt-1">{errors.targetLanguages}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('admin.dashboard.users.editUser.interests') || 'Learning Interests'} *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availableLanguages.map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => handleInterestToggle(language)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      formData.interests.includes(language)
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {language}
                  </button>
                ))}
              </div>
              {errors.interests && (
                <p className="text-red-500 text-sm mt-1">{errors.interests}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t('admin.dashboard.users.editUser.cancel') || 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 bg-yellow-600 hover:bg-yellow-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('admin.dashboard.users.editUser.updating') || 'Updating...'}
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    {t('admin.dashboard.users.editUser.updateUser') || 'Update User'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
