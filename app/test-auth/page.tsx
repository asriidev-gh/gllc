'use client'

import { useAuthStore, useCoursesStore, useUserStore } from '@/stores'
import { Button } from '@/components/ui/Button'

export default function TestAuthPage() {
  const { user, isAuthenticated, isLoading, login, logout, register, clearAuth, checkAuthStatus, createDemoUser } = useAuthStore()
  const { courses, enrollments, fetchCourses, enrollInCourse } = useCoursesStore()
  const { profile, updateProfile } = useUserStore()

  const testLogin = async () => {
    try {
      await login('student@example.com', 'password123')
      console.log('Login successful')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const testRegister = async () => {
    try {
      const newUser = await register({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        age: '25',
        grade: 'College',
        school: 'Test University',
        interests: ['English', 'Tagalog'],
        nativeLanguage: 'Filipino',
        targetLanguages: ['English', 'Tagalog']
      })
      console.log('Registration successful:', newUser)
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  const testClearAuth = () => {
    clearAuth()
    console.log('Auth cleared')
  }

  const authenticateDemoUser = () => {
    createDemoUser()
    console.log('Demo user manually authenticated')
  }

  const fixAuthState = () => {
    // Check if user data exists but no token
    const userData = localStorage.getItem('user_data')
    const token = localStorage.getItem('auth_token')
    
    if (userData && !token) {
      // Create token for existing user
      localStorage.setItem('auth_token', `fixed_token_${Date.now()}`)
      console.log('✅ Fixed auth state - created token for existing user')
      window.location.reload()
    } else if (!userData && token) {
      // Remove orphaned token
      localStorage.removeItem('auth_token')
      console.log('✅ Fixed auth state - removed orphaned token')
      window.location.reload()
    } else {
      console.log('Auth state appears to be correct')
    }
  }

  const resetAppState = () => {
    // Clear everything and reset to first load state
    localStorage.clear()
    console.log('✅ App state completely reset')
    window.location.reload()
  }

  const debugUserDataMismatch = () => {
    const userData = localStorage.getItem('user_data')
    const token = localStorage.getItem('auth_token')
    
    console.log('=== DEBUG USER DATA MISMATCH ===')
    console.log('Token:', token)
    console.log('User data:', userData)
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log('Parsed user:', parsedUser)
        console.log('User email:', parsedUser.email)
        console.log('Is demo user:', parsedUser.email === 'student@example.com')
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
    
    // Check if we have a token but wrong user data
    if (token && userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.email === 'student@example.com') {
        console.log('❌ Found demo user data but have a token - this is the problem!')
        console.log('The demo user data is being preserved instead of signup data')
      }
    }
    
    console.log('=== END DEBUG ===')
  }

  const createTestSignupUser = () => {
    // Create a test user that should replace the demo user
    const testUser = {
      id: 'test_signup_user',
      email: 'test@example.com',
      name: 'Test Signup User',
      role: 'STUDENT',
      age: 25,
      grade: 'College',
      school: 'Test University',
      interests: ['English', 'Korean'],
      nativeLanguage: 'Filipino',
      targetLanguages: ['English', 'Korean']
    }
    
    localStorage.setItem('user_data', JSON.stringify(testUser))
    console.log('✅ Created test signup user:', testUser)
    console.log('Now check if this user data persists or gets overwritten')
  }

  const clearDemoData = () => {
    // Remove any demo user data and tokens
    const userData = localStorage.getItem('user_data')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        if (parsedUser.email === 'student@example.com') {
          localStorage.removeItem('user_data')
          localStorage.removeItem('auth_token')
          console.log('✅ Demo user data cleared')
          window.location.reload()
        } else {
          console.log('No demo user data found to clear')
        }
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    } else {
      console.log('No user data found to clear')
    }
  }

  const verifySignupFlow = () => {
    // Simulate what should happen during signup
    console.log('=== SIMULATING SIGNUP FLOW ===')
    
    const testSignupData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      age: '25',
      grade: 'College',
      school: 'Test University',
      interests: ['English', 'Korean'],
      nativeLanguage: 'Filipino',
      targetLanguages: ['English', 'Korean']
    }
    
    console.log('Test signup data:', testSignupData)
    
    // Create user object
    const newUser = {
      id: Date.now().toString(),
      email: testSignupData.email,
      name: `${testSignupData.firstName} ${testSignupData.lastName}`,
      role: 'STUDENT',
      age: parseInt(testSignupData.age),
      grade: testSignupData.grade,
      school: testSignupData.school,
      interests: testSignupData.interests,
      nativeLanguage: testSignupData.nativeLanguage,
      targetLanguages: testSignupData.targetLanguages
    }
    
    console.log('Created user object:', newUser)
    
    // Save to localStorage (simulating register function)
    localStorage.setItem('user_data', JSON.stringify(newUser))
    localStorage.setItem('auth_token', `test_token_${Date.now()}`)
    
    console.log('✅ User data and token saved to localStorage')
    
    // Verify what was saved
    const storedUser = localStorage.getItem('user_data')
    const storedToken = localStorage.getItem('auth_token')
    
    console.log('=== VERIFICATION ===')
    console.log('Stored user data:', storedUser)
    console.log('Stored token:', storedToken)
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      console.log('Parsed user:', parsedUser)
      console.log('Email match:', parsedUser.email === testSignupData.email ? '✅' : '❌')
    }
    
    console.log('=== END SIMULATION ===')
  }

  const startLocalStorageMonitor = () => {
    console.log('🔍 Starting localStorage monitor...')
    
    // Monitor localStorage changes
    const originalSetItem = localStorage.setItem
    const originalRemoveItem = localStorage.removeItem
    const originalClear = localStorage.clear
    
    localStorage.setItem = function(key, value) {
      console.log(`🔍 localStorage.setItem called: ${key} = ${value}`)
      if (key === 'user_data') {
        try {
          const parsed = JSON.parse(value as string)
          console.log(`🔍 User data being set: ${parsed.email}`)
        } catch (e) {
          console.log(`🔍 User data being set (unparseable): ${value}`)
        }
      }
      return originalSetItem.call(this, key, value)
    }
    
    localStorage.removeItem = function(key) {
      console.log(`🔍 localStorage.removeItem called: ${key}`)
      return originalRemoveItem.call(this, key)
    }
    
    localStorage.clear = function() {
      console.log(`🔍 localStorage.clear called`)
      return originalClear.call(this)
    }
    
    console.log('✅ localStorage monitor started - all changes will be logged')
  }

  // Simple test form
  const handleSimpleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 Simple test form submitted!')
    
    try {
      const result = await register({
        firstName: 'Simple',
        lastName: 'Test',
        email: 'simple@test.com',
        password: 'password123',
        age: '30',
        grade: 'College',
        school: 'Test School',
        interests: ['English'],
        nativeLanguage: 'Filipino',
        targetLanguages: ['English']
      })
      console.log('✅ Simple test registration successful:', result)
    } catch (error) {
      console.error('❌ Simple test registration failed:', error)
    }
  }

  const testCourses = async () => {
    try {
      await fetchCourses()
      console.log('Courses fetched successfully')
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  const testEnrollment = async () => {
    if (!user) {
      console.log('No user logged in for enrollment test')
      return
    }
    
    try {
      const enrollment = await enrollInCourse('course_1', user.id)
      console.log('Enrollment successful:', enrollment)
    } catch (error) {
      console.error('Enrollment failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
        
        {/* Simple Test Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Simple Test Form</h2>
          <form onSubmit={handleSimpleTestSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Registration
              </label>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Test Register (Simple Form)
              </button>
            </div>
          </form>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Current State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Current State</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
              <p><strong>Courses:</strong> {courses.length}</p>
              <p><strong>Enrollments:</strong> {enrollments.length}</p>
              <p><strong>Profile:</strong> {profile ? 'Present' : 'None'}</p>
            </div>
          </div>

          {/* Zustand Store Debug */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Zustand Store Debug</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Auth Store:</strong> {typeof useAuthStore !== 'undefined' ? 'Loaded' : 'Not Loaded'}</p>
              <p><strong>Courses Store:</strong> {typeof useCoursesStore !== 'undefined' ? 'Loaded' : 'Not Loaded'}</p>
              <p><strong>User Store:</strong> {typeof useUserStore !== 'undefined' ? 'Loaded' : 'Not Loaded'}</p>
              <p><strong>localStorage Keys:</strong> {typeof window !== 'undefined' ? Object.keys(localStorage).join(', ') : 'SSR'}</p>
            </div>
          </div>

          {/* Test Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            <div className="space-y-3">
              <Button onClick={testLogin} className="w-full">
                Test Login (student@example.com)
              </Button>
              <Button onClick={testRegister} className="w-full">
                Test Register (test@example.com)
              </Button>
              <Button onClick={logout} className="w-full" variant="outline">
                Logout
              </Button>
              <Button onClick={testClearAuth} className="w-full" variant="outline">
                Clear Auth
              </Button>
              <Button onClick={checkAuthStatus} className="w-full" variant="outline">
                Check Auth Status
              </Button>
              <Button onClick={authenticateDemoUser} className="w-full" variant="outline">
                Authenticate Demo User
              </Button>
              <Button onClick={fixAuthState} className="w-full" variant="outline">
                Fix Auth State
              </Button>
              <Button onClick={resetAppState} className="w-full" variant="outline">
                Reset App State
              </Button>
              <Button onClick={debugUserDataMismatch} className="w-full" variant="outline">
                Debug User Data Mismatch
              </Button>
              <Button onClick={createTestSignupUser} className="w-full" variant="outline">
                Create Test Signup User
              </Button>
              <Button onClick={clearDemoData} className="w-full" variant="outline">
                Clear Demo Data
              </Button>
              <Button onClick={verifySignupFlow} className="w-full" variant="outline">
                Verify Signup Flow
              </Button>
              <Button onClick={startLocalStorageMonitor} className="w-full" variant="outline">
                Start localStorage Monitor
              </Button>
            </div>
          </div>

          {/* Course Testing */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Course Testing</h2>
            <div className="space-y-3">
              <Button onClick={testCourses} className="w-full">
                Fetch Courses
              </Button>
              <Button onClick={testEnrollment} className="w-full" variant="outline">
                Test Enrollment
              </Button>
            </div>
          </div>

          {/* Manual localStorage Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Manual localStorage Actions</h2>
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  localStorage.setItem('auth_token', 'test_token_' + Date.now())
                  localStorage.setItem('user_data', JSON.stringify({
                    id: 'test_id',
                    email: 'test@example.com',
                    name: 'Test User',
                    role: 'STUDENT'
                  }))
                  window.location.reload()
                }} 
                className="w-full"
                variant="outline"
              >
                Set Test Data & Reload
              </Button>
              <Button 
                onClick={() => {
                  localStorage.clear()
                  window.location.reload()
                }} 
                className="w-full"
                variant="outline"
              >
                Clear All & Reload
              </Button>
            </div>
          </div>
        </div>

        {/* Debug Console */}
        <div className="mt-8 bg-black text-green-400 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Debug Console</h3>
          <p className="text-sm">Open browser console to see authentication logs</p>
        </div>
      </div>
    </div>
  )
}
