'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
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

export function LanguagesSection() {
  const { t } = useLanguage()
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

  const languages = [
    {
      name: t('languages.tagalog'),
      nativeName: t('languages.tagalog.native'),
      description: t('languages.tagalog.description'),
      flag: '🇵🇭',
      level: t('languages.level.beginner'),
      students: 2500,
      lessons: 80,
      duration: '3-6',
      features: [t('languages.features.cultural'), t('languages.features.modern'), t('languages.features.regional'), t('languages.features.formal')],
      color: 'lang-tagalog'
    },
    {
      name: t('languages.english'),
      nativeName: t('languages.english.native'),
      description: t('languages.english.description'),
      flag: '🇺🇸',
      level: t('languages.level.beginner'),
      students: 3200,
      lessons: 120,
      duration: '6-12',
      features: [t('languages.features.business'), t('languages.features.academic'), t('languages.features.conversation'), t('languages.features.grammar')],
      color: 'lang-english'
    },
    {
      name: t('languages.korean'),
      nativeName: t('languages.korean.native'),
      description: t('languages.korean.description'),
      flag: '🇰🇷',
      level: t('languages.level.intermediate'),
      students: 1800,
      lessons: 95,
      duration: '8-15',
      features: [t('languages.features.hangul'), t('languages.features.kpop'), t('languages.features.businessKorean'), t('languages.features.travel')],
      color: 'lang-korean'
    },
    {
      name: t('languages.japanese'),
      nativeName: t('languages.japanese.native'),
      description: t('languages.japanese.description'),
      flag: '🇯🇵',
      level: t('languages.level.intermediate'),
      students: 1600,
      lessons: 110,
      duration: '10-18',
      features: [t('languages.features.hiragana'), t('languages.features.anime'), t('languages.features.businessJapanese'), t('languages.features.etiquette')],
      color: 'lang-japanese'
    },
    {
      name: t('languages.chinese'),
      nativeName: t('languages.chinese.native'),
      description: t('languages.chinese.description'),
      flag: '🇨🇳',
      level: t('languages.level.advanced'),
      students: 1200,
      lessons: 85,
      duration: '12-20',
      features: [t('languages.features.characters'), t('languages.features.businessChinese'), t('languages.features.culturalContext'), t('languages.features.mandarin')],
      color: 'lang-chinese'
    },
    {
      name: t('languages.spanish'),
      nativeName: t('languages.spanish.native'),
      description: t('languages.spanish.description'),
      flag: '🇪🇸',
      level: t('languages.level.beginner'),
      students: 900,
      lessons: 70,
      duration: '6-10',
      features: [t('languages.features.latin'), t('languages.features.businessSpanish'), t('languages.features.travel'), t('languages.features.culturalContext')],
      color: 'lang-spanish'
    }
  ]

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
            {t('languages.chooseYourJourney')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('languages.chooseYourJourneyDescription')}
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
                      <div className="text-xs text-gray-500">{t('languages.students')}</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-secondary-600">{language.lessons}</div>
                      <div className="text-xs text-gray-500">{t('languages.lessons')}</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-accent-600">{language.duration}</div>
                      <div className="text-xs text-gray-500">{t('languages.duration.months')}</div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    className="w-full group-hover:bg-primary-700 transition-colors"
                    onClick={() => handleStartLearning(language.name.toLowerCase())}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isAuthenticated ? t('languages.enrollNow') : t('languages.startLearning')}
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
              {t('languages.assessment.title')}
            </h3>
            <p className="text-primary-100 max-w-2xl mx-auto mb-6">
              {t('languages.assessment.description')}
            </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white text-primary-600 hover:bg-gray-50"
                  onClick={() => setIsAssessmentOpen(true)}
                >
                  {t('languages.assessment.takeAssessment')}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-primary-600 transition-colors"
                  onClick={() => setShowAllCourses(true)}
                >
                  {t('languages.assessment.viewAllCourses')}
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
