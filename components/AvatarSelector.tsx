'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Check, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface AvatarSelectorProps {
  currentAvatar: string | null
  onAvatarChange: (avatarUrl: string) => void
  userName: string
  isOpen: boolean
  onClose: () => void
}

// Predefined avatar options
const predefinedAvatars = [
  { id: 'default', url: null, emoji: '👤', name: 'Default' },
  { id: 'student', url: null, emoji: '🎓', name: 'Student' },
  { id: 'teacher', url: null, emoji: '👨‍🏫', name: 'Teacher' },
  { id: 'traveler', url: null, emoji: '✈️', name: 'Traveler' },
  { id: 'bookworm', url: null, emoji: '📚', name: 'Bookworm' },
  { id: 'artist', url: null, emoji: '🎨', name: 'Artist' },
  { id: 'sports', url: null, emoji: '⚽', name: 'Sports' },
  { id: 'music', url: null, emoji: '🎵', name: 'Music' },
  { id: 'tech', url: null, emoji: '💻', name: 'Tech' },
  { id: 'nature', url: null, emoji: '🌿', name: 'Nature' },
  { id: 'space', url: null, emoji: '🚀', name: 'Space' },
  { id: 'ocean', url: null, emoji: '🌊', name: 'Ocean' }
]

// Dicebear avatar styles
const dicebearStyles = [
  'adventurer',
  'adventurer-neutral',
  'avataaars',
  'big-ears',
  'big-ears-neutral',
  'big-smile',
  'bottts',
  'croodles',
  'croodles-neutral',
  'fun-emoji',
  'icons',
  'identicon',
  'initials',
  'lorelei',
  'lorelei-neutral',
  'micah',
  'miniavs',
  'notionists',
  'notionists-neutral',
  'open-peeps',
  'personas',
  'pixel-art',
  'rings',
  'shapes',
  'thumbs'
]

export default function AvatarSelector({ 
  currentAvatar, 
  onAvatarChange, 
  userName, 
  isOpen, 
  onClose 
}: AvatarSelectorProps) {
  const [selectedTab, setSelectedTab] = useState<'predefined' | 'dicebear'>('predefined')
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar)
  const [dicebearSeed, setDicebearSeed] = useState(userName || 'user')
  const [dicebearStyle, setDicebearStyle] = useState('adventurer')
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true)

  // Show welcome message when component opens
  useEffect(() => {
    if (isOpen) {
      setShowWelcomeMessage(true)
      // Auto-hide welcome message after 5 seconds
      const timer = setTimeout(() => setShowWelcomeMessage(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const generateRandomSeed = () => {
    const randomSeed = Math.random().toString(36).substring(2, 15)
    setDicebearSeed(randomSeed)
  }

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl)
  }

  const handleConfirm = () => {
    if (selectedAvatar) {
      onAvatarChange(selectedAvatar)
      onClose()
      
      // Show success message
      toast.success('🎉 Avatar updated successfully! Your new avatar will appear everywhere.', {
        duration: 3000,
        position: 'top-center'
      })
    }
  }

  const getDicebearUrl = (style: string, seed: string) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-gray-900">Choose Your Avatar</h2>
              {currentAvatar && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Current:</span>
                  {currentAvatar.startsWith('http') ? (
                    <img
                      src={currentAvatar}
                      alt="Current avatar"
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <span className="text-lg">{currentAvatar}</span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Welcome Message */}
            {showWelcomeMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-blue-600 text-lg">🎭</div>
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">Welcome to Avatar Selection!</h3>
                      <p className="text-sm text-blue-700">
                        Choose from our predefined avatars or generate a unique custom avatar using Dicebear's free service. 
                        Your selection will be displayed across your profile, header, and dashboard.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWelcomeMessage(false)}
                    className="text-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedTab('predefined')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === 'predefined'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Predefined Avatars
              </button>
              <button
                onClick={() => setSelectedTab('dicebear')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === 'dicebear'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Generate Avatars
              </button>
            </div>

            {/* Tab Content */}
            {selectedTab === 'predefined' && (
              <div className="space-y-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Quick Selection:</strong> Choose from our collection of predefined avatars
                  </p>
                  <p className="text-xs text-gray-500">
                    Click any avatar below to select it. Each represents a different personality or interest!
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {predefinedAvatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => handleAvatarSelect(avatar.emoji)}
                      className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedAvatar === avatar.emoji
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-4xl mb-2">{avatar.emoji}</div>
                      <div className="text-xs text-gray-600">{avatar.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'dicebear' && (
              <div className="space-y-4">
                <div className="text-center p-3 bg-green-50 rounded-lg border-2 border-dashed border-green-300">
                  <p className="text-sm text-green-700 mb-2">
                    <strong>Custom Generation:</strong> Create unique avatars using Dicebear's free service
                  </p>
                  <p className="text-xs text-green-600">
                    Choose a style, customize the seed, and generate unlimited unique avatars!
                  </p>
                </div>
                
                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avatar Style
                    </label>
                    <select
                      value={dicebearStyle}
                      onChange={(e) => setDicebearStyle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {dicebearStyles.map((style) => (
                        <option key={style} value={style}>
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seed (for consistency)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={dicebearSeed}
                        onChange={(e) => setDicebearSeed(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter seed text"
                      />
                      <button
                        onClick={generateRandomSeed}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Generate random seed"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Generated Avatar Preview */}
                <div className="text-center">
                  <div className="inline-block p-4 border-2 border-gray-200 rounded-lg">
                    <img
                      src={getDicebearUrl(dicebearStyle, dicebearSeed)}
                      alt="Generated avatar"
                      className="w-32 h-32 rounded-full"
                    />
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => handleAvatarSelect(getDicebearUrl(dicebearStyle, dicebearSeed))}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Use This Avatar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <Button
              variant="outline"
              onClick={() => {
                onAvatarChange('')
                onClose()
              }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Remove Avatar
            </Button>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!selectedAvatar}
                className="flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Selection</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
