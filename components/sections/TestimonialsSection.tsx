'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { Star, Quote } from 'lucide-react'

export function TestimonialsSection() {
  const { t } = useLanguage()

  const testimonials = [
    {
      name: 'Maria Santos',
      age: 12,
      grade: 'Grade 6',
      school: 'Manila Elementary School',
      language: t('languages.tagalog'),
      rating: 5,
      content: 'I used to struggle with Tagalog, but now I can speak confidently with my grandparents. The videos make learning fun and easy!',
      avatar: '👧',
      achievement: 'Completed Basic Tagalog Course'
    },
    {
      name: 'Juan Dela Cruz',
      age: 16,
      grade: 'Grade 10',
      school: 'Quezon City High School',
      language: t('languages.english'),
      rating: 5,
      content: 'My English improved dramatically! I can now participate in class discussions and write better essays. The AI exams really help me practice.',
      avatar: '👦',
      achievement: 'Advanced to Intermediate Level'
    },
    {
      name: 'Ana Kim',
      age: 20,
      grade: 'College Student',
      school: 'University of the Philippines',
      language: t('languages.korean'),
      rating: 5,
      content: 'Learning Korean for my future career in international business. The cultural context and business vocabulary are exactly what I need.',
      avatar: '👩‍🎓',
      achievement: 'Business Korean Certificate'
    },
    {
      name: 'Carlos Tanaka',
      age: 18,
      grade: 'Grade 12',
      school: 'Makati Science High School',
      language: t('languages.japanese'),
      rating: 5,
      content: 'I love anime and manga, so learning Japanese was perfect! The platform makes complex grammar easy to understand.',
      avatar: '👨‍🎓',
      achievement: 'JLPT N5 Preparation'
    },
    {
      name: 'Isabella Wang',
      age: 25,
      grade: 'Young Professional',
      school: 'Ateneo Graduate School',
      language: t('languages.chinese'),
      rating: 5,
      content: 'Learning Chinese for business opportunities. The platform\'s focus on practical business language is excellent.',
      avatar: '👩‍💼',
      achievement: 'Business Chinese Proficiency'
    },
    {
      name: 'Miguel Rodriguez',
      age: 14,
      grade: 'Grade 8',
      school: 'Cebu International School',
      language: t('languages.spanish'),
      rating: 5,
      content: 'Spanish is so much fun to learn! The interactive lessons and study groups help me stay motivated.',
      avatar: '👨‍🎓',
      achievement: 'Spanish Conversation Skills'
    }
  ]

  return (
    <section className="py-20 bg-white">
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
            {t('testimonials.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-6 relative">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 text-primary-200 group-hover:text-primary-300 transition-colors">
                  <Quote className="w-8 h-8" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                {/* Student Info */}
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">
                      {testimonial.age} years old • {testimonial.grade}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.school}</p>
                  </div>
                </div>

                {/* Language Badge */}
                <div className="mt-4">
                  <span className={`badge ${getLanguageColor(testimonial.language)}`}>
                    {testimonial.language}
                  </span>
                </div>

                {/* Achievement */}
                <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-800 font-medium">
                    🏆 {testimonial.achievement}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              {t('testimonials.stats.title')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">95%</div>
                <div className="text-gray-600">{t('testimonials.stats.satisfaction')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary-600 mb-2">10,000+</div>
                <div className="text-gray-600">{t('testimonials.stats.learners')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-600 mb-2">500+</div>
                <div className="text-gray-600">{t('testimonials.stats.lessons')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-success-600 mb-2">85%</div>
                <div className="text-gray-600">{t('testimonials.stats.completion')}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              {t('testimonials.cta.title')}
            </h3>
            <p className="text-primary-100 max-w-2xl mx-auto mb-6">
              {t('testimonials.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary text-lg px-8 py-3">
                {t('testimonials.cta.getStarted')}
              </button>
              <button className="btn-outline text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary-600">
                {t('testimonials.cta.viewStories')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Helper function for language colors
function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    tagalog: 'lang-tagalog',
    english: 'lang-english',
    korean: 'lang-korean',
    japanese: 'lang-japanese',
    chinese: 'lang-chinese',
    spanish: 'lang-spanish',
  }
  return colors[language.toLowerCase()] || 'bg-gray-100 text-gray-800'
}
