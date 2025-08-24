'use client'

import { useState } from 'react'
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
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores'
import { Header } from '@/components/Header'

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
  
  const [currentStep, setCurrentStep] = useState<'intro' | 'language-select' | 'assessment' | 'results'>('intro')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [timeSpent, setTimeSpent] = useState(0)
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  
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
      recommendedCourses: getRecommendedCourses(selectedLanguage, level),
      strengths: getStrengths(correctAnswers),
      improvements: getImprovements(incorrectAnswers)
    }

    setAssessmentResult(result)
    setCurrentStep('results')
    
    // Save result to localStorage
    const savedResults = JSON.parse(localStorage.getItem('assessment_results') || '[]')
    savedResults.push({
      ...result,
      completedAt: new Date().toISOString(),
      timeSpent
    })
    localStorage.setItem('assessment_results', JSON.stringify(savedResults))
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {languages.map((language, index) => (
              <motion.button
                key={language.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedLanguage(language.name)}
                className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                  selectedLanguage === language.name
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-4xl mb-3">{language.flag}</div>
                <h3 className="text-lg font-semibold mb-2">{language.name}</h3>
                <p className="text-sm text-gray-600">{language.description}</p>
              </motion.button>
            ))}
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep('intro')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep('assessment')}
              disabled={!selectedLanguage}
            >
              Start Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
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

  return null
}
