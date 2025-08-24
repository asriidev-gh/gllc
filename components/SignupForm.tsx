'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores'
import { Button } from '@/components/ui/Button'

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  age: string
  grade: string
  school: string
  interests: string[]
  nativeLanguage: string
  targetLanguages: string[]
}

interface FormErrors {
  [key: string]: string
}

const availableLanguages = ['English', 'Tagalog', 'Korean', 'Japanese', 'Chinese', 'Spanish', 'French', 'German']
const availableGrades = ['Elementary', 'High School', 'College', 'University', 'Graduate School']

export default function SignupForm() {
  console.log('🚀 SignupForm component rendered')
  
  const router = useRouter()
  const { register, isLoading } = useAuthStore()
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    grade: '',
    school: '',
    interests: [],
    nativeLanguage: '',
    targetLanguages: []
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    console.log('🚀 Validating form...')
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.age) {
      newErrors.age = 'Age is required'
    } else if (parseInt(formData.age) < 5 || parseInt(formData.age) > 100) {
      newErrors.age = 'Age must be between 5 and 100'
    }

    if (!formData.grade) {
      newErrors.grade = 'Grade level is required'
    }

    if (!formData.school.trim()) {
      newErrors.school = 'School is required'
    }

    if (formData.interests.length === 0) {
      newErrors.interests = 'Please select at least one interest'
    }

    if (!formData.nativeLanguage) {
      newErrors.nativeLanguage = 'Native language is required'
    }

    if (formData.targetLanguages.length === 0) {
      newErrors.targetLanguages = 'Please select at least one target language'
    }

    console.log('🚀 Validation errors:', newErrors)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 === FORM SUBMISSION STARTED ===')
    console.log('🚀 Event type:', e.type)
    console.log('🚀 Form submitted, validating...')
    console.log('🚀 Form data:', formData)
    
    const isValid = validateForm()
    console.log('🚀 Validation result:', isValid)
    console.log('🚀 Current errors:', errors)
    
    if (!isValid) {
      console.log('❌ Form validation failed')
      return
    }

    try {
      console.log('🚀 Calling register function...')
      console.log('🚀 Register function:', register)
      console.log('🚀 Is function?', typeof register === 'function')
      
      const user = await register(formData)
      console.log('✅ Registration successful:', user)
      console.log('🚀 Redirecting to dashboard...')
      
      // Redirect to dashboard after successful registration
      router.push('/dashboard')
    } catch (error) {
      console.error('❌ Registration failed:', error)
      setErrors({ submit: 'Registration failed. Please try again.' })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleCheckboxChange = (field: 'interests' | 'targetLanguages', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
    
    // Clear error when user makes selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleLanguageChange = (field: 'nativeLanguage' | 'targetLanguages', value: string) => {
    if (field === 'targetLanguages') {
      handleCheckboxChange('targetLanguages', value)
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }))
      }
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Test Form Button */}
        <button
          type="button"
          onClick={() => console.log('🚀 Test Form button clicked!')}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 mb-4"
        >
          Test Form
        </button>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="First Name"
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Last Name"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Email"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Password"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm Password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Age *
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              min="5"
              max="100"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.age ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Age"
            />
            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
          </div>

          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
              Grade Level *
            </label>
            <select
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.grade ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Grade</option>
              {availableGrades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
            School/Institution *
          </label>
          <input
            type="text"
            id="school"
            name="school"
            value={formData.school}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.school ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="School/Institution"
          />
          {errors.school && <p className="text-red-500 text-xs mt-1">{errors.school}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interests *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableLanguages.map(language => (
              <label key={language} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.interests.includes(language)}
                  onChange={() => handleCheckboxChange('interests', language)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{language}</span>
              </label>
            ))}
          </div>
          {errors.interests && <p className="text-red-500 text-xs mt-1">{errors.interests}</p>}
        </div>

        <div>
          <label htmlFor="nativeLanguage" className="block text-sm font-medium text-gray-700 mb-1">
            Native Language *
          </label>
          <select
            id="nativeLanguage"
            name="nativeLanguage"
            value={formData.nativeLanguage}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.nativeLanguage ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Native Language</option>
            {availableLanguages.map(language => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
          {errors.nativeLanguage && <p className="text-red-500 text-xs mt-1">{errors.nativeLanguage}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Languages *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableLanguages.map(language => (
              <label key={language} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.targetLanguages.includes(language)}
                  onChange={() => handleLanguageChange('targetLanguages', language)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{language}</span>
              </label>
            ))}
          </div>
          {errors.targetLanguages && <p className="text-red-500 text-xs mt-1">{errors.targetLanguages}</p>}
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          onClick={() => console.log('🚀 Submit button clicked!')}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}
