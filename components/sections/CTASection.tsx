'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/Button'
import { AssessmentModal } from '@/components/AssessmentModal'
import { 
  CheckCircle, 
  ArrowRight, 
  Star, 
  Users, 
  Award,
  Globe
} from 'lucide-react'

export function CTASection() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false)

  const benefits = [
    t('cta.benefits.videoLessons'),
    t('cta.benefits.aiLearning'),
    t('cta.benefits.studyGroups'),
    t('cta.benefits.progressTracking'),
    t('cta.benefits.mobileFriendly'),
    t('cta.benefits.support')
  ]

  const languages = [t('languages.tagalog'), t('languages.english'), t('languages.korean'), t('languages.japanese'), t('languages.chinese'), t('languages.spanish')]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !selectedLanguage) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    
    // Reset form
    setEmail('')
    setSelectedLanguage('')
    
    // Show success message (you can use toast here)
    alert('Thank you! We\'ll send you a welcome email with your free access.')
  }

  return (
    <section className="py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                {t('cta.title')}{' '}
                <span className="text-yellow-300">{t('cta.titleHighlight')}</span>
              </h2>
              
              <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                {t('cta.subtitle')}
              </p>

              {/* Benefits */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-yellow-300">
                  {t('cta.benefits.title')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-primary-100">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-6 text-sm text-primary-200">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>{t('cta.socialProof.students')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span>{t('cta.socialProof.rating')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span>{t('cta.socialProof.successRate')}</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold mb-6 text-center">
                  {t('cta.form.title')}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-primary-100 mb-2">
                      {t('cta.form.email.label')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                      placeholder={t('cta.form.email.placeholder')}
                    />
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-primary-100 mb-2">
                      {t('cta.form.language.label')}
                    </label>
                    <select
                      id="language"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                    >
                      <option value="">{t('cta.form.language.placeholder')}</option>
                      {languages.map((language) => (
                        <option key={language} value={language} className="text-gray-900">
                          {language}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !email || !selectedLanguage}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                        {t('cta.form.submit.setup')}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        {t('cta.form.submit.start')}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </div>
                    )}
                  </Button>

                  {/* Terms */}
                  <p className="text-xs text-primary-200 text-center">
                    {t('cta.form.terms')}{' '}
                    <a href="#" className="text-yellow-300 hover:underline">{t('cta.form.terms.service')}</a>
                    {' '}{t('cta.form.terms.and')}{' '}
                    <a href="#" className="text-yellow-300 hover:underline">{t('cta.form.terms.privacy')}</a>
                  </p>
                </form>

                {/* Trust Indicators */}
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex items-center justify-center space-x-4 text-xs text-primary-200">
                    <div className="flex items-center space-x-1">
                      <Globe className="w-4 h-4" />
                      <span>{t('cta.trust.ssl')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>{t('cta.trust.noCard')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span>{t('cta.trust.instant')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-4">
                {t('cta.bottom.title')}
              </h3>
              <p className="text-primary-100 max-w-2xl mx-auto mb-6">
                {t('cta.bottom.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                  {t('cta.bottom.contact')}
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                  {t('cta.bottom.demo')}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Assessment Modal */}
      <AssessmentModal 
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
      />
    </section>
  )
}
