'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Star, Clock, Users, BookOpen, CreditCard, Shield, Play, Flag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores'
import SignupForm from './SignupForm'
import { LoginForm } from './LoginForm'

interface CourseDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  course: {
    id: string
    name: string
    language: string
    flag: string
    level: string
    description: string
    price: string
    originalPrice?: string
    totalLessons: number
    duration: string
    rating: number
    students: number
    features: string[]
    instructor: string
    lastUpdated: string
    certificate: boolean
    lifetimeAccess: boolean
    mobileAccess: boolean
    communityAccess: boolean
  }
}

export function CourseDetailsModal({ isOpen, onClose, course }: CourseDetailsModalProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [enrollmentStep, setEnrollmentStep] = useState<'details' | 'processing' | 'success'>('details')
  const [showSignupForm, setShowSignupForm] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)

  const handleEnroll = async () => {
    console.log('=== ENROLLMENT ATTEMPT ===')
    console.log('isAuthenticated:', isAuthenticated)
    console.log('user:', user)
    console.log('Course data received:', course)
    console.log('Course properties:', Object.keys(course))
    console.log('course.name:', course.name)
    console.log('course.title:', (course as any).title)
    
    if (!isAuthenticated) {
      console.log('User not authenticated, showing signup form')
      // Show signup form instead of alert
      setShowSignupForm(true)
      return
    }

    console.log('User is authenticated, proceeding with enrollment...')

    setIsEnrolling(true)
    setEnrollmentStep('processing')

    try {
      // Simulate enrollment process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Save to localStorage
      const existingEnrollments = JSON.parse(localStorage.getItem('enrolled_courses') || '[]')
      const newEnrollment = {
        id: course.id,
        name: course.name || course.title, // Handle both name and title properties
        title: course.title, // Keep both for compatibility
        language: course.language,
        flag: course.flag,
        level: course.level,
        progress: 0,
        totalLessons: course.totalLessons,
        completedLessons: 0,
        currentLesson: 1,
        rating: course.rating,
        lastAccessed: 'Just now',
        timeSpent: '0h 0m',
        certificate: course.certificate,
        enrolledAt: new Date().toISOString(),
        price: course.price
      }
      
      console.log('New enrollment data being saved:', newEnrollment)

      // Check if already enrolled
      const isAlreadyEnrolled = existingEnrollments.some((enrollment: any) => enrollment.id === course.id)

      if (isAlreadyEnrolled) {
        alert('You are already enrolled in this course!')
        onClose()
        return
      }

      // Add new enrollment
      const updatedEnrollments = [...existingEnrollments, newEnrollment]
      localStorage.setItem('enrolled_courses', JSON.stringify(updatedEnrollments))

      console.log('Course enrolled successfully:', newEnrollment)
      console.log('All enrollments after adding:', updatedEnrollments)
      console.log('Course ID being used for redirect:', course.id)

      // Show success
      setEnrollmentStep('success')

      // Auto-close after showing success
      setTimeout(() => {
        onClose()
        // Redirect to course details page instead of dashboard
        console.log('Redirecting to course details page:', `/courses/${course.id}`)
        console.log('Current authentication state:', useAuthStore.getState().isAuthenticated)
        router.push(`/courses/${course.id}`)
      }, 2000)

    } catch (error) {
      console.error('Enrollment failed:', error)
      alert('Enrollment failed. Please try again.')
      setEnrollmentStep('details')
    } finally {
      setIsEnrolling(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-6xl">{course.flag}</div>
                <div>
                  <h2 className="text-3xl font-bold">{course.name}</h2>
                  <p className="text-primary-100 text-lg">{course.language}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {enrollmentStep === 'details' && (
              <div className="space-y-8">
                {/* Course Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Overview</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">{course.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700">{course.totalLessons} lessons</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className="text-gray-700">{course.rating} rating</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span className="text-gray-700">{course.students.toLocaleString()} students</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Flag className="w-5 h-5 text-red-600" />
                        <span className="text-gray-700">{course.level} level</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">What You'll Learn</h3>
                    <div className="space-y-3">
                      {course.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Course Features */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Certificate</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Lifetime Access</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Mobile Access</span>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Course Price</h3>
                    <div className="text-4xl font-bold text-primary-600 mb-2">
                      {course.price}
                    </div>
                    {course.originalPrice && (
                      <div className="text-lg text-gray-500 line-through">
                        {course.originalPrice}
                      </div>
                    )}
                  </div>
                </div>

                {/* Enrollment Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full py-4 text-lg font-semibold"
                  >
                    {isEnrolling ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing Enrollment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        {isAuthenticated ? `Enroll Now - ${course.price}` : 'Sign Up to Enroll'}
                      </>
                    )}
                  </Button>

                  <div className="text-center mt-4">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <Shield className="w-4 h-4" />
                      <span>30-day money-back guarantee</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {enrollmentStep === 'processing' && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-6"></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enrolling You in the Course</h3>
                <p className="text-gray-600">
                  Please wait while we set up your course access...
                </p>
              </div>
            )}

            {enrollmentStep === 'success' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 Enrollment Successful!</h3>
                <p className="text-gray-600 mb-4">
                  You are now enrolled in <strong>{course.name}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to course details page...
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Signup Form Modal */}
      {showSignupForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <SignupForm />
          </motion.div>
        </motion.div>
      )}

      {/* Login Form Modal */}
      {showLoginForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <LoginForm
              onClose={() => {
                setShowLoginForm(false)
                // If user closes form without completing, close the entire modal
                onClose()
              }}
              onSwitchToSignup={() => {
                setShowLoginForm(false)
                setShowSignupForm(true)
              }}
              onSuccess={() => {
                setShowLoginForm(false)
                // Set flag to show welcome message on dashboard
                localStorage.setItem('show_welcome_message', 'true')
                console.log('Login successful, refreshing page to update auth state...')
                // Refresh page to ensure auth state is updated
                window.location.reload()
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
