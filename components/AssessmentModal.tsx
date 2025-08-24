'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft, ArrowRight, CheckCircle, Brain, Globe, Target, Clock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { sendAssessmentResults } from '@/lib/emailService'
import { isEmailEnabled } from '@/lib/config'

interface AssessmentQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'rating' | 'text'
  options?: string[]
  required: boolean
}

interface AssessmentAnswer {
  questionId: string
  answer: string | number
}

const assessmentQuestions: AssessmentQuestion[] = [
  ...(isEmailEnabled() ? [{
    id: 'email',
    question: 'What is your email address?',
    type: 'text' as const,
    required: true
  }] : []),
  {
    id: 'languages',
    question: 'Which languages are you most interested in learning?',
    type: 'multiple-choice' as const,
    options: ['Tagalog/Filipino', 'English', 'Korean', 'Japanese', 'Chinese', 'Spanish', 'Other'],
    required: true
  },
  {
    id: 'proficiency',
    question: 'What is your current proficiency level?',
    type: 'multiple-choice',
    options: ['Complete Beginner', 'Some Basic Knowledge', 'Intermediate', 'Advanced', 'Native Speaker'],
    required: true
  },
  {
    id: 'goals',
    question: 'What are your main learning goals?',
    type: 'multiple-choice',
    options: ['Travel & Tourism', 'Business & Career', 'Academic Studies', 'Cultural Interest', 'Family Connection', 'Personal Growth'],
    required: true
  },
  {
    id: 'time',
    question: 'How much time can you dedicate to learning per week?',
    type: 'multiple-choice',
    options: ['1-2 hours', '3-5 hours', '6-10 hours', '10+ hours'],
    required: true
  },
  {
    id: 'learning-style',
    question: 'What is your preferred learning style?',
    type: 'multiple-choice',
    options: ['Visual (Videos, Images)', 'Auditory (Listening, Speaking)', 'Reading & Writing', 'Interactive & Hands-on', 'Mixed Approach'],
    required: true
  },
  {
    id: 'experience',
    question: 'Have you learned other languages before?',
    type: 'multiple-choice',
    options: ['No, this is my first language', 'Yes, 1-2 languages', 'Yes, 3+ languages', 'I speak multiple languages fluently'],
    required: true
  },
  {
    id: 'age-group',
    question: 'What is your age group?',
    type: 'multiple-choice',
    options: ['7-12 years', '13-17 years', '18-25 years', '26-40 years', '41+ years'],
    required: true
  },
  {
    id: 'motivation',
    question: 'What motivates you most to learn a new language?',
    type: 'multiple-choice',
    options: ['Career advancement', 'Cultural understanding', 'Travel opportunities', 'Academic requirements', 'Personal interest', 'Family connection'],
    required: true
  }
]

export function AssessmentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const currentQ = assessmentQuestions[currentQuestion]
  const isLastQuestion = currentQuestion === assessmentQuestions.length - 1
  const canProceed = answers.find(a => a.questionId === currentQ.id) !== undefined

  const handleAnswer = (answer: string | number) => {
    const existingAnswerIndex = answers.findIndex(a => a.questionId === currentQ.id)
    
    if (existingAnswerIndex >= 0) {
      const newAnswers = [...answers]
      newAnswers[existingAnswerIndex].answer = answer
      setAnswers(newAnswers)
    } else {
      setAnswers([...answers, { questionId: currentQ.id, answer }])
    }
  }

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      if (isEmailEnabled()) {
        // Get user email from answers
        const userEmail = answers.find(a => a.questionId === 'email')?.answer as string
        
        if (!userEmail) {
          console.error('No email found in answers')
          setIsSubmitting(false)
          return
        }
        
        // Prepare assessment result data
        const assessmentResult = {
          email: userEmail,
          recommendations: generateRecommendations(),
          answers: answers
        }
        
        // Send emails
        const emailResult = await sendAssessmentResults(assessmentResult)
        
        if (emailResult.success) {
          console.log('✅ Emails sent successfully')
        } else {
          console.error('❌ Failed to send emails:', emailResult.message)
          // You could show a toast notification here
          // toast.error('Failed to send emails. Please try again.')
        }
        
        // Wait a bit more to show the email sending process
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        // Email system disabled - just wait a moment for UX
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      
    } catch (error) {
      console.error('Error during assessment submission:', error)
    }
    
    setIsSubmitting(false)
    setShowResults(true)
  }

  const getCurrentAnswer = () => {
    const answer = answers.find(a => a.questionId === currentQ.id)
    return answer?.answer || ''
  }

  const generateRecommendations = () => {
    const languageAnswer = answers.find(a => a.questionId === 'languages')?.answer as string
    const proficiencyAnswer = answers.find(a => a.questionId === 'proficiency')?.answer as string
    const goalsAnswer = answers.find(a => a.questionId === 'goals')?.answer as string
    const timeAnswer = answers.find(a => a.questionId === 'time')?.answer as string

    let recommendedLanguage = languageAnswer || 'Tagalog/Filipino'
    let difficulty = 'Beginner'
    let estimatedTime = '3-6 months'

    if (proficiencyAnswer === 'Intermediate' || proficiencyAnswer === 'Advanced') {
      difficulty = 'Intermediate'
      estimatedTime = '2-4 months'
    }

    if (goalsAnswer === 'Business & Career') {
      recommendedLanguage = 'English'
      difficulty = 'Intermediate'
      estimatedTime = '4-8 months'
    }

    if (timeAnswer === '6-10 hours' || timeAnswer === '10+ hours') {
      estimatedTime = '2-4 months'
    }

    return {
      recommendedLanguage,
      difficulty,
      estimatedTime,
      studyPlan: generateStudyPlan(timeAnswer, difficulty)
    }
  }

  const generateStudyPlan = (timePerWeek: string, difficulty: string) => {
    const plans = {
      '1-2 hours': {
        beginner: '2-3 lessons per week, 15-20 minutes daily practice',
        intermediate: '2 lessons per week, 20-30 minutes daily practice'
      },
      '3-5 hours': {
        beginner: '4-5 lessons per week, 30-45 minutes daily practice',
        intermediate: '3-4 lessons per week, 45-60 minutes daily practice'
      },
      '6-10 hours': {
        beginner: '6-7 lessons per week, 1-1.5 hours daily practice',
        intermediate: '5-6 lessons per week, 1.5-2 hours daily practice'
      },
      '10+ hours': {
        beginner: '8+ lessons per week, 2+ hours daily practice',
        intermediate: '7+ lessons per week, 2+ hours daily practice'
      }
    }

    return plans[timePerWeek as keyof typeof plans]?.[difficulty as keyof typeof plans['1-2 hours']] || 'Custom plan based on your schedule'
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
          exit={{ scale: 0.9, opacity: 1 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center">
                <Brain className="w-6 h-6 mr-2" />
                Language Learning Assessment
              </h2>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>Question {currentQuestion + 1} of {assessmentQuestions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / assessmentQuestions.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / assessmentQuestions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 pb-8 flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {!showResults ? (
              <>
                {/* Question */}
                <div className="flex-1 min-h-0">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    {currentQ.question}
                  </h3>
                  

                  
                  {currentQ.type === 'multiple-choice' && currentQ.options && (
                    <div className="space-y-3 overflow-y-auto max-h-64">
                      {currentQ.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswer(option)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                            getCurrentAnswer() === option
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {getCurrentAnswer() === option && (
                              <CheckCircle className="w-5 h-5 text-primary-500" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {currentQ.type === 'text' && (
                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={getCurrentAnswer() as string}
                        onChange={(e) => handleAnswer(e.target.value)}
                        className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                      />
                      {getCurrentAnswer() && (
                        <div className="flex items-center text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Email entered successfully
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation - Fixed at bottom */}
                <div className="flex justify-between mt-6 pt-6 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className={`flex items-center ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLastQuestion ? (
                      <>
                        {isSubmitting ? (
                          <>
                            {isEmailEnabled() ? (
                              <>
                                <Mail className="w-4 h-4 mr-2 animate-pulse" />
                                Sending Results...
                              </>
                            ) : (
                              <>
                                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                                Analyzing Results...
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            Get My Results
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <AssessmentResults 
                recommendations={generateRecommendations()}
                onClose={onClose}
                onStartLearning={() => {
                  onClose()
                  // Navigate to courses or sign up
                }}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function AssessmentResults({ 
  recommendations, 
  onClose, 
  onStartLearning 
}: { 
  recommendations: any
  onClose: () => void
  onStartLearning: () => void
}) {
  return (
    <div className="text-center">
      <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Assessment Complete!
          </h3>
          <p className="text-gray-600 mb-4">
            Based on your answers, here are your personalized recommendations:
          </p>
          
          {/* Email confirmation - only show if email system is enabled */}
          {isEmailEnabled() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center text-blue-700">
                <Mail className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">
                  Results sent to your email! Check your inbox.
                </span>
              </div>
            </div>
          )}
        </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
          🎯 Your Personalized Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <Globe className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">Recommended Language</h4>
            <p className="text-primary-700">{recommendations.recommendedLanguage}</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <Target className="w-8 h-8 text-secondary-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">Difficulty Level</h4>
            <p className="text-secondary-700">{recommendations.difficulty}</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <Clock className="w-8 h-8 text-accent-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">Estimated Time</h4>
            <p className="text-accent-700">{recommendations.estimatedTime}</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <Brain className="w-8 h-8 text-success-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">Study Plan</h4>
            <p className="text-success-700 text-sm">{recommendations.studyPlan}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-8 pt-6 border-t border-gray-100">
        <Button onClick={onStartLearning} className="w-full py-3 text-lg font-semibold">
          Start Learning Now
        </Button>
        <Button variant="outline" onClick={onClose} className="w-full py-3">
          Close Assessment
        </Button>
      </div>
    </div>
  )
}
