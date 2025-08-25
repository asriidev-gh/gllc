'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Target, 
  BookOpen,
  Clock,
  Star,
  Award,
  Languages,
  Brain,
  Headphones,
  MessageCircle,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores'
import { Header } from '@/components/Header'
import { recordLearningActivity } from '@/lib/learningActivity'

interface Question {
  id: number
  type: 'multiple-choice' | 'reading' | 'listening' | 'scenario'
  language: string
  level: 'beginner' | 'intermediate' | 'advanced'
  question: string
  options?: string[]
  correctAnswer: number
  explanation?: string
  scenario?: string
  points: number
}

interface AssessmentResult {
  language: string
  level: 'beginner' | 'intermediate' | 'advanced'
  score: number
  maxScore: number
  percentage: number
  completedAt: string
  timeSpent: number
  recommendedCourses: string[]
  strengths: string[]
  improvements: string[]
}

const questions: Question[] = [
  // English Assessment Questions
  {
    id: 1,
    type: 'multiple-choice',
    language: 'English',
    level: 'beginner',
    question: 'What is the correct greeting for morning?',
    options: ['Good night', 'Good morning', 'Good evening', 'Good afternoon'],
    correctAnswer: 1,
    explanation: 'Good morning is used from sunrise until noon.',
    points: 5
  },
  {
    id: 2,
    type: 'multiple-choice',
    language: 'English',
    level: 'beginner',
    question: 'Choose the correct sentence:',
    options: ['I am going to school', 'I is going to school', 'I are going to school', 'I be going to school'],
    correctAnswer: 0,
    explanation: 'Use "am" with "I" in present continuous tense.',
    points: 5
  },
  {
    id: 3,
    type: 'multiple-choice',
    language: 'English',
    level: 'intermediate',
    question: 'What does "break the ice" mean?',
    options: ['To literally break ice', 'To start a conversation', 'To stop talking', 'To be very cold'],
    correctAnswer: 1,
    explanation: 'This idiom means to initiate conversation in a social setting.',
    points: 10
  },
  {
    id: 4,
    type: 'reading',
    language: 'English',
    level: 'intermediate',
    question: 'Read the text and answer: "The restaurant was bustling with activity. Waiters hurried between tables while the chef called out orders from the kitchen." What was the restaurant like?',
    options: ['Empty and quiet', 'Busy and active', 'Closed for business', 'Only serving takeout'],
    correctAnswer: 1,
    explanation: 'Bustling means full of activity and movement.',
    points: 10
  },
  {
    id: 5,
    type: 'multiple-choice',
    language: 'English',
    level: 'advanced',
    question: 'Choose the sentence with correct subjunctive mood:',
    options: [
      'If I was rich, I would travel',
      'If I were rich, I would travel', 
      'If I am rich, I would travel',
      'If I will be rich, I would travel'
    ],
    correctAnswer: 1,
    explanation: 'Use "were" (not "was") in subjunctive mood for hypothetical situations.',
    points: 15
  },

  // Tagalog Assessment Questions
  {
    id: 6,
    type: 'multiple-choice',
    language: 'Tagalog',
    level: 'beginner',
    question: 'What does "Kumusta" mean in English?',
    options: ['Goodbye', 'Hello/How are you', 'Thank you', 'Please'],
    correctAnswer: 1,
    explanation: 'Kumusta is a common greeting meaning "How are you?"',
    points: 5
  },
  {
    id: 7,
    type: 'multiple-choice',
    language: 'Tagalog',
    level: 'beginner',
    question: 'How do you say "Thank you" in Tagalog?',
    options: ['Paalam', 'Salamat', 'Paumanhin', 'Tuloy'],
    correctAnswer: 1,
    explanation: 'Salamat means "Thank you" in Tagalog.',
    points: 5
  },
  {
    id: 8,
    type: 'multiple-choice',
    language: 'Tagalog',
    level: 'intermediate',
    question: 'Complete the sentence: "Ako ay _____ sa Pilipinas" (I live in the Philippines)',
    options: ['nakatira', 'natutulog', 'naglalakad', 'nag-aaral'],
    correctAnswer: 0,
    explanation: 'Nakatira means "to live" or "to reside".',
    points: 10
  },

  // Korean Assessment Questions
  {
    id: 9,
    type: 'multiple-choice',
    language: 'Korean',
    level: 'beginner',
    question: 'What does "안녕하세요" (Annyeonghaseyo) mean?',
    options: ['Goodbye', 'Hello/Good morning', 'Thank you', 'Excuse me'],
    correctAnswer: 1,
    explanation: 'Annyeonghaseyo is a formal greeting meaning "Hello".',
    points: 5
  },
  {
    id: 10,
    type: 'multiple-choice',
    language: 'Korean',
    level: 'beginner',
    question: 'How do you say "Thank you" in Korean?',
    options: ['미안해요', '안녕히 가세요', '감사합니다', '죄송합니다'],
    correctAnswer: 2,
    explanation: 'Gamsahamnida (감사합니다) means "Thank you".',
    points: 5
  }
]

export default function AssessmentPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  const [currentStep, setCurrentStep] = useState<'intro' | 'language-select' | 'assessment' | 'results' | 'history'>('intro')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [timeSpent, setTimeSpent] = useState(0)
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([])
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [isStartingAssessment, setIsStartingAssessment] = useState(false)
  const [showRetakeConfirm, setShowRetakeConfirm] = useState(false)
  const [languageToRetake, setLanguageToRetake] = useState<string>('')
  
  // Fetch assessment results on component mount
  useEffect(() => {
    const savedResults = JSON.parse(localStorage.getItem('assessment_results') || '[]')
    console.log('📊 Initial assessment results loaded:', savedResults)
    setAssessmentResults(savedResults)
    
    // Check if user came from dashboard with history step
    const urlParams = new URLSearchParams(window.location.search)
    const step = urlParams.get('step')
    if (step === 'history') {
      setCurrentStep('history')
    }
  }, [])

  // Auto-start assessment when language is selected
  useEffect(() => {
    if (selectedLanguage && currentStep === 'language-select') {
      console.log('🚀 Auto-start effect triggered for:', selectedLanguage)
      setIsStartingAssessment(true)
      // Small delay to show the language selection briefly
      const timer = setTimeout(() => {
        console.log('🚀 Starting assessment for:', selectedLanguage)
        setCurrentStep('assessment')
        setIsStartingAssessment(false)
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [selectedLanguage, currentStep])
  
  const languages = [
    { name: 'English', flag: '🇺🇸', description: 'Global communication language' },
    { name: 'Tagalog', flag: '🇵🇭', description: 'Philippine national language' },
    { name: 'Korean', flag: '🇰🇷', description: 'Popular Asian language' },
    { name: 'Japanese', flag: '🇯🇵', description: 'Language of innovation' },
    { name: 'Chinese', flag: '🇨🇳', description: 'Most spoken language worldwide' },
    { name: 'Spanish', flag: '🇪🇸', description: 'Widely spoken romance language' }
  ]

  const filteredQuestions = questions.filter(q => q.language === selectedLanguage)
  const currentQuestion = filteredQuestions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1

  const selectAnswer = (answerIndex: number) => {
    if (!currentQuestion) return
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answerIndex }))
  }

  const nextQuestion = () => {
    if (isLastQuestion) {
      calculateResults()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const calculateResults = () => {
    let totalScore = 0
    let maxScore = 0
    const correctAnswers: Question[] = []
    const incorrectAnswers: Question[] = []

    filteredQuestions.forEach(question => {
      maxScore += question.points
      const userAnswer = answers[question.id]
      
      if (userAnswer === question.correctAnswer) {
        totalScore += question.points
        correctAnswers.push(question)
      } else {
        incorrectAnswers.push(question)
      }
    })

    const percentage = Math.round((totalScore / maxScore) * 100)
    let level: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
    
    if (percentage >= 80) level = 'advanced'
    else if (percentage >= 60) level = 'intermediate'
    
    const result: AssessmentResult = {
      language: selectedLanguage,
      level,
      score: totalScore,
      maxScore,
      percentage,
      completedAt: new Date().toISOString(),
      timeSpent,
      recommendedCourses: getRecommendedCourses(selectedLanguage, level),
      strengths: getStrengths(correctAnswers),
      improvements: getImprovements(incorrectAnswers)
    }

    const finalResult = {
      ...result,
      completedAt: new Date().toISOString(),
      timeSpent
    }
    
    setAssessmentResult(result)
    setCurrentStep('results')
    
    // Save result to localStorage and update state
    const savedResults = JSON.parse(localStorage.getItem('assessment_results') || '[]')
    savedResults.push(finalResult)
    localStorage.setItem('assessment_results', JSON.stringify(savedResults))
    
    // Update the assessment results state
    setAssessmentResults(prev => [...prev, finalResult])
    
    // Record assessment completion activity
    if (user?.email) {
      recordLearningActivity(user.email, 'assessment_completed', `${selectedLanguage} assessment - ${level} level (${percentage}%)`)
    }
  }

  const getRecommendedCourses = (language: string, level: string): string[] => {
    const courseMap: Record<string, Record<string, string[]>> = {
      'English': {
        'beginner': ['English Basics', 'English for Beginners'],
        'intermediate': ['English Conversation', 'Business English'],
        'advanced': ['Advanced English Grammar', 'English Literature']
      },
      'Tagalog': {
        'beginner': ['Tagalog Basics', 'Filipino for Foreigners'],
        'intermediate': ['Tagalog Conversation', 'Filipino Culture'],
        'advanced': ['Advanced Tagalog', 'Filipino Literature']
      },
      'Korean': {
        'beginner': ['Korean Basics', 'Hangul Writing'],
        'intermediate': ['Korean Conversation', 'K-Culture'],
        'advanced': ['Advanced Korean', 'Korean Business']
      }
    }
    
    return courseMap[language]?.[level] || []
  }

  const getStrengths = (correctAnswers: Question[]): string[] => {
    const strengths = []
    if (correctAnswers.some(q => q.type === 'multiple-choice')) strengths.push('Grammar and Vocabulary')
    if (correctAnswers.some(q => q.type === 'reading')) strengths.push('Reading Comprehension')
    if (correctAnswers.some(q => q.level === 'advanced')) strengths.push('Advanced Concepts')
    return strengths
  }

  const getImprovements = (incorrectAnswers: Question[]): string[] => {
    const improvements = []
    if (incorrectAnswers.some(q => q.type === 'multiple-choice')) improvements.push('Grammar and Vocabulary')
    if (incorrectAnswers.some(q => q.type === 'reading')) improvements.push('Reading Comprehension')
    if (incorrectAnswers.some(q => q.level === 'beginner')) improvements.push('Basic Fundamentals')
    return improvements
  }

  const restartAssessment = () => {
    setCurrentStep('intro')
    setSelectedLanguage('')
    setCurrentQuestionIndex(0)
    setAnswers({})
    setAssessmentResult(null)
    setTimeSpent(0)
  }

  const handleExitAssessment = () => {
    console.log('🚪 Exit assessment clicked')
    console.log('🚪 Current answers:', answers)
    console.log('🚪 Answers length:', Object.keys(answers).length)
    
    if (Object.keys(answers).length > 0) {
      // User has answered some questions, show confirmation
      console.log('🚪 Showing exit confirmation')
      setShowExitConfirm(true)
    } else {
      // No answers yet, exit directly
      console.log('🚪 No answers, exiting directly')
      setCurrentStep('intro')
      setSelectedLanguage('')
      setCurrentQuestionIndex(0)
      setAnswers({})
      setTimeSpent(0)
    }
  }

  const confirmExit = () => {
    setCurrentStep('intro')
    setSelectedLanguage('')
    setCurrentQuestionIndex(0)
    setAnswers({})
    setTimeSpent(0)
    setShowExitConfirm(false)
  }

  const checkPreviousAssessment = (language: string) => {
    console.log('🔍 Checking previous assessment for:', language)
    console.log('🔍 Current assessmentResults:', assessmentResults)
    console.log('🔍 assessmentResults length:', assessmentResults.length)
    console.log('🔍 assessmentResults type:', typeof assessmentResults)
    
    // Make sure assessmentResults is an array
    if (!Array.isArray(assessmentResults)) {
      console.log('🔍 assessmentResults is not an array, resetting to empty array')
      setAssessmentResults([])
      return false
    }
    
    const previousResult = assessmentResults.find(result => result.language === language)
    console.log('🔍 Previous result found:', previousResult)
    
    if (previousResult) {
      console.log('🔍 Setting retake confirmation for:', language)
      setLanguageToRetake(language)
      setShowRetakeConfirm(true)
      return true
    }
    
    console.log('🔍 No previous result found for:', language)
    return false
  }

  const confirmRetake = () => {
    console.log('✅ Confirming retake for:', languageToRetake)
    setShowRetakeConfirm(false)
    
    // Remove the previous result for this language
    const updatedResults = assessmentResults.filter(result => result.language !== languageToRetake)
    setAssessmentResults(updatedResults)
    localStorage.setItem('assessment_results', JSON.stringify(updatedResults))
    
    // Set the selected language
    setSelectedLanguage(languageToRetake)
    setLanguageToRetake('')
    
    // Don't manually start assessment - let the auto-start effect handle it
    // The auto-start effect will trigger when selectedLanguage changes
  }

  const cancelRetake = () => {
    console.log('❌ Cancelling retake')
    setShowRetakeConfirm(false)
    setLanguageToRetake('')
    // Don't reset selectedLanguage here, let user choose again
  }

  const goToCourses = () => {
    router.push('/courses')
  }

  if (currentStep === 'intro') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-600 rounded-full">
                <Target className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Language Assessment</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover your language proficiency level and get personalized course recommendations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <Brain className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Assessment</h3>
              <p className="text-gray-600">Adaptive questions that adjust to your skill level</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <Clock className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quick & Easy</h3>
              <p className="text-gray-600">Takes only 5-10 minutes to complete</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <Award className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Personalized Results</h3>
              <p className="text-gray-600">Get custom course recommendations</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Button
              onClick={() => setCurrentStep('language-select')}
              className="px-8 py-4 text-lg"
            >
              Start Assessment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
      </>
    )
  }

  if (currentStep === 'language-select') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Language</h1>
            <p className="text-gray-600">
              Select the language you'd like to assess your proficiency in
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {languages.map((language, index) => (
              <motion.button
                key={language.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  console.log('🖱️ Language clicked:', language.name)
                  console.log('🖱️ Current assessmentResults state:', assessmentResults)
                  
                  // Check if this language has been assessed before
                  const hasPrevious = assessmentResults.some(result => result.language === language.name)
                  console.log('🖱️ Has previous assessment:', hasPrevious)
                  
                  if (hasPrevious) {
                    // Show retake confirmation
                    console.log('🔄 Showing retake confirmation for:', language.name)
                    setLanguageToRetake(language.name)
                    setShowRetakeConfirm(true)
                  } else {
                    // No previous assessment, proceed normally
                    console.log('🆕 No previous assessment, setting language to:', language.name)
                    setSelectedLanguage(language.name)
                  }
                }}
                className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg relative ${
                  selectedLanguage === language.name
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Completion indicator */}
                {assessmentResults.some(result => result.language === language.name) && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                
                <div className="text-4xl mb-3">{language.flag}</div>
                <h3 className="text-lg font-semibold mb-2">{language.name}</h3>
                <p className="text-sm text-gray-600">{language.description}</p>
                
                {/* Previous result info */}
                {assessmentResults.some(result => result.language === language.name) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {(() => {
                      const result = assessmentResults.find(r => r.language === language.name)
                      return result ? (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Previous: </span>
                          {result.level.charAt(0).toUpperCase() + result.level.slice(1)} Level ({result.percentage}%)
                        </div>
                      ) : null
                    })()}
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Auto-start message */}
          {selectedLanguage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                {isStartingAssessment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></div>
                    <span className="font-medium">Starting your {selectedLanguage} assessment...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    <span className="font-medium">Assessment will start automatically in a few seconds...</span>
                  </>
                )}
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Get ready for your {selectedLanguage} assessment!
              </p>
            </motion.div>
          )}

          {/* Assessment History Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-600" />
                Your Assessment History
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep('history')}
                className="text-sm"
              >
                View All Results
              </Button>
            </div>
            
            {assessmentResults.length > 0 ? (
              <div className="space-y-3">
                {assessmentResults.slice(0, 3).map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        result.level === 'beginner' ? 'bg-green-500' :
                        result.level === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium text-gray-900">{result.language}</span>
                      <span className="text-sm text-gray-600 capitalize">({result.level})</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-semibold text-blue-600">
                        {result.percentage}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {assessmentResults.length > 3 && (
                  <p className="text-sm text-gray-600 text-center pt-2">
                    +{assessmentResults.length - 3} more results
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No assessments completed yet</p>
                <p className="text-sm text-gray-500">Complete your first assessment to see your progress!</p>
              </div>
            )}
          </motion.div>

          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep('intro')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>
      </>
    )
  }

  if (currentStep === 'assessment' && currentQuestion) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-3xl mx-auto px-4">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleExitAssessment}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit Assessment</span>
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestionIndex + 1} of {filteredQuestions.length}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {selectedLanguage} Assessment
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl p-8 shadow-lg"
          >
            <div className="flex items-center mb-6">
              {currentQuestion.type === 'reading' && <BookOpen className="w-6 h-6 text-blue-600 mr-3" />}
              {currentQuestion.type === 'listening' && <Headphones className="w-6 h-6 text-green-600 mr-3" />}
              {currentQuestion.type === 'multiple-choice' && <MessageCircle className="w-6 h-6 text-purple-600 mr-3" />}
              <span className="text-sm font-medium text-gray-600 capitalize">
                {currentQuestion.type.replace('-', ' ')} • {currentQuestion.level}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3 mb-8">
              {currentQuestion.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestion.id] === index
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3 flex items-center justify-center">
                      {answers[currentQuestion.id] === index && (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </span>
                    {option}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={answers[currentQuestion.id] === undefined}
              >
                {isLastQuestion ? 'Finish Assessment' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      </>
    )
  }

  // Exit Confirmation Modal
  if (showExitConfirm) {
    console.log('🚪 Rendering exit confirmation modal')
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
          <div className="max-w-md mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-8 shadow-lg text-center"
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Exit Assessment?</h2>
              <p className="text-gray-600 mb-6">
                You've answered some questions. Are you sure you want to exit? Your progress will be lost.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1"
                >
                  Continue Assessment
                </Button>
                <Button
                  onClick={confirmExit}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Exit Assessment
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    )
  }

  // Retake Assessment Confirmation Modal
  if (showRetakeConfirm) {
    console.log('🔄 Rendering retake confirmation modal')
    console.log('🔄 Language to retake:', languageToRetake)
    console.log('🔄 Current assessmentResults:', assessmentResults)
    const previousResult = assessmentResults.find(result => result.language === languageToRetake)
    console.log('🔄 Previous result found:', previousResult)
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
          <div className="max-w-md mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-8 shadow-lg text-center"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Retake {languageToRetake} Assessment?</h2>
              <p className="text-gray-600 mb-4">
                You've already taken this assessment before. Your previous result will be replaced.
              </p>
              {previousResult && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg text-left">
                  <p className="text-sm text-gray-600 mb-1">Previous Result:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {previousResult.level.charAt(0).toUpperCase() + previousResult.level.slice(1)} Level
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {previousResult.percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Completed on {new Date(previousResult.completedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={cancelRetake}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmRetake}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  Retake Assessment
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    )
  }

  if (currentStep === 'results' && assessmentResult) {
    const levelColor = {
      beginner: 'text-yellow-600 bg-yellow-100',
      intermediate: 'text-blue-600 bg-blue-100',
      advanced: 'text-green-600 bg-green-100'
    }

    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-600 rounded-full">
                <Award className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Assessment Complete!</h1>
            <p className="text-xl text-gray-600">
              Here are your {assessmentResult.language} language proficiency results
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Results Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Results</h2>
              
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-blue-600 mb-2">
                  {assessmentResult.percentage}%
                </div>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${levelColor[assessmentResult.level]}`}>
                  {assessmentResult.level.charAt(0).toUpperCase() + assessmentResult.level.slice(1)} Level
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Score:</span>
                  <span className="font-semibold">{assessmentResult.score} / {assessmentResult.maxScore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Language:</span>
                  <span className="font-semibold">{assessmentResult.language}</span>
                </div>
                <div className="flex justify-between">
                  <span>Level:</span>
                  <span className="font-semibold capitalize">{assessmentResult.level}</span>
                </div>
              </div>

              {assessmentResult.strengths.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Strengths:</h3>
                  <ul className="space-y-1">
                    {assessmentResult.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {assessmentResult.improvements.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Areas for Improvement:</h3>
                  <ul className="space-y-1">
                    {assessmentResult.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-center text-orange-600">
                        <Target className="w-4 h-4 mr-2" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* Recommended Courses */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Courses</h2>
              
              {assessmentResult.recommendedCourses.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {assessmentResult.recommendedCourses.map((course, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{course}</h3>
                      <p className="text-sm text-gray-600">
                        Perfect for your {assessmentResult.level} level
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 mb-6">
                  Based on your results, we recommend exploring our {assessmentResult.language} courses to continue your learning journey.
                </p>
              )}

              <div className="space-y-3">
                <Button onClick={goToCourses} className="w-full">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse {assessmentResult.language} Courses
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep('history')} className="w-full">
                  <Award className="w-4 h-4 mr-2" />
                  View Assessment History
                </Button>
                <Button variant="outline" onClick={restartAssessment} className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Take Another Assessment
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      </>
    )
  }

  if (currentStep === 'history') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Assessment History</h1>
              <p className="text-gray-600">
                Track your language learning progress and review past assessments
              </p>
            </motion.div>

            {assessmentResults.length > 0 ? (
              <div className="space-y-6">
                {assessmentResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${
                          result.level === 'beginner' ? 'bg-green-500' :
                          result.level === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <h3 className="text-xl font-semibold text-gray-900">{result.language}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          result.level === 'beginner' ? 'bg-green-100 text-green-800' :
                          result.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.level.charAt(0).toUpperCase() + result.level.slice(1)} Level
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{result.percentage}%</div>
                        <div className="text-sm text-gray-500">
                          {new Date(result.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">{result.score}</div>
                        <div className="text-sm text-gray-600">Score</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">{result.maxScore}</div>
                        <div className="text-sm text-gray-600">Max Score</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">{result.timeSpent || 0}</div>
                        <div className="text-sm text-gray-600">Seconds</div>
                      </div>
                    </div>

                    {result.strengths && result.strengths.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Strengths:</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.strengths.map((strength, idx) => (
                            <span key={idx} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.improvements && result.improvements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Areas for Improvement:</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.improvements.map((improvement, idx) => (
                            <span key={idx} className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                              {improvement}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.recommendedCourses && result.recommendedCourses.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Recommended Courses:</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.recommendedCourses.map((course, idx) => (
                            <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                              {course}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-white rounded-xl shadow-lg"
              >
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assessments Yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't completed any assessments yet. Start your language learning journey!
                </p>
                <Button onClick={() => setCurrentStep('intro')}>
                  <Target className="w-4 h-4 mr-2" />
                  Take Your First Assessment
                </Button>
              </motion.div>
            )}

            <div className="text-center mt-8">
              <Button variant="outline" onClick={() => setCurrentStep('intro')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Assessment
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return null
}
