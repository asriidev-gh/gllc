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
  lastLogin?: string | null
  loginCount?: number
  /** Account status for admin display */
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  /** Admin notes about the user */
  remarks?: string
  /** Student membership tier (e.g. "new - no membership") */
  membership?: string
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
  /** All registered users (persisted); used e.g. by teacher dashboard to list students */
  registeredUsers: User[]
  /** Sync registeredUsers from localStorage (used when rehydration may have missed or delayed) */
  syncRegisteredUsersFromStorage: () => void
  
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
  /** Admin/superadmin: set a user's password (by userId) */
  setUserPassword: (userId: string, newPassword: string) => Promise<void>
  /** Admin/superadmin: update a user's status and/or remarks */
  updateUserStatusAndRemarks: (userId: string, updates: { status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'; remarks?: string }) => void
  /** Admin/superadmin: update a student's membership (non member, premium member, vip member) */
  updateUserMembership: (userId: string, membership: string) => void
  /** Admin/superadmin: create a new user (e.g. admin) without logging in as them */
  createUserAsAdmin: (data: { name: string; email: string; password: string; role: 'ADMIN' | 'TEACHER' | 'STUDENT' }) => Promise<User>
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
      registeredUsers: [],
      syncRegisteredUsersFromStorage: () => {
        if (typeof window === 'undefined') return
        try {
          const raw = localStorage.getItem('auth-storage')
          if (!raw) return
          const parsed = JSON.parse(raw) as { state?: { registeredUsers?: User[] } }
          const stored = parsed?.state?.registeredUsers
          if (Array.isArray(stored) && stored.length > 0) {
            const current = get().registeredUsers || []
            if (current.length === 0 || current.length < stored.length) {
              set({ registeredUsers: stored })
            }
          }
        } catch (_) {}
      },

      // Login action
      login: async (email: string, password: string) => {
        console.log('🔐 LOGIN ATTEMPT:', email)
        set({ isLoading: true })
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const state = get()
          const registered = state.registeredUsers || []
          const emailLower = email.trim().toLowerCase()
          const existingUser = registered.find((u) => (u.email || '').toLowerCase() === emailLower)
          
          // If user exists in registeredUsers (db), use their stored role and verify password
          if (existingUser) {
            const passwordMatch = (existingUser.password ?? '') === password
            if (!passwordMatch) {
              set({ isLoading: false })
              throw new Error('Invalid email or password')
            }
            const now = new Date().toISOString()
            const user: User = {
              ...existingUser,
              lastLogin: now,
              password: password
            }
            const nextRegistered = registered.map((u) =>
              u.id === existingUser.id ? { ...u, lastLogin: now } : u
            )
            const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const actionLog: UserAction = {
              id: `action_${Date.now()}`,
              userId: user.id,
              action: 'LOGIN',
              details: `User logged in from ${email}`,
              timestamp: now
            }
            set((s) => ({
              ...s,
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              actionLogs: [...s.actionLogs, actionLog],
              registeredUsers: nextRegistered
            }))
            console.log('✅ Login successful (from registered users):', user.email, 'role:', user.role)
            toast.success(`Welcome back, ${user.name}!`, { duration: 3000, position: 'top-right' })
            return user
          }
          
          // User not in registeredUsers (db): reject login – only allow existing accounts with correct password
          set({ isLoading: false })
          throw new Error('Invalid email or password')
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
            createdAt: new Date().toISOString(),
            status: 'ACTIVE',
            remarks: '',
            membership: 'new - no membership'
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
          
          set((state) => {
            const existing = (state.registeredUsers || []).filter((u) => u.email !== newUser.email)
            return {
              user: newUser,
              token,
              isAuthenticated: true,
              isLoading: false,
              actionLogs: [...state.actionLogs, actionLog],
              registeredUsers: [...existing, newUser]
            }
          })

          console.log('✅ User state updated in store')
          
          toast.success(`🎓 Welcome to Global Learning Center, ${newUser.name}! Your learning journey starts now! 🚀`, {
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
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          status: 'ACTIVE',
          remarks: '',
          membership: 'new - no membership'
        }
        
        const demoToken = `demo_token_${Date.now()}`
        
        console.log('✅ Demo user created:', demoUser.email)
        console.log('🔑 Demo token generated:', demoToken)

        set((state) => {
          const existing = (state.registeredUsers || []).filter((u) => u.email !== demoUser.email)
          return {
            registeredUsers: [...existing, demoUser]
          }
        })

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

      // Admin: set another user's password (no current password required)
      setUserPassword: async (userId: string, newPassword: string) => {
        const { user, registeredUsers } = get()
        if (!user || !(user.role === 'ADMIN' || user.role === 'SUPERADMIN')) {
          throw new Error('Only admin or superadmin can change another user\'s password')
        }
        if (!newPassword || newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
        const target = (registeredUsers || []).find((u) => u.id === userId)
        if (!target) throw new Error('User not found')
        const updatedTarget = { ...target, password: newPassword }
        const nextRegistered = (registeredUsers || []).map((u) =>
          u.id === userId ? updatedTarget : u
        )
        set((state) => {
          const next = { registeredUsers: nextRegistered }
          if (state.user?.id === userId) {
            (next as { user: User }).user = updatedTarget
          }
          return next
        })
      },

      updateUserStatusAndRemarks: (userId: string, updates: { status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'; remarks?: string }) => {
        const { user, registeredUsers } = get()
        if (!user || !(user.role === 'ADMIN' || user.role === 'SUPERADMIN')) return
        const nextRegistered = (registeredUsers || []).map((u) =>
          u.id === userId ? { ...u, ...(updates.status !== undefined && { status: updates.status }), ...(updates.remarks !== undefined && { remarks: updates.remarks }) } : u
        )
        set((state) => {
          const next: { registeredUsers: User[]; user?: User } = { registeredUsers: nextRegistered }
          if (state.user?.id === userId) {
            const updated = nextRegistered.find((x) => x.id === userId)
            if (updated) next.user = updated
          }
          return next
        })
      },

      updateUserMembership: (userId: string, membership: string) => {
        const { user, registeredUsers } = get()
        if (!user || !(user.role === 'ADMIN' || user.role === 'SUPERADMIN')) return
        const nextRegistered = (registeredUsers || []).map((u) =>
          u.id === userId ? { ...u, membership } : u
        )
        set((state) => {
          const next: { registeredUsers: User[]; user?: User } = { registeredUsers: nextRegistered }
          if (state.user?.id === userId) {
            const updated = nextRegistered.find((x) => x.id === userId)
            if (updated) next.user = updated
          }
          return next
        })
      },

      createUserAsAdmin: async (data) => {
        const { user, registeredUsers } = get()
        if (!user || !(user.role === 'ADMIN' || user.role === 'SUPERADMIN')) {
          throw new Error('Only admin or superadmin can create users')
        }
        if (!data.email?.trim()) throw new Error('Email is required')
        if (!data.name?.trim()) throw new Error('Name is required')
        if (!data.password || data.password.length < 6) throw new Error('Password must be at least 6 characters')
        const existing = (registeredUsers || []).find((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())
        if (existing) throw new Error('A user with this email already exists')
        const newUser: User = {
          id: `user_${Date.now()}`,
          email: data.email.trim(),
          name: data.name.trim(),
          role: data.role,
          age: 0,
          grade: '',
          school: '',
          interests: [],
          nativeLanguage: '',
          targetLanguages: [],
          avatar: null,
          createdAt: new Date().toISOString(),
          status: 'ACTIVE',
          remarks: '',
          password: data.password,
          ...(data.role === 'STUDENT' ? { membership: 'new - no membership' as const } : {})
        }
        set((state) => ({
          registeredUsers: [...(state.registeredUsers || []), newUser]
        }))
        toast.success(`User ${newUser.name} (${data.role}) created successfully.`)
        return newUser
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
        const { user, canAccess, registeredUsers } = get()
        if (!user || !canAccess('users', 'edit')) {
          throw new Error('Insufficient permissions to update user role')
        }
        const target = (registeredUsers || []).find((u) => u.id === userId)
        if (!target) throw new Error('User not found')

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300))

        const nextRegistered = (registeredUsers || []).map((u) =>
          u.id === userId ? { ...u, role: newRole } : u
        )

        const actionLog: UserAction = {
          id: `action_${Date.now()}`,
          userId: user.id,
          action: 'ROLE_UPDATE',
          details: `Role updated for user ${userId} to ${newRole}`,
          timestamp: new Date().toISOString()
        }

        set((state) => {
          const next: { registeredUsers: User[]; actionLogs: UserAction[]; user?: User } = {
            registeredUsers: nextRegistered,
            actionLogs: [...state.actionLogs, actionLog]
          }
          if (state.user?.id === userId) {
            next.user = { ...state.user, role: newRole }
          }
          return next
        })

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
        actionLogs: state.actionLogs,
        registeredUsers: state.registeredUsers
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
