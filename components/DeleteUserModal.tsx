'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, AlertTriangle, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/contexts/LanguageContext'

interface DeleteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (userId: string) => void
  user: any
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user
}) => {
  const { t } = useLanguage()

  if (!isOpen || !user) return null

  const handleConfirm = () => {
    onConfirm(user.id)
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
          className="bg-white rounded-2xl max-w-md w-full"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {t('admin.dashboard.users.deleteUser.title') || 'Delete User'}
                  </h2>
                  <p className="text-red-100 text-sm">
                    {t('admin.dashboard.users.deleteUser.subtitle') || 'Remove user from the system'}
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

          {/* Content */}
          <div className="p-6">
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Warning Message */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('admin.dashboard.users.deleteUser.warning') || 'Are you sure you want to delete this user?'}
              </h3>
              <p className="text-gray-600">
                {t('admin.dashboard.users.deleteUser.description') || 'This action cannot be undone. The user will be permanently removed from the system.'}
              </p>
            </div>

            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-200 rounded-full">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{user.role} • {user.status}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="px-6"
              >
                {t('admin.dashboard.users.deleteUser.cancel') || 'Cancel'}
              </Button>
              <Button
                onClick={handleConfirm}
                variant="destructive"
                className="px-6 bg-red-600 hover:bg-red-700"
              >
                {t('admin.dashboard.users.deleteUser.confirm') || 'Delete User'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
