'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Clock, Users, Star, BookOpen, Target, Globe, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CourseEnrollmentModal } from './CourseEnrollmentModal'

interface Course {
  id: string
  name: string
  nativeName: string
  flag: string
  level: string
  description: string
  features: string[]
  students: number
  lessons: number
  duration: string
  price: string
  originalPrice?: string
  rating: number
  category: 'beginner' | 'intermediate' | 'advanced' | 'business' | 'cultural'
  tags: string[]
}

const allCourses: Course[] = [
  {
    id: 'tagalog-basic',
    name: 'Tagalog Basics',
    nativeName: 'Wikang Tagalog',
    flag: '🇵🇭',
    level: 'Beginner',
    description: 'Master the fundamentals of Tagalog with cultural context and modern usage.',
    features: ['Cultural Context', 'Modern Usage', 'Regional Variations', 'Formal vs Informal'],
    students: 2500,
    lessons: 80,
    duration: '3-6 months',
    price: 'Free',
    rating: 4.8,
    category: 'beginner',
    tags: ['Filipino', 'Culture', 'Beginner']
  },
  {
    id: 'tagalog-intermediate',
    name: 'Tagalog Intermediate',
    nativeName: 'Wikang Tagalog',
    flag: '🇵🇭',
    level: 'Intermediate',
    description: 'Advance your Tagalog skills with complex grammar and conversation practice.',
    features: ['Advanced Grammar', 'Conversation Practice', 'Business Tagalog', 'Literature'],
    students: 1200,
    lessons: 60,
    duration: '4-8 months',
    price: '$29.99',
    originalPrice: '$49.99',
    rating: 4.9,
    category: 'intermediate',
    tags: ['Filipino', 'Grammar', 'Intermediate']
  },
  {
    id: 'english-business',
    name: 'Business English',
    nativeName: 'English',
    flag: '🇺🇸',
    level: 'Intermediate',
    description: 'Professional English for business communication and career advancement.',
    features: ['Business Communication', 'Professional Writing', 'Presentations', 'Negotiations'],
    students: 3200,
    lessons: 120,
    duration: '6-12 months',
    price: '$39.99',
    originalPrice: '$69.99',
    rating: 4.7,
    category: 'business',
    tags: ['Business', 'Professional', 'English']
  },
  {
    id: 'korean-kpop',
    name: 'Korean for K-pop Fans',
    nativeName: '한국어',
    flag: '🇰🇷',
    level: 'Beginner',
    description: 'Learn Korean through K-pop culture, music, and entertainment.',
    features: ['K-pop Vocabulary', 'Music Terms', 'Fan Culture', 'Basic Conversation'],
    students: 1800,
    lessons: 95,
    duration: '8-15 months',
    price: '$24.99',
    originalPrice: '$39.99',
    rating: 4.9,
    category: 'cultural',
    tags: ['Korean', 'K-pop', 'Culture', 'Beginner']
  },
  {
    id: 'japanese-anime',
    name: 'Japanese for Anime Fans',
    nativeName: '日本語',
    flag: '🇯🇵',
    level: 'Beginner',
    description: 'Master Japanese through anime, manga, and pop culture.',
    features: ['Anime Vocabulary', 'Manga Reading', 'Pop Culture', 'Basic Grammar'],
    students: 1600,
    lessons: 110,
    duration: '10-18 months',
    price: '$34.99',
    originalPrice: '$59.99',
    rating: 4.8,
    category: 'cultural',
    tags: ['Japanese', 'Anime', 'Manga', 'Beginner']
  },
  {
    id: 'chinese-business',
    name: 'Business Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    level: 'Advanced',
    description: 'Professional Chinese for international business and trade.',
    features: ['Business Vocabulary', 'Trade Terms', 'Cultural Etiquette', 'Advanced Grammar'],
    students: 1200,
    lessons: 85,
    duration: '12-20 months',
    price: '$49.99',
    originalPrice: '$79.99',
    rating: 4.6,
    category: 'business',
    tags: ['Chinese', 'Business', 'Advanced', 'Trade']
  },
  {
    id: 'spanish-latin',
    name: 'Latin American Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    level: 'Beginner',
    description: 'Learn Spanish with focus on Latin American culture and dialects.',
    features: ['Latin Dialects', 'Cultural Context', 'Travel Phrases', 'Business Spanish'],
    students: 900,
    lessons: 70,
    duration: '6-10 months',
    price: '$19.99',
    originalPrice: '$34.99',
    rating: 4.7,
    category: 'beginner',
    tags: ['Spanish', 'Latin America', 'Culture', 'Beginner']
  }
]

export function AllCoursesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)

  const categories = [
    { id: 'all', name: 'All Categories', count: allCourses.length },
    { id: 'beginner', name: 'Beginner', count: allCourses.filter(c => c.category === 'beginner').length },
    { id: 'intermediate', name: 'Intermediate', count: allCourses.filter(c => c.category === 'intermediate').length },
    { id: 'advanced', name: 'Advanced', count: allCourses.filter(c => c.category === 'advanced').length },
    { id: 'business', name: 'Business', count: allCourses.filter(c => c.category === 'business').length },
    { id: 'cultural', name: 'Cultural', count: allCourses.filter(c => c.category === 'cultural').length }
  ]

  const levels = [
    { id: 'all', name: 'All Levels', count: allCourses.length },
    { id: 'Beginner', name: 'Beginner', count: allCourses.filter(c => c.level === 'Beginner').length },
    { id: 'Intermediate', name: 'Intermediate', count: allCourses.filter(c => c.level === 'Intermediate').length },
    { id: 'Advanced', name: 'Advanced', count: allCourses.filter(c => c.level === 'Advanced').length }
  ]

  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel
    
    return matchesSearch && matchesCategory && matchesLevel
  })

  const handleEnroll = (course: Course) => {
    setSelectedCourse(course)
    setShowEnrollmentModal(true)
  }

  if (!isOpen) return null

  return (
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
          className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center">
                <Globe className="w-6 h-6 mr-2" />
                All Language Courses
              </h2>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-primary-100 mt-2">
              Discover our complete collection of language learning courses
            </p>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>

                {/* Level Filter */}
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name} ({level.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Course Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-4xl">{course.flag}</div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{course.level}</span>
                        <div className="flex items-center text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {course.name}
                    </h3>
                    <p className="text-sm text-gray-500 italic">
                      {course.nativeName}
                    </p>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Features */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.features.slice(0, 3).map((feature) => (
                          <span key={feature} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary-600">{course.students}</div>
                        <div className="text-xs text-gray-500">Students</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-secondary-600">{course.lessons}</div>
                        <div className="text-xs text-gray-500">Lessons</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-accent-600">{course.duration}</div>
                        <div className="text-xs text-gray-500">Duration</div>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        {course.originalPrice && (
                          <span className="text-sm text-gray-500 line-through mr-2">
                            {course.originalPrice}
                          </span>
                        )}
                        <span className="text-2xl font-bold text-primary-600">
                          {course.price}
                        </span>
                      </div>
                      <Button 
                        onClick={() => handleEnroll(course)}
                        className="flex items-center"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {course.price === 'Free' ? 'Start Free' : 'Enroll Now'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Can't find what you're looking for? Take our assessment to get personalized recommendations!
              </p>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Course Enrollment Modal */}
      {showEnrollmentModal && selectedCourse && (
        <CourseEnrollmentModal
          isOpen={showEnrollmentModal}
          onClose={() => setShowEnrollmentModal(false)}
          course={{
            id: selectedCourse.id,
            name: selectedCourse.name,
            language: selectedCourse.nativeName,
            flag: selectedCourse.flag,
            level: selectedCourse.level,
            description: selectedCourse.description,
            price: selectedCourse.price,
            originalPrice: selectedCourse.originalPrice,
            totalLessons: selectedCourse.lessons,
            duration: selectedCourse.duration,
            rating: selectedCourse.rating,
            students: selectedCourse.students
          }}
        />
      )}
    </AnimatePresence>
  )
}
