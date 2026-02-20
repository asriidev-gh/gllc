'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/Button'
import { getLevelColor } from '@/lib/utils'
import { AssessmentModal } from '@/components/AssessmentModal'
import { AllCoursesModal } from '@/components/AllCoursesModal'
import { CoursePreviewModal } from '@/components/CoursePreviewModal'
import { CourseDetailsModal } from '@/components/CourseDetailsModal'
import { useAuthStore } from '@/stores'
import { BookOpen, Users, Clock, Play } from 'lucide-react'

export function CoursesSection() {
  const { t } = useLanguage()
  const { isAuthenticated } = useAuthStore()
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false)
  const [showAllCourses, setShowAllCourses] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [showCoursePreview, setShowCoursePreview] = useState(false)
  const [showCourseDetails, setShowCourseDetails] = useState(false)
  const [selectedCourseData, setSelectedCourseData] = useState<any>(null)

  const handleStartLearning = (subjectName: string) => {
    const courseData = sampleCourses.find(c => c.name.toLowerCase() === subjectName.toLowerCase())
    if (courseData) {
      const course = {
        id: `${subjectName.toLowerCase().replace(/\s+/g, '-')}-course`,
        name: courseData.name,
        language: courseData.name,
        subject: courseData.name,
        flag: courseData.flag,
        level: courseData.level,
        description: courseData.description,
        price: 'Free',
        totalLessons: courseData.lessons,
        duration: courseData.duration,
        rating: 4.5 + Math.random() * 0.5,
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

  const sampleCourses = [
    {
      name: t('courses.sample.tagalog'),
      subtitle: t('languages.tagalog.native'),
      description: t('languages.tagalog.description'),
      flag: '🇵🇭',
      level: t('languages.level.beginner'),
      students: 2500,
      lessons: 80,
      duration: '3-6',
      features: [t('languages.features.cultural'), t('languages.features.modern'), t('languages.features.regional'), t('languages.features.formal')]
    },
    {
      name: t('courses.sample.english'),
      subtitle: t('languages.english.native'),
      description: t('languages.english.description'),
      flag: '🇺🇸',
      level: t('languages.level.beginner'),
      students: 3200,
      lessons: 120,
      duration: '6-12',
      features: [t('languages.features.business'), t('languages.features.academic'), t('languages.features.conversation'), t('languages.features.grammar')]
    },
    {
      name: t('courses.sample.korean'),
      subtitle: t('languages.korean.native'),
      description: t('languages.korean.description'),
      flag: '🇰🇷',
      level: t('languages.level.intermediate'),
      students: 1800,
      lessons: 95,
      duration: '8-15',
      features: [t('languages.features.hangul'), t('languages.features.kpop'), t('languages.features.businessKorean'), t('languages.features.travel')]
    },
    {
      name: t('courses.sample.japanese'),
      subtitle: t('languages.japanese.native'),
      description: t('languages.japanese.description'),
      flag: '🇯🇵',
      level: t('languages.level.intermediate'),
      students: 1600,
      lessons: 110,
      duration: '10-18',
      features: [t('languages.features.hiragana'), t('languages.features.anime'), t('languages.features.businessJapanese'), t('languages.features.etiquette')]
    },
    {
      name: t('courses.sample.mathematics'),
      subtitle: t('courses.sample.mathSubtitle'),
      description: t('courses.sample.mathDescription'),
      flag: '📐',
      level: t('languages.level.beginner'),
      students: 2100,
      lessons: 60,
      duration: '4-8',
      features: [t('courses.sample.features.algebra'), t('courses.sample.features.geometry'), t('courses.sample.features.problemSolving'), t('courses.sample.features.practice')]
    },
    {
      name: t('courses.sample.programming'),
      subtitle: t('courses.sample.programmingSubtitle'),
      description: t('courses.sample.programmingDescription'),
      flag: '💻',
      level: t('languages.level.beginner'),
      students: 3500,
      lessons: 90,
      duration: '8-16',
      features: [t('courses.sample.features.coding'), t('courses.sample.features.projects'), t('courses.sample.features.realWorld'), t('courses.sample.features.support')]
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('courses.section.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('courses.section.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {sampleCourses.map((course, index) => (
            <motion.div
              key={course.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{course.flag}</div>
                    <span className={`badge ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-500 italic">
                    {course.subtitle}
                  </p>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.features.map((feature) => (
                        <span key={feature} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary-600">{course.students}</div>
                      <div className="text-xs text-gray-500">{t('languages.students')}</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-secondary-600">{course.lessons}</div>
                      <div className="text-xs text-gray-500">{t('languages.lessons')}</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-accent-600">{course.duration}</div>
                      <div className="text-xs text-gray-500">{t('languages.duration.months')}</div>
                    </div>
                  </div>

                  <Button
                    className="w-full group-hover:bg-primary-700 transition-colors"
                    onClick={() => handleStartLearning(course.name)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isAuthenticated ? t('languages.enrollNow') : t('languages.startLearning')}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
      />

      <AllCoursesModal
        isOpen={showAllCourses}
        onClose={() => setShowAllCourses(false)}
      />

      <CoursePreviewModal
        isOpen={showCoursePreview}
        onClose={() => setShowCoursePreview(false)}
        courseName={selectedCourse}
      />

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
