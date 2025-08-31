'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Crown, Shield, GraduationCap, Users } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export const RoleSwitcher: React.FC = () => {
  const { user, updateUserRole } = useAuthStore()
  const { t } = useLanguage()
  const [isChanging, setIsChanging] = useState(false)

  const roles = [
    { 
      id: 'STUDENT', 
      label: t('roles.student') || 'Student', 
      icon: Users, 
      color: 'bg-gray-100 text-gray-800',
      description: t('roles.student.description') || 'Access to courses and learning materials'
    },
    { 
      id: 'TEACHER', 
      label: t('roles.teacher') || 'Teacher', 
      icon: GraduationCap, 
      color: 'bg-green-100 text-green-800',
      description: t('roles.teacher.description') || 'Create and manage courses, monitor students'
    },
    { 
      id: 'ADMIN', 
      label: t('roles.admin') || 'Admin', 
      icon: Shield, 
      color: 'bg-blue-100 text-blue-800',
      description: t('roles.admin.description') || 'User management and system oversight'
    },
    { 
      id: 'SUPERADMIN', 
      label: t('roles.superAdmin') || 'Super Admin', 
      icon: Crown, 
      color: 'bg-purple-100 text-purple-800',
      description: t('roles.superAdmin.description') || 'Full system control and configuration'
    }
  ]

  const handleRoleChange = async (newRole: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPERADMIN') => {
    if (!user) return
    
    setIsChanging(true)
    try {
      // For demo purposes, directly update the user role
      // In production, this would call the API
      const updatedUser = { ...user, role: newRole }
      
      // Update localStorage
      const userData = JSON.parse(localStorage.getItem('users') || '{}')
      if (userData[user.email]) {
        userData[user.email].role = newRole
        localStorage.setItem('users', JSON.stringify(userData))
      }
      
      // Update the store
      useAuthStore.setState({ user: updatedUser })
      
      // Reload the page to show the new dashboard
      window.location.reload()
    } catch (error) {
      console.error('Failed to change role:', error)
    } finally {
      setIsChanging(false)
    }
  }

  if (!user) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('roleSwitcher.title') || 'Switch Role (Demo)'}
        </h3>
        <p className="text-sm text-gray-600">
          {t('roleSwitcher.description') || 'Switch between different user roles to test the system. This is for demonstration purposes only.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const Icon = role.icon
          const isCurrentRole = user.role === role.id
          
          return (
            <div
              key={role.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isCurrentRole 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${role.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{role.label}</h4>
                    {isCurrentRole && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {t('roleSwitcher.current') || 'Current'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                  <Button
                    onClick={() => handleRoleChange(role.id as any)}
                    disabled={isCurrentRole || isChanging}
                    variant={isCurrentRole ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                  >
                    {isCurrentRole 
                      ? (t('roleSwitcher.currentRole') || 'Current Role')
                      : isChanging 
                        ? (t('roleSwitcher.changing') || 'Changing...')
                        : (t('roleSwitcher.switchTo') || 'Switch to') + ' ' + role.label
                    }
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-yellow-800">
              {t('roleSwitcher.warning.title') || 'Demo Mode'}
            </h4>
            <div className="mt-1 text-sm text-yellow-700">
              <p>
                {t('roleSwitcher.warning.description') || 'This role switcher is for demonstration purposes only. In production, role changes would require proper authentication and authorization.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

