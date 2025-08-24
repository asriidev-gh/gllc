'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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

const benefits = [
  'Access to 500+ video lessons',
  'AI-powered personalized learning',
  'Study groups and community',
  'Progress tracking and certificates',
  'Mobile-friendly platform',
  '24/7 learning support'
]

const languages = ['Tagalog', 'English', 'Korean', 'Japanese', 'Chinese', 'Spanish']

export function CTASection() {
  const [email, setEmail] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false)

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
                Start Your Language Learning Journey{' '}
                <span className="text-yellow-300">Today</span>
              </h2>
              
              <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                Join thousands of students worldwide who are already mastering new languages. 
                Get instant access to our platform and start learning for free!
              </p>

              {/* Benefits */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-yellow-300">
                  What You'll Get:
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
                  <span>10,000+ students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span>4.9/5 rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span>95% success rate</span>
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
                  Get Free Access Now
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-primary-100 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-primary-100 mb-2">
                      I want to learn
                    </label>
                    <select
                      id="language"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                    >
                      <option value="">Select a language</option>
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
                        Setting up your account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Start Learning Free
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </div>
                    )}
                  </Button>

                  {/* Terms */}
                  <p className="text-xs text-primary-200 text-center">
                    By signing up, you agree to our{' '}
                    <a href="#" className="text-yellow-300 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-yellow-300 hover:underline">Privacy Policy</a>
                  </p>
                </form>

                {/* Trust Indicators */}
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex items-center justify-center space-x-4 text-xs text-primary-200">
                    <div className="flex items-center space-x-1">
                      <Globe className="w-4 h-4" />
                      <span>SSL Secure</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>No Credit Card</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span>Instant Access</span>
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
                Questions? We're Here to Help!
              </h3>
              <p className="text-primary-100 max-w-2xl mx-auto mb-6">
                Our team of language learning experts is ready to guide you on your journey. 
                Contact us for personalized recommendations and support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                  Contact Support
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                  Schedule Demo
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
