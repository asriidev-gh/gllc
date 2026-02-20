'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, Edit, Save, X, Camera, Calendar, BadgeCheck, CreditCard, Upload, FileCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/Header'
import { useAuthStore, useUserStore } from '@/stores'
import { recordLearningActivity } from '@/lib/learningActivity'
import AvatarSelector from '@/components/AvatarSelector'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const { user, updateUserAvatar } = useAuthStore()
  const profile = useUserStore((s) => (user?.id ? s.profilesByUserId[user.id] : null)) ?? null
  const updateProfile = useUserStore((s) => s.updateProfile)
  const { t } = useLanguage()

  const [isEditing, setIsEditing] = useState(false)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [qrImageErrors, setQrImageErrors] = useState<{ gcash: boolean; gotyme: boolean }>({ gcash: false, gotyme: false })
  const [gcashSrc, setGcashSrc] = useState('/assets/payment-options/gcash.jpg')
  const [gotymeSrc, setGotymeSrc] = useState('/assets/payment-options/gotyme-bank-transfer.jpg')
  const proofOfPaymentInputRef = useRef<HTMLInputElement>(null)
  const [uploadedProofFile, setUploadedProofFile] = useState<File | null>(null)
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null)
  const [showProofViewerModal, setShowProofViewerModal] = useState(false)
  const MAX_PROOF_SIZE_MB = 3
  const isProofImage = (dataUrl: string) => /^data:image\//i.test(dataUrl)
  const isProofPdf = (dataUrl: string) => /^data:application\/pdf/i.test(dataUrl)
  const resetUpgradeModal = () => {
    if (previewProofUrl && previewProofUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewProofUrl)
    }
    setPreviewProofUrl(null)
    setUploadedProofFile(null)
    setShowUpgradeModal(false)
    setQrImageErrors({ gcash: false, gotyme: false })
    setGcashSrc('/assets/payment-options/gcash.jpg')
    setGotymeSrc('/assets/payment-options/gotyme-bank-transfer.jpg')
  }
  const handleProofOfPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      e.target.value = ''
      return
    }
    if (file.size > MAX_PROOF_SIZE_MB * 1024 * 1024) {
      toast.error(t('profile.page.proofFileTooLarge'))
      e.target.value = ''
      return
    }
    if (previewProofUrl && previewProofUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewProofUrl)
    }
    const url = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    setPreviewProofUrl(url)
    setUploadedProofFile(file)
    e.target.value = ''
  }
  const handleSubmitProof = async () => {
    if (!user?.id || !uploadedProofFile) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      updateProfile(user.id, {
        paymentValidationStatus: 'pending',
        paymentProofDataUrl: dataUrl,
        paymentProofSubmittedAt: new Date().toISOString()
      })
      toast.success(t('profile.page.proofSubmitted'))
      resetUpgradeModal()
    }
    reader.readAsDataURL(uploadedProofFile)
  }
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: profile?.bio || ''
  })

  // Sync form when user or profile changes (e.g. after login as different user)
  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: profile?.bio || ''
    })
  }, [user?.id, user?.name, user?.email, profile?.bio])

  // Open upgrade modal when redirected from course details (e.g. /profile?upgrade=1)
  useEffect(() => {
    if (searchParams.get('upgrade') === '1') {
      setShowUpgradeModal(true)
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/profile')
      }
    }
  }, [searchParams])

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
    if (!user?.id) return
    try {
      updateProfile(user.id, { bio: formData.bio })

      if (user?.email) {
        recordLearningActivity(user.email, 'profile_updated', 'Profile information updated')
      }

      setIsEditing(false)
      toast.success(t('profile.page.saveSuccess') || 'Profile saved successfully')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error(t('profile.page.saveError') || 'Failed to save profile')
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
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
                {user.createdAt && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">
                      {t('profile.page.memberSince')}: {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                )}
                {(user.role === 'STUDENT' || user.membership) && (
                  <div className="flex items-center space-x-3 flex-wrap gap-2">
                    <BadgeCheck className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">
                      {t('profile.page.membership')}: {(user.membership === 'new - no membership' || !user.membership) ? t('profile.page.membershipNoYet') : user.membership}
                    </span>
                    {(user.membership === 'new - no membership' || !user.membership) && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setShowUpgradeModal(true)}
                        className="ml-1"
                      >
                        <CreditCard className="w-4 h-4 mr-1.5" />
                        {t('profile.page.upgradeMembership')}
                      </Button>
                    )}
                  </div>
                )}
                {(user.role === 'STUDENT' || user.membership) && (user.membership === 'new - no membership' || !user.membership || profile?.paymentValidationStatus || profile?.paymentProofDataUrl) && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700">
                        {t('profile.page.paymentValidationStatus')}:{' '}
                        <span className="font-medium">
                          {t(`profile.page.paymentStatus.${profile?.paymentValidationStatus ?? 'none'}`)}
                        </span>
                      </span>
                    </div>
                    {profile?.paymentProofDataUrl && (
                      <div className="ml-8">
                        <button
                          type="button"
                          onClick={() => setShowProofViewerModal(true)}
                          className="text-primary-600 hover:underline text-sm"
                        >
                          {t('profile.page.viewUploadedProof')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bio Section - only for teachers, saved per user */}
            {user?.role === 'TEACHER' && (
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

      {/* Upgrade Membership Modal */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={resetUpgradeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{t('profile.page.upgradeMembershipTitle')}</h3>
                <button
                  onClick={resetUpgradeModal}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-lg font-medium text-primary-600 mb-2">{t('profile.page.upgradeAmount')}</p>
              <p className="text-gray-600 text-sm mb-6">{t('profile.page.upgradeHowToPay')}</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('profile.page.payViaGcash')}</p>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[180px] relative">
                    {qrImageErrors.gcash ? (
                      <span className="text-gray-400 text-sm p-4 text-center">GCash QR (add gcash.jpg to public/assets/payment-options)</span>
                    ) : (
                      <img
                        src={gcashSrc}
                        alt="GCash QR"
                        className="w-full h-full object-contain"
                        onError={() => setQrImageErrors((s) => ({ ...s, gcash: true }))}
                      />
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('profile.page.payViaGotyme')}</p>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[180px] relative">
                    {qrImageErrors.gotyme ? (
                      <span className="text-gray-400 text-sm p-4 text-center">GoTyme QR (add gotyme-bank-transfer.jpg to public/assets/payment-options)</span>
                    ) : (
                      <img
                        src={gotymeSrc}
                        alt="GoTyme QR"
                        className="w-full h-full object-contain"
                        onError={() => setQrImageErrors((s) => ({ ...s, gotyme: true }))}
                      />
                    )}
                  </div>
                </div>
              </div>
              <input
                ref={proofOfPaymentInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleProofOfPaymentChange}
              />
              {previewProofUrl || uploadedProofFile ? (
                <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('profile.page.proofPreview')}</p>
                  {previewProofUrl ? (
                    <img
                      src={previewProofUrl}
                      alt="Proof preview"
                      className="max-h-48 w-full object-contain rounded border border-gray-200"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-600 py-4">
                      <FileCheck className="w-8 h-8 flex-shrink-0" />
                      <span>{uploadedProofFile?.name}</span>
                    </div>
                  )}
                </div>
              ) : null}
              <Button
                variant="outline"
                onClick={() => proofOfPaymentInputRef.current?.click()}
                className="w-full mb-3"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadedProofFile ? t('profile.page.reuploadProof') : t('profile.page.uploadProofOfPayment')}
              </Button>
              {uploadedProofFile && (
                <Button onClick={handleSubmitProof} className="w-full">
                  <FileCheck className="w-4 h-4 mr-2" />
                  {t('profile.page.submitProof')}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* View uploaded proof modal */}
      {showProofViewerModal && profile?.paymentProofDataUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowProofViewerModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{t('profile.page.viewUploadedProof')}</h3>
              <button
                onClick={() => setShowProofViewerModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 min-h-[300px] flex items-center justify-center bg-gray-100">
              {isProofImage(profile.paymentProofDataUrl) ? (
                <img
                  src={profile.paymentProofDataUrl}
                  alt="Payment proof"
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : isProofPdf(profile.paymentProofDataUrl) ? (
                <iframe
                  src={profile.paymentProofDataUrl}
                  title="Payment proof"
                  className="w-full min-h-[70vh] border-0 rounded"
                />
              ) : (
                <p className="text-gray-500">{t('profile.page.proofViewUnsupported')}</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
