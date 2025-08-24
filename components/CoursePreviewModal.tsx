'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Clock, Users, Star, BookOpen, Target, Globe, CheckCircle, ArrowRight, User, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores'
import SignupForm from '@/components/SignupForm'
import { LoginForm } from '@/components/LoginForm'

interface CoursePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  courseName: string | null
}

const courseData = {
  tagalog: {
    name: 'Tagalog Basics',
    nativeName: 'Wikang Tagalog',
    flag: '🇵🇭',
    level: 'Beginner',
    description: 'Master the fundamentals of Tagalog with cultural context and modern usage. Perfect for beginners who want to learn the national language of the Philippines.',
    features: [
      'Learn basic greetings and introductions',
      'Master essential vocabulary and phrases',
      'Understand Filipino culture and customs',
      'Practice pronunciation with native speakers',
      'Build confidence in everyday conversations'
    ],
    curriculum: [
      { week: 1, title: 'Introduction to Tagalog', topics: ['Basic greetings', 'Numbers 1-10', 'Simple introductions'] },
      { week: 2, title: 'Family and Relationships', topics: ['Family members', 'Possessive pronouns', 'Basic questions'] },
      { week: 3, title: 'Food and Dining', topics: ['Common foods', 'Ordering at restaurants', 'Table manners'] },
      { week: 4, title: 'Daily Activities', topics: ['Daily routines', 'Time expressions', 'Action verbs'] },
      { week: 5, title: 'Shopping and Services', topics: ['Shopping vocabulary', 'Asking for help', 'Basic transactions'] },
      { week: 6, title: 'Cultural Context', topics: ['Filipino values', 'Social customs', 'Regional variations'] }
    ],
    stats: {
      students: 2500,
      lessons: 80,
      duration: '3-6 months',
      rating: 4.8,
      completionRate: '92%'
    },
    price: 'Free',
    originalPrice: null
  },
  english: {
    name: 'English Mastery',
    nativeName: 'English',
    flag: '🇺🇸',
    level: 'Beginner to Intermediate',
    description: 'Comprehensive English course designed for academic success, career advancement, and global communication.',
    features: [
      'Master essential grammar and vocabulary',
      'Improve speaking and listening skills',
      'Develop academic writing abilities',
      'Build business communication skills',
      'Prepare for international exams'
    ],
    curriculum: [
      { week: 1, title: 'Foundation Skills', topics: ['Basic grammar', 'Essential vocabulary', 'Pronunciation'] },
      { week: 2, title: 'Conversation Skills', topics: ['Daily conversations', 'Asking questions', 'Giving opinions'] },
      { week: 3, title: 'Academic Writing', topics: ['Essay structure', 'Research skills', 'Citation methods'] },
      { week: 4, title: 'Business English', topics: ['Professional emails', 'Meetings', 'Presentations'] },
      { week: 5, title: 'Advanced Communication', topics: ['Debates', 'Negotiations', 'Public speaking'] },
      { week: 6, title: 'Exam Preparation', topics: ['TOEFL/IELTS practice', 'Test strategies', 'Time management'] }
    ],
    stats: {
      students: 3200,
      lessons: 120,
      duration: '6-12 months',
      rating: 4.7,
      completionRate: '88%'
    },
    price: '$39.99',
    originalPrice: '$69.99'
  },
  korean: {
    name: 'Korean Essentials',
    nativeName: '한국어',
    flag: '🇰🇷',
    level: 'Beginner',
    description: 'Learn Korean through K-pop culture, music, and entertainment. Perfect for fans who want to understand Korean media and culture.',
    features: [
      'Master Hangul writing system',
      'Learn K-pop and entertainment vocabulary',
      'Understand Korean culture and customs',
      'Build conversational skills',
      'Connect with Korean communities'
    ],
    curriculum: [
      { week: 1, title: 'Hangul Mastery', topics: ['Consonants and vowels', 'Syllable formation', 'Writing practice'] },
      { week: 2, title: 'Basic Greetings', topics: ['Hello and goodbye', 'Introductions', 'Politeness levels'] },
      { week: 3, title: 'K-pop Culture', topics: ['Music vocabulary', 'Fan expressions', 'Entertainment terms'] },
      { week: 4, title: 'Daily Life', topics: ['Food and drinks', 'Shopping', 'Transportation'] },
      { week: 5, title: 'Social Interactions', topics: ['Making friends', 'Expressing feelings', 'Cultural etiquette'] },
      { week: 6, title: 'Advanced Topics', topics: ['Complex sentences', 'Idioms', 'Regional dialects'] }
    ],
    stats: {
      students: 1800,
      lessons: 95,
      duration: '8-15 months',
      rating: 4.9,
      completionRate: '94%'
    },
    price: '$24.99',
    originalPrice: '$39.99'
  },
  japanese: {
    name: 'Japanese Fundamentals',
    nativeName: '日本語',
    flag: '🇯🇵',
    level: 'Beginner',
    description: 'Master Japanese through anime, manga, and pop culture. Learn the language while exploring Japanese entertainment and traditions.',
    features: [
      'Learn Hiragana and Katakana',
      'Master basic grammar structures',
      'Understand anime and manga vocabulary',
      'Explore Japanese culture',
      'Build conversational confidence'
    ],
    curriculum: [
      { week: 1, title: 'Writing Systems', topics: ['Hiragana basics', 'Katakana basics', 'Writing practice'] },
      { week: 2, title: 'Basic Grammar', topics: ['Particles', 'Verb conjugation', 'Simple sentences'] },
      { week: 3, title: 'Anime & Manga', topics: ['Character vocabulary', 'Story expressions', 'Cultural references'] },
      { week: 4, title: 'Daily Conversations', topics: ['Greetings', 'Self-introductions', 'Basic questions'] },
      { week: 5, title: 'Cultural Context', topics: ['Japanese customs', 'Social etiquette', 'Traditional values'] },
      { week: 6, title: 'Advanced Basics', topics: ['Complex sentences', 'Honorific language', 'Regional variations'] }
    ],
    stats: {
      students: 1600,
      lessons: 110,
      duration: '10-18 months',
      rating: 4.8,
      completionRate: '91%'
    },
    price: '$34.99',
    originalPrice: '$59.99'
  },
  chinese: {
    name: 'Chinese Business',
    nativeName: '中文',
    flag: '🇨🇳',
    level: 'Advanced',
    description: 'Professional Chinese for international business and trade. Master business communication and cultural understanding.',
    features: [
      'Business vocabulary and expressions',
      'Trade and negotiation terms',
      'Cultural business etiquette',
      'Professional writing skills',
      'International trade communication'
    ],
    curriculum: [
      { week: 1, title: 'Business Fundamentals', topics: ['Company vocabulary', 'Job titles', 'Office expressions'] },
      { week: 2, title: 'Trade and Commerce', topics: ['Import/export terms', 'Pricing', 'Quality standards'] },
      { week: 3, title: 'Negotiations', topics: ['Bargaining phrases', 'Agreement terms', 'Conflict resolution'] },
      { week: 4, title: 'Cultural Business', topics: ['Guanxi (relationships)', 'Face-saving', 'Business gifts'] },
      { week: 5, title: 'Professional Writing', topics: ['Business letters', 'Contracts', 'Reports'] },
      { week: 6, title: 'Advanced Communication', topics: ['Presentations', 'Meetings', 'Networking'] }
    ],
    stats: {
      students: 1200,
      lessons: 85,
      duration: '12-20 months',
      rating: 4.6,
      completionRate: '87%'
    },
    price: '$49.99',
    originalPrice: '$79.99'
  },
  spanish: {
    name: 'Latin American Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    level: 'Beginner',
    description: 'Learn Spanish with focus on Latin American culture and dialects. Perfect for travel, business, and cultural connections.',
    features: [
      'Latin American dialects',
      'Cultural context and customs',
      'Travel and tourism vocabulary',
      'Business Spanish skills',
      'Regional variations understanding'
    ],
    curriculum: [
      { week: 1, title: 'Spanish Basics', topics: ['Alphabet and pronunciation', 'Basic greetings', 'Numbers and colors'] },
      { week: 2, title: 'Travel Spanish', topics: ['Airport vocabulary', 'Hotel phrases', 'Directions and transportation'] },
      { week: 3, title: 'Food and Dining', topics: ['Restaurant vocabulary', 'Traditional dishes', 'Ordering food'] },
      { week: 4, title: 'Cultural Immersion', topics: ['Festivals and celebrations', 'Family traditions', 'Social customs'] },
      { week: 5, title: 'Business Spanish', topics: ['Professional vocabulary', 'Meeting expressions', 'Email writing'] },
      { week: 6, title: 'Regional Variations', topics: ['Mexican Spanish', 'Argentine Spanish', 'Colombian Spanish'] }
    ],
    stats: {
      students: 900,
      lessons: 70,
      duration: '6-10 months',
      rating: 4.7,
      completionRate: '89%'
    },
    price: '$19.99',
    originalPrice: '$34.99'
  }
}

export function CoursePreviewModal({ isOpen, onClose, courseName }: CoursePreviewModalProps) {
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)
  const [showSignupForm, setShowSignupForm] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const { user, isAuthenticated } = useAuthStore()
  
  if (!isOpen || !courseName) return null
  
  const course = courseData[courseName as keyof typeof courseData]
  
  if (!course) {
    return null
  }

  const handleEnroll = async () => {
    setIsEnrolling(true)
    
    // Simulate enrollment process
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsEnrolling(false)
    
    // For now, let's always show the signup prompt to test the flow
    // In production, you'd check isAuthenticated here
    setShowSignupPrompt(true)
    
    // Uncomment this when you have proper authentication:
    /*
    if (isAuthenticated) {
      // User is logged in - proceed with enrollment
      console.log(`Enrolling ${user?.name} in ${course.name}`)
      
      // In a real app, this would:
      // 1. Create enrollment record in database
      // 2. Grant access to course content
      // 2. Redirect to course dashboard
      
      // For now, show success and redirect to course page
      alert(`🎉 Successfully enrolled in ${course.name}! Redirecting to course...`)
      
      // Simulate redirect to course page
      setTimeout(() => {
        onClose()
        // In real app: router.push(`/courses/${courseName}`)
      }, 1000)
    } else {
      // User is not logged in - show signup prompt
      setShowSignupPrompt(true)
    }
    */
  }

  return (
    <>
      {/* Main Course Preview Modal */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-6xl">{course.flag}</div>
                  <div>
                    <h2 className="text-3xl font-bold">{course.name}</h2>
                    <p className="text-primary-100 text-lg">{course.nativeName}</p>
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
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Course Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Course Overview</h3>
                    <p className="text-gray-600 leading-relaxed">{course.description}</p>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">What You'll Learn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Curriculum */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">6-Week Curriculum</h3>
                    <div className="space-y-3">
                      {course.curriculum.map((week, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Week {week.week}: {week.title}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {week.topics.map((topic, topicIndex) => (
                              <span key={topicIndex} className="text-sm bg-white text-gray-600 px-3 py-1 rounded-full border">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Stats & Enrollment */}
                <div className="space-y-6">
                  {/* Course Stats */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Students Enrolled</span>
                        <span className="font-semibold text-primary-600">{course.stats.students.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Lessons</span>
                        <span className="font-semibold text-secondary-600">{course.stats.lessons}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-semibold text-accent-600">{course.stats.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Rating</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-semibold text-gray-900 ml-1">{course.stats.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Completion Rate</span>
                        <span className="font-semibold text-success-600">{course.stats.completionRate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Enrollment Card */}
                  <div className="bg-white border-2 border-primary-200 rounded-xl p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start?</h3>
                      <div className="text-4xl font-bold text-primary-600 mb-2">
                        {course.price}
                      </div>
                      {course.originalPrice && (
                        <div className="text-lg text-gray-500 line-through">
                          {course.originalPrice}
                        </div>
                      )}
                    </div>

                    <Button 
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                      className="w-full py-3 text-lg font-semibold mb-4"
                    >
                      {isEnrolling ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Enrolling...
                        </>
                      ) : (
                        <>
                          Start Learning Now
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>





                    <div className="text-center text-sm text-gray-500">
                      <p>✓ Instant access to all lessons</p>
                      <p>✓ 30-day money-back guarantee</p>
                      <p>✓ Certificate upon completion</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Signup Prompt Modal - SEPARATE from main modal */}
      <AnimatePresence>
        {showSignupPrompt && (
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
              className="bg-white rounded-2xl max-w-md w-full p-8 text-center"
            >
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Start Learning?
              </h3>
              <p className="text-gray-600 mb-6">
                To enroll in <strong>{course.name}</strong>, you'll need to create an account or sign in.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    setShowSignupPrompt(false)
                    setShowSignupForm(true)
                  }}
                  className="w-full py-3 text-lg font-semibold"
                >
                  <User className="w-5 h-5 mr-2" />
                  Create Account
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowSignupPrompt(false)
                    setShowLoginForm(true)
                  }}
                  className="w-full py-3 text-lg font-semibold"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              </div>
              
              <button
                onClick={() => setShowSignupPrompt(false)}
                className="text-gray-500 hover:text-gray-700 mt-4 text-sm underline"
              >
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signup Form Modal */}
      <AnimatePresence>
        {showSignupForm && (
          <SignupForm />
        )}
      </AnimatePresence>

      {/* Login Form Modal */}
      <AnimatePresence>
        {showLoginForm && (
          <LoginForm
            onClose={() => setShowLoginForm(false)}
            onSwitchToSignup={() => {
              setShowLoginForm(false)
              setShowSignupForm(true)
            }}
            courseName={course.name}
          />
        )}
      </AnimatePresence>


    </>
  )
}
