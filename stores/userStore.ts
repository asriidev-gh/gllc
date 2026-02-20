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

export type PaymentValidationStatus = 'none' | 'pending' | 'approved' | 'rejected'

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
  /** Payment proof for lifetime membership upgrade */
  paymentValidationStatus?: PaymentValidationStatus
  paymentProofDataUrl?: string
  paymentProofSubmittedAt?: string
}

export interface UserState {
  // State: profiles keyed by user id so each user has their own bio/preferences
  profilesByUserId: Record<string, UserProfile>
  isLoading: boolean

  // Get profile for a user (for convenience)
  getProfile: (userId: string) => UserProfile | null

  // Actions (require userId so data is stored per user)
  updateProfile: (userId: string, updates: Partial<UserProfile>) => void
  updatePreferences: (userId: string, updates: Partial<UserPreferences>) => void
  addAchievement: (userId: string, achievement: string) => void
  addBadge: (userId: string, badge: string) => void
  updateLastActive: (userId: string) => void
  resetProfile: (userId: string) => void
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  notifications: { email: true, push: false, sms: false },
  accessibility: { fontSize: 'medium', highContrast: false, screenReader: false },
  privacy: { profileVisibility: 'public', dataSharing: false, analytics: false }
}

function createDefaultProfile(): UserProfile {
  const now = new Date().toISOString()
  return {
    id: `profile_${Date.now()}`,
    preferences: defaultPreferences,
    achievements: [],
    badges: [],
    lastActive: now,
    createdAt: now,
    updatedAt: now
  }
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profilesByUserId: {},
      isLoading: false,

      getProfile: (userId: string) => (get().profilesByUserId ?? {})[userId] ?? null,

      updateProfile: (userId: string, updates: Partial<UserProfile>) => {
        const now = new Date().toISOString()
        set(state => {
          const byId = state.profilesByUserId ?? {}
          const existing = byId[userId]
          const next = existing
            ? { ...existing, ...updates, updatedAt: now }
            : { ...createDefaultProfile(), ...updates, updatedAt: now, id: userId }
          return {
            profilesByUserId: { ...byId, [userId]: next }
          }
        })
      },

      updatePreferences: (userId: string, updates: Partial<UserPreferences>) => {
        set(state => {
          const byId = state.profilesByUserId ?? {}
          const existing = byId[userId]
          if (!existing) return state
          return {
            profilesByUserId: {
              ...byId,
              [userId]: {
                ...existing,
                preferences: { ...existing.preferences, ...updates },
                updatedAt: new Date().toISOString()
              }
            }
          }
        })
      },

      addAchievement: (userId: string, achievement: string) => {
        set(state => {
          const byId = state.profilesByUserId ?? {}
          const existing = byId[userId]
          if (!existing) return state
          return {
            profilesByUserId: {
              ...byId,
              [userId]: {
                ...existing,
                achievements: Array.from(new Set([...existing.achievements, achievement])),
                updatedAt: new Date().toISOString()
              }
            }
          }
        })
      },

      addBadge: (userId: string, badge: string) => {
        set(state => {
          const byId = state.profilesByUserId ?? {}
          const existing = byId[userId]
          if (!existing) return state
          return {
            profilesByUserId: {
              ...byId,
              [userId]: {
                ...existing,
                badges: Array.from(new Set([...existing.badges, badge])),
                updatedAt: new Date().toISOString()
              }
            }
          }
        })
      },

      updateLastActive: (userId: string) => {
        set(state => {
          const byId = state.profilesByUserId ?? {}
          const existing = byId[userId]
          if (!existing) return state
          return {
            profilesByUserId: {
              ...byId,
              [userId]: { ...existing, lastActive: new Date().toISOString() }
            }
          }
        })
      },

      resetProfile: (userId: string) => {
        set(state => {
          const byId = state.profilesByUserId ?? {}
          const next = { ...byId }
          delete next[userId]
          return { profilesByUserId: next }
        })
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        profilesByUserId: state.profilesByUserId
      })
    }
  )
)
