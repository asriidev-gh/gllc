'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { getLanguageColor, getLevelColor } from '@/lib/utils'
import { AssessmentModal } from '@/components/AssessmentModal'
import { AllCoursesModal } from '@/components/AllCoursesModal'
import { CoursePreviewModal } from '@/components/CoursePreviewModal'
import { CourseDetailsModal } from '@/components/CourseDetailsModal'
import { useAuthStore } from '@/stores'
import { 
  Flag, 
  BookOpen, 
  Users, 
  Clock,
  Star,
  Play
} from 'lucide-react'

const languages = [
  {
    name: 'Tagalog',
    nativeName: 'Wikang Tagalog',
    description: 'Learn the national language of the Philippines with cultural context and modern usage.',
    flag: '🇵🇭',
    level: 'beginner',
    students: 2500,
    lessons: 80,
    duration: '3-6 months',
    features: ['Cultural Context', 'Modern Usage', 'Regional Variations', 'Formal vs Informal'],
    color: 'lang-tagalog'
  },
  {
    name: 'English',
    nativeName: 'English',
    description: 'Master English for academic success, career advancement, and global communication.',
    flag: '🇺🇸',
    level: 'beginner',
    students: 3200,
    lessons: 120,
    duration: '6-12 months',
    features: ['Business English', 'Academic Writing', 'Conversation Skills', 'Grammar Mastery'],
    color: 'lang-english'
  },
  {
    name: 'Korean',
    nativeName: '한국어',
    description: 'Learn Korean for K-pop culture, business opportunities, and travel to South Korea.',
    flag: '🇰🇷',
    level: 'intermediate',
    students: 1800,
    lessons: 95,
    duration: '8-15 months',
    features: ['Hangul Writing', 'K-pop Culture', 'Business Korean', 'Travel Phrases'],
    color: 'lang-korean'
  },
  {
    name: 'Japanese',
    nativeName: '日本語',
    description: 'Master Japanese for anime, manga, business, and cultural exchange with Japan.',
    flag: '🇯🇵',
    level: 'intermediate',
    students: 1600,
    lessons: 110,
    duration: '10-18 months',
    features: ['Hiragana & Katakana', 'Anime & Manga', 'Business Japanese', 'Cultural Etiquette'],
    color: 'lang-japanese'
  },
  {
    name: 'Chinese',
    nativeName: '中文',
    description: 'Learn Chinese for business opportunities, cultural understanding, and global trade.',
    flag: '🇨🇳',
    level: 'advanced',
    students: 1200,
    lessons: 85,
    duration: '12-20 months',
    features: ['Simplified Characters', 'Business Chinese', 'Cultural Context', 'Mandarin Pronunciation'],
    color: 'lang-chinese'
  },
  {
    name: 'Spanish',
    nativeName: 'Español',
    description: 'Learn Spanish for business, travel, and cultural connections with Spanish-speaking countries.',
    flag: '🇪🇸',
    level: 'beginner',
    students: 900,
    lessons: 70,
    duration: '6-10 months',
    features: ['Latin American Spanish', 'Business Spanish', 'Travel Phrases', 'Cultural Context'],
    color: 'lang-spanish'
  }
]

export function LanguagesSection() {
  const { isAuthenticated } = useAuthStore()
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false)
  const [showAllCourses, setShowAllCourses] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [showCoursePreview, setShowCoursePreview] = useState(false)
  const [showCourseDetails, setShowCourseDetails] = useState(false)
  const [selectedCourseData, setSelectedCourseData] = useState<any>(null)

  const handleStartLearning = (languageName: string) => {
    // Find the course data
    const courseData = languages.find(lang => lang.name.toLowerCase() === languageName.toLowerCase())
    if (courseData) {
      // Transform language data to course format
      const course = {
        id: `${languageName.toLowerCase()}-course`,
        name: courseData.name,
        language: courseData.name,
        flag: courseData.flag,
        level: courseData.level,
        description: courseData.description,
        price: languageName === 'Tagalog' ? 'Free' : '$24.99',
        totalLessons: courseData.lessons,
        duration: courseData.duration,
        rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
        students: courseData.students,
        features: courseData.features,
        instructor: 'Expert Instructor',
        lastUpdated: '2024',
        certificate: true,
        lifetimeAccess: true,
        mobileAccess: true,
        communityAccess: true
      }
      
      setSelectedCourseData(course)
      setShowCourseDetails(true)
    }
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Language Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From Tagalog fundamentals to advanced business languages, we offer comprehensive 
            courses designed for students worldwide. Our special expertise in Filipino languages 
            and Asian cultures makes us the perfect choice for global learners.
          </p>
        </motion.div>

        {/* Languages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {languages.map((language, index) => (
            <motion.div
              key={language.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{language.flag}</div>
                    <span className={`badge ${getLevelColor(language.level)}`}>
                      {language.level}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {language.name}
                  </h3>
                  <p className="text-sm text-gray-500 italic">
                    {language.nativeName}
                  </p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {language.description}
                  </p>

                  {/* Features */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {language.features.map((feature) => (
                        <span key={feature} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary-600">{language.students}</div>
                      <div className="text-xs text-gray-500">Students</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-secondary-600">{language.lessons}</div>
                      <div className="text-xs text-gray-500">Lessons</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-accent-600">{language.duration}</div>
                      <div className="text-xs text-gray-500">Duration</div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    className="w-full group-hover:bg-primary-700 transition-colors"
                    onClick={() => handleStartLearning(language.name.toLowerCase())}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isAuthenticated ? 'Enroll Now' : 'Start Learning'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Can't Decide? Take Our Language Assessment!
            </h3>
            <p className="text-primary-100 max-w-2xl mx-auto mb-6">
              Our AI-powered assessment will help you choose the perfect language and level 
              based on your goals, interests, and current skills.
            </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white text-primary-600 hover:bg-gray-50"
                  onClick={() => setIsAssessmentOpen(true)}
                >
                  Take Assessment
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-primary-600 transition-colors"
                  onClick={() => setShowAllCourses(true)}
                >
                  View All Courses
                </Button>
              </div>
          </div>
        </motion.div>
      </div>

      {/* Assessment Modal */}
      <AssessmentModal 
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
      />

      {/* All Courses Modal */}
      <AllCoursesModal 
        isOpen={showAllCourses}
        onClose={() => setShowAllCourses(false)}
      />

      {/* Course Preview Modal */}
      <CoursePreviewModal 
        isOpen={showCoursePreview}
        onClose={() => setShowCoursePreview(false)}
        courseName={selectedCourse}
      />

      {/* Course Details Modal */}
      {selectedCourseData && (
        <CourseDetailsModal
          isOpen={showCourseDetails}
          onClose={() => {
            setShowCourseDetails(false)
            setSelectedCourseData(null)
          }}
          course={selectedCourseData}
        />
      )}
    </section>
  )
}
