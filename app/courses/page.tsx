'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Filter,
  Search,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore, useCoursesStore } from '@/stores'
import { Header } from '@/components/Header'
import { CourseDetailsModal } from '@/components/CourseDetailsModal'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'
import { recordCourseBrowsing, recordLearningActivity } from '@/lib/learningActivity'

const mockCourses = [
  {
    id: 'course_1',
    title: 'English for Beginners',
    description: 'Master the fundamentals of English with interactive lessons and real-world practice.',
    language: 'English',
    flag: '🇺🇸',
    level: 'BEGINNER',
    duration: '8 weeks',
    lessons: 24,
    instructor: 'Sarah Johnson',
    price: 99.99,
    originalPrice: 149.99,
    rating: 4.8,
    students: 2500,
    image: '/api/placeholder/300/200',
    features: ['Interactive Lessons', 'Speaking Practice', 'Grammar Exercises', 'Vocabulary Building'],
    category: ['Language', 'Beginner']
  },
  {
    id: 'course_2',
    title: 'Tagalog Conversation Mastery',
    description: 'Learn to speak Tagalog confidently in everyday situations with native speakers.',
      language: 'Tagalog',
      flag: '🇵🇭',
    level: 'INTERMEDIATE',
    duration: '6 weeks',
    lessons: 18,
      instructor: 'Maria Santos',
    price: 79.99,
    originalPrice: 119.99,
    rating: 4.9,
    students: 1200,
    image: '/api/placeholder/300/200',
    features: ['Conversation Practice', 'Cultural Context', 'Pronunciation Guide', 'Real-life Scenarios'],
    category: ['Language', 'Conversation']
  },
  {
    id: 'course_3',
    title: 'Korean Essentials',
    description: 'Discover the Korean language and culture with comprehensive lessons and K-culture insights.',
      language: 'Korean',
      flag: '🇰🇷',
    level: 'BEGINNER',
    duration: '10 weeks',
    lessons: 30,
    instructor: 'Ji-eun Kim',
    price: 119.99,
    originalPrice: 179.99,
      rating: 4.7,
    students: 3400,
    image: '/api/placeholder/300/200',
    features: ['Hangul Writing', 'K-Culture', 'Grammar Basics', 'Listening Practice'],
    category: ['Language', 'Culture']
  },
  {
    id: 'course_4',
    title: 'Japanese Fundamentals',
    description: 'Start your Japanese journey with hiragana, katakana, and essential phrases.',
      language: 'Japanese',
      flag: '🇯🇵',
    level: 'BEGINNER',
    duration: '12 weeks',
    lessons: 36,
    instructor: 'Akira Tanaka',
    price: 139.99,
    originalPrice: 199.99,
    rating: 4.6,
    students: 1800,
    image: '/api/placeholder/300/200',
    features: ['Hiragana & Katakana', 'Basic Kanji', 'Cultural Insights', 'Speaking Practice'],
    category: ['Language', 'Writing']
  },
  {
    id: 'course_5',
    title: 'Spanish Conversation',
    description: 'Improve your Spanish speaking skills through interactive conversations and role-plays.',
    language: 'Spanish',
    flag: '🇪🇸',
    level: 'INTERMEDIATE',
    duration: '8 weeks',
    lessons: 24,
    instructor: 'Carlos Rodriguez',
    price: 89.99,
    originalPrice: 129.99,
    rating: 4.8,
    students: 2100,
    image: '/api/placeholder/300/200',
    features: ['Conversation Practice', 'Grammar Review', 'Vocabulary Expansion', 'Cultural Topics'],
    category: ['Language', 'Conversation']
  },
  {
    id: 'course_6',
    title: 'Chinese Mandarin Basics',
    description: 'Learn Mandarin Chinese with focus on tones, pinyin, and essential characters.',
      language: 'Chinese',
      flag: '🇨🇳',
    level: 'BEGINNER',
    duration: '14 weeks',
    lessons: 42,
    instructor: 'Wei Lin',
    price: 159.99,
    originalPrice: 229.99,
      rating: 4.5,
    students: 900,
    image: '/api/placeholder/300/200',
    features: ['Pinyin System', 'Tone Practice', 'Character Writing', 'Cultural Context'],
    category: ['Language', 'Writing']
  }
]

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', AUD: 'A$', CAD: 'C$',
  CHF: 'Fr', CNY: '¥', MXN: 'MX$', PHP: '₱'
}

function formatCoursePrice(price: number, currencyCode?: string): string {
  if (price <= 0) return 'FREE'
  const symbol = (currencyCode && CURRENCY_SYMBOLS[currencyCode]) || '$'
  return `${symbol}${Number(price).toFixed(2)}`
}

/** Dummy enrollee count for display (stable per course id, not from DB). */
function getDummyEnrollees(courseId: string): number {
  let h = 0
  for (let i = 0; i < courseId.length; i++) h = ((h << 5) - h) + courseId.charCodeAt(i) | 0
  return 200 + Math.abs(h) % 3800
}

export default function CoursesPage() {
  const { isAuthenticated, user } = useAuthStore()
  const { enrollInCourse, getEnrollment, courses, fetchCourses } = useCoursesStore()
  const { t } = useLanguage()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false)
  const [isCourseDetailsModalOpen, setIsCourseDetailsModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  
  const isEnrolledInCourse = (courseId: string): boolean => {
    if (!user) return false
    
    // Prefer store (source of truth, per user)
    const enrollment = getEnrollment(courseId, user.id)
    if (enrollment !== null) return true
    
    // Check localStorage (user-scoped so only this student's enrollments)
    try {
      const storageKey = user.id ? `enrolled_courses_${user.id}` : 'enrolled_courses'
      const savedEnrollments = localStorage.getItem(storageKey) || localStorage.getItem('enrolled_courses')
      if (savedEnrollments) {
        const enrollments = JSON.parse(savedEnrollments)
        return enrollments.some((enrollment: any) => enrollment.id === courseId)
      }
    } catch (error) {
      console.error('Error checking enrollment status:', error)
    }
    return false
  }
  
  // Prefer store courses if available (active only), otherwise fall back to mock
  const activeCourses = (courses && courses.length > 0)
    ? courses.filter((c: { status?: string }) => c.status === 'active')
    : []
  const list = activeCourses.length > 0 ? activeCourses : mockCourses

  const filteredCourses = list.filter(course => {
    const subjectOrLanguage = (course as any).subject ?? (course as any).language
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (subjectOrLanguage || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLevel = !selectedLevel || course.level === selectedLevel
    const matchesEnrolled = !showEnrolledOnly || isEnrolledInCourse(course.id)
    
    return matchesSearch && matchesLevel && matchesEnrolled
  })

  const isPremiumUser = Boolean(user && (user.membership === 'premium member' || user.membership === 'vip member'))

  const canEnrollInCourse = (course: { price?: number; freeForPremiumOnly?: boolean }) => {
    const price = course.price ?? 0
    if (price > 0) return false
    if ((course as any).freeForPremiumOnly) return isPremiumUser
    return true
  }

  const handleEnroll = async (courseId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to enroll in courses', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#EF4444',
        },
      })
      return
    }

    try {
      await enrollInCourse(courseId, user!.id)
      
            // Record course enrollment activity
      if (user?.email) {
        const course = mockCourses.find(c => c.id === courseId)
        if (course) {
          recordLearningActivity(user.email, 'course_enrollment', course.title)
        }
      }
      
      toast.success('Successfully enrolled in course!', {
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
    } catch (error) {
      toast.error('Failed to enroll in course. Please try again.', {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#EF4444',
        },
      })
    }
  }

  const router = useRouter()



  const handleContinue = (courseId: string) => {
    // Record course access activity
    if (user?.email) {
      const course = mockCourses.find(c => c.id === courseId)
      if (course) {
        recordLearningActivity(user.email, 'course_access', course.title)
      }
    }
    
    // Navigate to the course learning page using Next.js router
    router.push(`/courses/${courseId}`)
  }

  const handleOpenCourseDetails = (course: any) => {
    const priceNum = typeof course.price === 'number' ? course.price : parseFloat(course.price) || 0
    const transformedCourse = {
      id: course.id,
      name: course.title,
      title: course.title,
      language: course.subject ?? course.language,
      flag: course.flag,
      level: course.level,
      description: course.description,
      price: priceNum.toString(),
      originalPrice: course.originalPrice?.toString(),
      currency: course.currency,
      totalLessons: course.lessons,
      duration: course.duration,
      rating: course.rating,
      students: course.students,
      features: (Array.isArray(course.category) && course.category.length > 0 ? course.category : course.features) ?? [],
      instructor: course.instructor,
      lastUpdated: '2024',
      certificate: true,
      lifetimeAccess: true,
      mobileAccess: true,
      communityAccess: true,
      requirements: course.requirements,
      freeForPremiumOnly: Boolean(course.freeForPremiumOnly),
    }
    
    console.log('Original course data:', course)
    console.log('Transformed course data:', transformedCourse)
    
    setSelectedCourse(transformedCourse)
    console.log('Selected course set:', transformedCourse)
    setIsCourseDetailsModalOpen(true)
  }

  const handleCloseCourseDetails = () => {
    setIsCourseDetailsModalOpen(false)
    setSelectedCourse(null)
  }

  const levels = Array.from(new Set(list.map(course => course.level)))

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('courses.page.title')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            {t('courses.page.subtitle')}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Free and paid courses available. Progress is tracked when you watch 90% of the content.</span>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('courses.page.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('courses.page.filter.level')}</option>
              {levels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0) + level.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            {/* Enrolled Only Filter */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enrolledOnly"
                checked={showEnrolledOnly}
                onChange={(e) => setShowEnrolledOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enrolledOnly" className="ml-2 text-sm text-gray-700">
                {t('courses.page.filter.enrolledOnly')}
              </label>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedLevel('')
                setShowEnrolledOnly(false)
              }}
              className="flex items-center justify-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              {t('courses.page.filter.clear')}
            </Button>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing {filteredCourses.length} of {list.length} courses
            </p>
            {isAuthenticated && (
              <p className="text-sm text-gray-500">
                You're enrolled in {list.filter(course => isEnrolledInCourse(course.id)).length} courses
              </p>
            )}
          </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Course Image / Header */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                {course.image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" aria-hidden />
                  </>
                ) : (
                  <div className="text-6xl">{course.flag || '🌍'}</div>
                )}
                {isEnrolledInCourse(course.id) && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enrolled
                  </div>
                )}
              </div>

              {/* Course Content */}
                <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-600">by {course.instructor}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    course.level === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                    course.level === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                {/* Course Info */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {course.lessons} lessons
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {getDummyEnrollees(course.id).toLocaleString()}
                  </div>
                </div>

                {/* Rating - show filled stars by count (e.g. 3 = 3 filled, 2 empty out of 5) */}
                <div className="flex items-center gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => {
                    const rating = Number(course.rating) || 0
                    const filledCount = Math.min(5, Math.round(rating))
                    const filled = i <= filledCount
                    return (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                        aria-hidden
                      />
                    )
                  })}
                  <span className="ml-1.5 text-sm font-medium text-gray-600">{course.rating ?? 0}</span>
                </div>

                {/* Tags (real tag data from course) */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(course.category) ? course.category : []).slice(0, 5).map((tag: string, tagIndex: number) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                    {Array.isArray(course.category) && course.category.length > 5 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">
                        +{course.category.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price and action: Continue (enrolled), Course Details / Enroll / Purchase, or Course Contents (staff) */}
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    {(course.price ?? 0) > 0 ? (
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCoursePrice(course.price ?? 0, course.currency)}
                      </span>
                    ) : (course as any).freeForPremiumOnly && !isPremiumUser ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-2xl font-bold text-amber-600">Free for Premium</span>
                        <span className="text-sm text-amber-600/90">Premium membership required</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-2xl font-bold text-green-600">FREE</span>
                        <span className="text-sm text-green-600/90">
                          {t('courses.page.course.allLessonsUnlocked')}
                        </span>
                      </div>
                    )}
                  </div>
                  {user?.role === 'STUDENT' && isEnrolledInCourse(course.id) ? (
                    <Button
                      onClick={() => handleContinue(course.id)}
                      variant="outline"
                      className="px-4 py-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 shrink-0"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      {t('courses.page.course.continue')}
                    </Button>
                  ) : (user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' || user?.role === 'TEACHER') ? (
                    <Button
                      onClick={() => router.push(`/courses/${course.id}`)}
                      variant="outline"
                      className="px-4 py-2 shrink-0"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      {t('courses.page.course.courseContents') || 'Course Contents'}
                    </Button>
                  ) : (
                    /* Guest or student not enrolled: Enroll only when canEnrollInCourse (totally free for all, or free-for-premium + premium user) */
                    (course.price ?? 0) > 0 ? (
                      <Button
                        onClick={() => handleOpenCourseDetails(course)}
                        variant="outline"
                        className="px-4 py-2 shrink-0"
                      >
                        {formatCoursePrice(course.price ?? 0, course.currency)} – Purchase
                      </Button>
                    ) : canEnrollInCourse(course) ? (
                      <Button
                        onClick={() => handleOpenCourseDetails(course)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 shrink-0"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        {t('courses.page.course.courseDetails') || 'Course Details'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleOpenCourseDetails(course)}
                        variant="outline"
                        className="px-4 py-2 shrink-0"
                      >
                        {t('courses.page.course.courseDetails') || 'Course Details'}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
            ))}
          </div>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('courses.page.noResults.title')}</h3>
            <p className="text-gray-600 mb-6">
              {t('courses.page.noResults.description')}
            </p>
            <Button
              onClick={() => {
                setSearchTerm('')
                setSelectedLevel('')
              }}
            >
              {t('courses.page.noResults.button')}
            </Button>
          </motion.div>
        )}

        </div>
      </div>

      {selectedCourse && (
        <CourseDetailsModal
          isOpen={isCourseDetailsModalOpen}
          onClose={handleCloseCourseDetails}
          course={selectedCourse}
        />
      )}
    </>
  )
}