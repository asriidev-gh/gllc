import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

export interface User {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPERADMIN'
  age: number
  grade: string
  school: string
  interests: string[]
  nativeLanguage: string
  targetLanguages: string[]
  avatar?: string | null
  createdAt?: string
  updatedAt?: string
  password?: string // For demo purposes only - in production this would be hashed
  
  // Role-specific fields
  permissions?: string[]
  isActive?: boolean
  lastLogin?: string
  loginCount?: number
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
    role?: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPERADMIN'
  }) => Promise<User>
  logout: () => void
  clearAuth: () => void
  checkAuthStatus: () => void
  createDemoUser: () => void
  validatePassword: (currentPassword: string) => boolean
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  logUserAction: (action: string, details: string) => void
  getUserActionLogs: (userId: string) => UserAction[]
  updateUserAvatar: (avatar: string | null) => void
  
  // Role-based actions
  hasPermission: (permission: string) => boolean
  hasRole: (role: User['role']) => boolean
  canAccess: (resource: string, action: string) => boolean
  getRolePermissions: (role: User['role']) => string[]
  updateUserRole: (userId: string, newRole: User['role']) => Promise<boolean>
  deactivateUser: (userId: string) => Promise<boolean>
  activateUser: (userId: string) => Promise<boolean>
  getDashboardUrl: (role: User['role']) => string
}

// Role-based permission system
export const ROLE_PERMISSIONS = {
  STUDENT: [
    'view_courses',
    'enroll_courses',
    'take_lessons',
    'view_progress',
    'take_assessments',
    'view_achievements',
    'update_profile',
    'view_certificates'
  ],
  TEACHER: [
    'view_courses',
    'create_courses',
    'edit_courses',
    'delete_courses',
    'view_students',
    'grade_assessments',
    'view_analytics',
    'manage_lessons',
    'view_progress',
    'update_profile'
  ],
  ADMIN: [
    'view_courses',
    'create_courses',
    'edit_courses',
    'delete_courses',
    'view_students',
    'view_teachers',
    'manage_users',
    'view_analytics',
    'manage_system',
    'view_audit_logs',
    'update_profile'
  ],
  SUPERADMIN: [
    'view_courses',
    'create_courses',
    'edit_courses',
    'delete_courses',
    'view_students',
    'view_teachers',
    'view_admins',
    'manage_users',
    'manage_roles',
    'view_analytics',
    'manage_system',
    'view_audit_logs',
    'system_configuration',
    'update_profile'
  ]
} as const

export const RESOURCE_PERMISSIONS = {
  courses: {
    view: ['STUDENT', 'TEACHER', 'ADMIN', 'SUPERADMIN'],
    create: ['TEACHER', 'ADMIN', 'SUPERADMIN'],
    edit: ['TEACHER', 'ADMIN', 'SUPERADMIN'],
    delete: ['ADMIN', 'SUPERADMIN']
  },
  users: {
    view: ['TEACHER', 'ADMIN', 'SUPERADMIN'],
    create: ['ADMIN', 'SUPERADMIN'],
    edit: ['ADMIN', 'SUPERADMIN'],
    delete: ['SUPERADMIN']
  },
  system: {
    view: ['ADMIN', 'SUPERADMIN'],
    configure: ['SUPERADMIN']
  },
  analytics: {
    view: ['TEACHER', 'ADMIN', 'SUPERADMIN'],
    export: ['ADMIN', 'SUPERADMIN']
  }
} as const

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
          
          // Role-based demo login
          let userRole: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPERADMIN' = 'STUDENT'
          let userName = email.split('@')[0]
          
          // Check for specific demo accounts
          if (email === 'teacher@example.com' && password === 'password') {
            userRole = 'TEACHER'
            userName = 'Demo Teacher'
          } else if (email === 'admin@example.com' && password === 'password') {
            userRole = 'ADMIN'
            userName = 'Demo Admin'
          } else if (email === 'superadmin@example.com' && password === 'password') {
            userRole = 'SUPERADMIN'
            userName = 'Demo Super Admin'
          } else if (email === 'student@example.com' && password === 'password') {
            userRole = 'STUDENT'
            userName = 'Demo Student'
          } else {
            // For any other email/password combination, create a student user
            userRole = 'STUDENT'
            userName = email.split('@')[0]
          }
          
          console.log('🎭 Demo login detected for role:', userRole)
          
          // Check if this user has logged in before by looking at login history
          const loginHistory = JSON.parse(localStorage.getItem('loginHistory') || '{}')
          const userLoginHistory = loginHistory[email] || { count: 0, firstLogin: null, lastLogin: null }
          const isReturningUser = userLoginHistory.count > 0
          
          console.log('🔍 Login History Check:', {
            email,
            userRole,
            userLoginHistory,
            isReturningUser,
            loginCount: userLoginHistory.count
          })
          
          // Load saved avatar from localStorage if user has one
          let savedAvatar = null
          if (isReturningUser) {
            const userData = JSON.parse(localStorage.getItem('users') || '{}')
            savedAvatar = userData[email]?.avatar || null
          }
          
          const user: User = {
            id: isReturningUser ? userLoginHistory.userId || `user_${Date.now()}` : `user_${Date.now()}`,
            email,
            name: userName,
            role: userRole,
            age: 25,
            grade: 'College',
            school: 'Demo University',
            interests: ['English', 'Tagalog'],
            nativeLanguage: 'Filipino',
            targetLanguages: ['English', 'Tagalog'],
            avatar: savedAvatar,
            createdAt: isReturningUser ? userLoginHistory.firstLogin : new Date().toISOString(),
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
          
          // Track login count for returning users
          const newLoginCount = userLoginHistory.count + 1
          const now = new Date().toISOString()
          
          // Update login history
          loginHistory[email] = {
            count: newLoginCount,
            userId: user.id,
            firstLogin: userLoginHistory.firstLogin || now,
            lastLogin: now,
            email: email
          }
          localStorage.setItem('loginHistory', JSON.stringify(loginHistory))
          
          set((state) => ({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            actionLogs: [...state.actionLogs, actionLog]
          }))
          
          const getReturningUserMessage = (name: string, count: number) => {
            const messages = [
              `Welcome back, ${name}! This is your ${count}${count === 2 ? 'nd' : count === 3 ? 'rd' : count > 3 ? 'th' : 'st'} time here! 🎉`,
              `Great to see you again, ${name}! You're becoming a regular! 🌟`,
              `Welcome back, ${name}! Your dedication to learning is inspiring! 💪`,
              `Hello again, ${name}! Ready for another amazing learning session? 📚`,
              `Welcome back, ${name}! You're making great progress! 🚀`
            ]
            return messages[(count - 1) % messages.length]
          }
          
          const message = isReturningUser 
            ? getReturningUserMessage(user.name, newLoginCount)
            : `Welcome, ${user.name}! We're excited to have you join us! 🌟`
          
          console.log('📝 Message Generated:', {
            isReturningUser,
            newLoginCount,
            message
          })
          
          toast.success(message, {
            duration: 3000,
            position: 'top-right',
            style: {
              background: isReturningUser ? '#3B82F6' : '#8B5CF6',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: isReturningUser ? '#3B82F6' : '#8B5CF6',
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
            avatar: null,
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
          
          toast.success(`🎓 Welcome to Global Language Training Center, ${newUser.name}! Your learning journey starts now! 🚀`, {
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
          
          // Clear only auth state, preserve user data
          set((state) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            actionLogs: [...state.actionLogs, actionLog]
          }))
          
          // IMPORTANT: Don't clear user data from localStorage
          // Keep: loginHistory, enrolled_courses, user preferences
          // Only clear: auth-storage (handled by Zustand persist)
          
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
          
          // Redirect to home page after logout
          if (typeof window !== 'undefined') {
            window.location.href = '/'
          }
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
        
        console.log('✅ User logged out, auth state cleared, user data preserved')
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

      // Clear all user data (for account deletion)
      clearAllUserData: () => {
        console.log('🗑️ CLEARING ALL USER DATA')
        
        // Clear auth state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
        
        // Clear user data from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('loginHistory')
          localStorage.removeItem('enrolled_courses')
          localStorage.removeItem('course_notes_*')
          localStorage.removeItem('course_bookmarks_*')
          // Keep other localStorage items that might be app-wide
        }
        
        console.log('✅ All user data cleared')
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
          avatar: null,
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

      // Update user avatar
      updateUserAvatar: (avatar: string | null) => {
        const { user } = get()
        if (!user) return
        
        console.log('🖼️ Updating user avatar:', avatar)
        
        // Update user object with new avatar
        const updatedUser = { ...user, avatar }
        
        // Save to localStorage for persistence
        if (user.email) {
          const userData = JSON.parse(localStorage.getItem('users') || '{}')
          if (!userData[user.email]) {
            userData[user.email] = {}
          }
          userData[user.email].avatar = avatar
          localStorage.setItem('users', JSON.stringify(userData))
          console.log('💾 Avatar saved to localStorage:', avatar)
        }
        
        // Update state
        set({ user: updatedUser })
        
        console.log('✅ Avatar updated successfully')
      },

      // Get user action logs
      getUserActionLogs: (userId: string) => {
        const { actionLogs } = get()
        return actionLogs.filter(log => log.userId === userId)
      },

      // Role-based permission functions
      hasPermission: (permission: string) => {
        const { user } = get()
        if (!user) return false
        
        const userPermissions = ROLE_PERMISSIONS[user.role] || []
        return userPermissions.includes(permission)
      },

      hasRole: (role: User['role']) => {
        const { user } = get()
        return user?.role === role
      },

      canAccess: (resource: string, action: string) => {
        const { user } = get()
        if (!user) return false
        
        const resourcePerms = RESOURCE_PERMISSIONS[resource as keyof typeof RESOURCE_PERMISSIONS]
        if (!resourcePerms) return false
        
        const allowedRoles = resourcePerms[action as keyof typeof resourcePerms]
        if (!allowedRoles) return false
        
        return allowedRoles.includes(user.role)
      },

      getRolePermissions: (role: User['role']) => {
        return ROLE_PERMISSIONS[role] || []
      },

      updateUserRole: async (userId: string, newRole: User['role']) => {
        const { user } = get()
        if (!user || !user.canAccess('users', 'edit')) {
          throw new Error('Insufficient permissions to update user role')
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Log the role change action
        const actionLog: UserAction = {
          id: `action_${Date.now()}`,
          userId: user.id,
          action: 'ROLE_UPDATE',
          details: `Role updated for user ${userId} to ${newRole}`,
          timestamp: new Date().toISOString()
        }
        
        set((state) => ({
          actionLogs: [...state.actionLogs, actionLog]
        }))
        
        console.log('✅ User role updated successfully')
        return true
      },

      deactivateUser: async (userId: string) => {
        const { user } = get()
        if (!user || !user.canAccess('users', 'edit')) {
          throw new Error('Insufficient permissions to deactivate user')
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Log the deactivation action
        const actionLog: UserAction = {
          id: `action_${Date.now()}`,
          userId: user.id,
          action: 'USER_DEACTIVATION',
          details: `User ${userId} deactivated`,
          timestamp: new Date().toISOString()
        }
        
        set((state) => ({
          actionLogs: [...state.actionLogs, actionLog]
        }))
        
        console.log('✅ User deactivated successfully')
        return true
      },

      activateUser: async (userId: string) => {
        const { user } = get()
        if (!user || !user.canAccess('users', 'edit')) {
          throw new Error('Insufficient permissions to activate user')
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Log the activation action
        const actionLog: UserAction = {
          id: `action_${Date.now()}`,
          userId: user.id,
          action: 'USER_ACTIVATION',
          details: `User ${userId} activated`,
          timestamp: new Date().toISOString()
        }
        
        set((state) => ({
          actionLogs: [...state.actionLogs, actionLog]
        }))
        
        console.log('✅ User activated successfully')
        return true
      },

      // Get dashboard URL based on user role
      getDashboardUrl: (role: User['role']) => {
        switch (role) {
          case 'TEACHER':
            return '/dashboard?role=teacher'
          case 'ADMIN':
          case 'SUPERADMIN':
            return '/dashboard?role=admin'
          case 'STUDENT':
          default:
            return '/dashboard?role=student'
        }
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
