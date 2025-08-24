import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  accessibility: {
    fontSize: 'small' | 'medium' | 'large'
    highContrast: boolean
    screenReader: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private'
    dataSharing: boolean
    analytics: boolean
  }
}

export interface UserProfile {
  id: string
  avatar?: string
  bio?: string
  location?: string
  timezone?: string
  preferences: UserPreferences
  achievements: string[]
  badges: string[]
  lastActive: string
  createdAt: string
  updatedAt: string
}

export interface UserState {
  // State
  profile: UserProfile | null
  isLoading: boolean
  
  // Actions
  updateProfile: (updates: Partial<UserProfile>) => void
  updatePreferences: (updates: Partial<UserPreferences>) => void
  addAchievement: (achievement: string) => void
  addBadge: (badge: string) => void
  updateLastActive: () => void
  resetProfile: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      isLoading: false,

      // Update profile
      updateProfile: (updates: Partial<UserProfile>) => {
        set(state => ({
          profile: state.profile 
            ? { ...state.profile, ...updates, updatedAt: new Date().toISOString() }
            : null
        }))
      },

      // Update preferences
      updatePreferences: (updates: Partial<UserPreferences>) => {
        set(state => ({
          profile: state.profile 
            ? { 
                ...state.profile, 
                preferences: { ...state.profile.preferences, ...updates },
                updatedAt: new Date().toISOString()
              }
            : null
        }))
      },

      // Add achievement
      addAchievement: (achievement: string) => {
        set(state => ({
          profile: state.profile 
            ? { 
                ...state.profile, 
                achievements: Array.from(new Set([...state.profile.achievements, achievement])),
                updatedAt: new Date().toISOString()
              }
            : null
        }))
      },

      // Add badge
      addBadge: (badge: string) => {
        set(state => ({
          profile: state.profile 
            ? { 
                ...state.profile, 
                badges: Array.from(new Set([...state.profile.badges, badge])),
                updatedAt: new Date().toISOString()
              }
            : null
        }))
      },

      // Update last active
      updateLastActive: () => {
        set(state => ({
          profile: state.profile 
            ? { ...state.profile, lastActive: new Date().toISOString() }
            : null
        }))
      },

      // Reset profile
      resetProfile: () => {
        set({ profile: null })
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        profile: state.profile
      })
    }
  )
)
