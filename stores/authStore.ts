import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

export interface User {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
  age: number
  grade: string
  school: string
  interests: string[]
  nativeLanguage: string
  targetLanguages: string[]
  createdAt?: string
  updatedAt?: string
  password?: string // For demo purposes only - in production this would be hashed
}

export interface UserAction {
  id: string
  userId: string
  action: string
  details: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

export interface AuthState {
  // State
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  actionLogs: UserAction[]
  
  // Actions
  login: (email: string, password: string) => Promise<User>
  register: (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    age: string
    grade: string
    school: string
    interests: string[]
    nativeLanguage: string
    targetLanguages: string[]
  }) => Promise<User>
  logout: () => void
  clearAuth: () => void
  checkAuthStatus: () => void
  createDemoUser: () => void
  validatePassword: (currentPassword: string) => boolean
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  logUserAction: (action: string, details: string) => void
  getUserActionLogs: (userId: string) => UserAction[]
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      actionLogs: [],

      // Login action
      login: async (email: string, password: string) => {
        console.log('🔐 LOGIN ATTEMPT:', email)
        set({ isLoading: true })
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // For demo purposes, accept any email/password combination
          const user: User = {
            id: `user_${Date.now()}`,
            email,
            name: email.split('@')[0],
            role: 'STUDENT',
            age: 25,
            grade: 'College',
            school: 'Demo University',
            interests: ['English', 'Tagalog'],
            nativeLanguage: 'Filipino',
            targetLanguages: ['English', 'Tagalog'],
            createdAt: new Date().toISOString(),
            password: password // Store password for demo validation
          }
          
          const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          console.log('✅ Login successful:', user.email)
          console.log('🔑 Token generated:', token)
          
          // Log the login action
          const actionLog: UserAction = {
            id: `action_${Date.now()}`,
            userId: user.id,
            action: 'LOGIN',
            details: `User logged in from ${email}`,
            timestamp: new Date().toISOString()
          }
          
          set((state) => ({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            actionLogs: [...state.actionLogs, actionLog]
          }))
          
          toast.success(`Welcome back, ${user.name}!`, {
            duration: 3000,
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
          
          return user
        } catch (error) {
          console.error('❌ Login failed:', error)
          set({ isLoading: false })
          throw error
        }
      },

      // Register action
      register: async (userData) => {
        console.log('🚀 REGISTERING USER:', userData.email)
        set({ isLoading: true })
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const newUser: User = {
            id: `user_${Date.now()}`,
            email: userData.email,
            name: `${userData.firstName} ${userData.lastName}`,
            role: 'STUDENT',
            age: parseInt(userData.age),
            grade: userData.grade,
            school: userData.school,
            interests: userData.interests,
            nativeLanguage: userData.nativeLanguage,
            targetLanguages: userData.targetLanguages,
            createdAt: new Date().toISOString()
          }
          
          const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          console.log('✅ Registration successful:', newUser.email)
          console.log('🔑 Token generated:', token)
          console.log('💾 Saving user data to store...')
          
          // Log the registration action
          const actionLog: UserAction = {
            id: `action_${Date.now()}`,
            userId: newUser.id,
            action: 'REGISTER',
            details: `New user registered: ${newUser.email}`,
            timestamp: new Date().toISOString()
          }
          
          set((state) => ({
            user: newUser,
            token,
            isAuthenticated: true,
            isLoading: false,
            actionLogs: [...state.actionLogs, actionLog]
          }))
          
          console.log('✅ User state updated in store')
          
          toast.success(`Welcome to Global Language Training Center, ${newUser.name}!`, {
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
          
          return newUser
        } catch (error) {
          console.error('❌ Registration failed:', error)
          set({ isLoading: false })
          throw error
        }
      },

      // Logout action
      logout: () => {
        const { user } = get()
        console.log('🚪 LOGGING OUT USER')
        
        if (user) {
          // Log the logout action
          const actionLog: UserAction = {
            id: `action_${Date.now()}`,
            userId: user.id,
            action: 'LOGOUT',
            details: `User logged out: ${user.email}`,
            timestamp: new Date().toISOString()
          }
          
          set((state) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            actionLogs: [...state.actionLogs, actionLog]
          }))
          
          toast.success('You have been logged out successfully', {
            duration: 3000,
            position: 'top-right',
            style: {
              background: '#3B82F6',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#3B82F6',
            },
          })
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
        
        console.log('✅ User logged out, state cleared')
      },

      // Clear auth action
      clearAuth: () => {
        console.log('🧹 CLEARING AUTH STATE')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
        console.log('✅ Auth state cleared')
      },

      // Check auth status
      checkAuthStatus: () => {
        const { user, token } = get()
        console.log('🔍 CHECKING AUTH STATUS')
        console.log('User:', user?.email || 'None')
        console.log('Token:', token ? 'Present' : 'None')
        
        if (user && token) {
          console.log('✅ User authenticated')
          set({ isAuthenticated: true })
        } else {
          console.log('❌ User not authenticated')
          set({ isAuthenticated: false })
        }
      },

      // Create demo user
      createDemoUser: () => {
        console.log('🎭 CREATING DEMO USER')
        
        const demoUser: User = {
          id: 'demo_user',
          email: 'student@example.com',
          name: 'Demo Student',
          role: 'STUDENT',
          age: 16,
          grade: 'Grade 10',
          school: 'Demo School',
          interests: ['English', 'Tagalog'],
          nativeLanguage: 'Filipino',
          targetLanguages: ['English', 'Tagalog'],
          createdAt: new Date().toISOString()
        }
        
        const demoToken = `demo_token_${Date.now()}`
        
        console.log('✅ Demo user created:', demoUser.email)
        console.log('🔑 Demo token generated:', demoToken)
        
        // Log the demo user creation action
        const actionLog: UserAction = {
          id: `action_${Date.now()}`,
          userId: demoUser.id,
          action: 'DEMO_USER_CREATED',
          details: `Demo user created: ${demoUser.email}`,
          timestamp: new Date().toISOString()
        }
        
        set((state) => ({
          user: demoUser,
          token: demoToken,
          isAuthenticated: true,
          isLoading: false,
          actionLogs: [...state.actionLogs, actionLog]
        }))
        
        console.log('✅ Demo user state updated')
        
        toast.success('Demo account created! You can now explore the app', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#F59E0B',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#F59E0B',
          },
        })
      },

      // Validate current password
      validatePassword: (currentPassword: string) => {
        const { user } = get()
        if (!user || !user.password) return false
        
        const isValid = user.password === currentPassword
        console.log('🔐 Password validation:', isValid ? 'SUCCESS' : 'FAILED')
        return isValid
      },

      // Change password
      changePassword: async (currentPassword: string, newPassword: string) => {
        const { user, validatePassword } = get()
        
        if (!user) {
          throw new Error('User not authenticated')
        }

        // Validate current password
        if (!validatePassword(currentPassword)) {
          throw new Error('Current password is incorrect')
        }

        // Prevent changing to the same password
        if (currentPassword === newPassword) {
          throw new Error('New password must be different from current password')
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Update password in user object
        const updatedUser = { ...user, password: newPassword }
        
        // Log the password change action
        const actionLog: UserAction = {
          id: `action_${Date.now()}`,
          userId: user.id,
          action: 'PASSWORD_CHANGE',
          details: `Password changed for user: ${user.email}`,
          timestamp: new Date().toISOString()
        }
        
        set((state) => {
          const newState = {
            user: updatedUser,
            actionLogs: [...state.actionLogs, actionLog]
          }
          console.log('📝 Action log added:', actionLog)
          console.log('📊 Total action logs:', newState.actionLogs.length)
          return newState
        })
        
        console.log('✅ Password changed successfully')
        return true
      },

      // Log user action
      logUserAction: (action: string, details: string) => {
        const { user } = get()
        if (!user) return
        
        const actionLog: UserAction = {
          id: `action_${Date.now()}`,
          userId: user.id,
          action,
          details,
          timestamp: new Date().toISOString()
        }
        
        set((state) => {
          const newState = {
            actionLogs: [...state.actionLogs, actionLog]
          }
          console.log('📝 Action logged:', action, details)
          console.log('📊 Total action logs after logging:', newState.actionLogs.length)
          return newState
        })
      },

      // Get user action logs
      getUserActionLogs: (userId: string) => {
        const { actionLogs } = get()
        return actionLogs.filter(log => log.userId === userId)
      }
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        actionLogs: state.actionLogs
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 AUTH STORE REHYDRATED:', state)
        if (state) {
          state.checkAuthStatus()
        }
      }
    }
  )
)
