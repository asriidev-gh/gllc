'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Target,
  Filter,
  Search,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore, useCoursesStore } from '@/stores'
import { Header } from '@/components/Header'
import { CourseDetailsModal } from '@/components/CourseDetailsModal'
import toast from 'react-hot-toast'

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

export default function CoursesPage() {
  const { isAuthenticated, user } = useAuthStore()
  const { enrollInCourse, getEnrollment } = useCoursesStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false)
  const [isCourseDetailsModalOpen, setIsCourseDetailsModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  
  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.language.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLevel = !selectedLevel || course.level === selectedLevel
    const matchesLanguage = !selectedLanguage || course.language === selectedLanguage
    const matchesEnrolled = !showEnrolledOnly || isEnrolledInCourse(course.id)
    
    return matchesSearch && matchesLevel && matchesLanguage && matchesEnrolled
  })

  const isEnrolledInCourse = (courseId: string): boolean => {
    if (!user) return false
    
    // Check localStorage directly since CourseDetailsModal saves enrollments there
    try {
      const savedEnrollments = localStorage.getItem('enrolled_courses')
      if (savedEnrollments) {
        const enrollments = JSON.parse(savedEnrollments)
        const isEnrolled = enrollments.some((enrollment: any) => enrollment.id === courseId)
        console.log(`Course ${courseId} enrollment status:`, isEnrolled)
        return isEnrolled
      }
    } catch (error) {
      console.error('Error checking enrollment status:', error)
    }
    
    // Fallback to courses store
    const enrollment = getEnrollment(courseId, user.id)
    const storeEnrolled = enrollment !== null
    console.log(`Course ${courseId} store enrollment status:`, storeEnrolled)
    return storeEnrolled
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
    // Navigate to the course learning page using Next.js router
    router.push(`/courses/${courseId}`)
  }

  const handleOpenCourseDetails = (course: any) => {
    // Transform course data to match CourseDetailsModal expectations
    const transformedCourse = {
      id: course.id,
      name: course.title, // This will be the course name displayed
      language: course.language,
      flag: course.flag,
      level: course.level,
      description: course.description,
      price: course.price.toString(),
      originalPrice: course.originalPrice?.toString(),
      totalLessons: course.lessons,
      duration: course.duration,
      rating: course.rating,
      students: course.students,
      features: course.features,
      instructor: course.instructor,
      lastUpdated: '2024',
      certificate: true,
      lifetimeAccess: true,
      mobileAccess: true,
      communityAccess: true
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

  const languages = Array.from(new Set(mockCourses.map(course => course.language)))
  const levels = Array.from(new Set(mockCourses.map(course => course.level)))

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Our Courses</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover language courses designed to help you achieve fluency with interactive lessons, 
            expert instructors, and practical learning approaches.
          </p>
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
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Languages</option>
              {languages.map(language => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Levels</option>
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
                Show enrolled only
              </label>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedLevel('')
                setSelectedLanguage('')
                setShowEnrolledOnly(false)
              }}
              className="flex items-center justify-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing {filteredCourses.length} of {mockCourses.length} courses
            </p>
            {isAuthenticated && (
              <p className="text-sm text-gray-500">
                You're enrolled in {mockCourses.filter(course => isEnrolledInCourse(course.id)).length} courses
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
              {/* Course Image */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                <div className="text-6xl">{course.flag}</div>
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
                    {course.students.toLocaleString()}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">{course.rating}</span>
                  </div>
                  <span className="text-gray-400 text-sm ml-2">
                    ({course.students.toLocaleString()} students)
                  </span>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {course.features.slice(0, 2).map((feature, featureIndex) => (
                      <span
                        key={featureIndex}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                      >
                        {feature}
                      </span>
                    ))}
                    {course.features.length > 2 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">
                        +{course.features.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Price and Enroll/Continue */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      ${course.price}
                    </span>
                    {course.originalPrice && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ${course.originalPrice}
                      </span>
                    )}
                  </div>
                  {isEnrolledInCourse(course.id) ? (
                    <Button
                      onClick={() => handleContinue(course.id)}
                      variant="outline"
                      className="px-4 py-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Continue
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleOpenCourseDetails(course)}
                      className="px-4 py-2"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Enroll Now
                    </Button>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse all available courses.
            </p>
            <Button
              onClick={() => {
                setSearchTerm('')
                setSelectedLevel('')
                setSelectedLanguage('')
              }}
            >
              Show All Courses
            </Button>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Not sure where to start?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Take our language assessment to discover your current level and get personalized course recommendations.
          </p>
          <Button
            variant="outline"
            className="bg-white text-blue-600 hover:bg-gray-50"
            onClick={() => window.location.href = '/assessment'}
          >
            <Target className="w-4 h-4 mr-2" />
              Take Assessment
          </Button>
        </motion.div>
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