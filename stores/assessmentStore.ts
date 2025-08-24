import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AssessmentResult {
  id: string
  language: string
  level: 'beginner' | 'intermediate' | 'advanced'
  score: number
  maxScore: number
  percentage: number
  recommendedCourses: string[]
  strengths: string[]
  improvements: string[]
  completedAt: string
  timeSpent: number
  userId?: string
}

export interface AssessmentQuestion {
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

export interface AssessmentState {
  // State
  results: AssessmentResult[]
  currentAssessment: {
    language: string
    questions: AssessmentQuestion[]
    answers: Record<number, number>
    startTime: number
    isActive: boolean
  } | null
  isLoading: boolean
  
  // Actions
  startAssessment: (language: string, questions: AssessmentQuestion[]) => void
  saveAnswer: (questionId: number, answerIndex: number) => void
  completeAssessment: (result: Omit<AssessmentResult, 'id' | 'completedAt'>) => AssessmentResult
  getResultsByLanguage: (language: string) => AssessmentResult[]
  getLatestResult: (language?: string) => AssessmentResult | null
  clearAssessment: () => void
  deleteResult: (resultId: string) => void
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      // Initial state
      results: [],
      currentAssessment: null,
      isLoading: false,

      // Start a new assessment
      startAssessment: (language: string, questions: AssessmentQuestion[]) => {
        console.log(`🎯 Starting ${language} assessment with ${questions.length} questions`)
        
        set({
          currentAssessment: {
            language,
            questions,
            answers: {},
            startTime: Date.now(),
            isActive: true
          }
        })
      },

      // Save an answer
      saveAnswer: (questionId: number, answerIndex: number) => {
        const { currentAssessment } = get()
        if (!currentAssessment) return

        console.log(`💭 Answer saved: Question ${questionId} = Option ${answerIndex}`)
        
        set({
          currentAssessment: {
            ...currentAssessment,
            answers: {
              ...currentAssessment.answers,
              [questionId]: answerIndex
            }
          }
        })
      },

      // Complete assessment and save result
      completeAssessment: (resultData) => {
        const { currentAssessment, results } = get()
        if (!currentAssessment) {
          throw new Error('No active assessment to complete')
        }

        const result: AssessmentResult = {
          ...resultData,
          id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          completedAt: new Date().toISOString()
        }

        console.log('🏆 Assessment completed:', {
          language: result.language,
          level: result.level,
          percentage: result.percentage
        })

        set({
          results: [...results, result],
          currentAssessment: null
        })

        return result
      },

      // Get results by language
      getResultsByLanguage: (language: string) => {
        const { results } = get()
        return results
          .filter(result => result.language === language)
          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      },

      // Get latest result
      getLatestResult: (language?: string) => {
        const { results } = get()
        const filteredResults = language 
          ? results.filter(result => result.language === language)
          : results

        if (filteredResults.length === 0) return null

        return filteredResults.reduce((latest, current) => 
          new Date(current.completedAt) > new Date(latest.completedAt) ? current : latest
        )
      },

      // Clear current assessment
      clearAssessment: () => {
        console.log('🧹 Clearing current assessment')
        set({ currentAssessment: null })
      },

      // Delete a result
      deleteResult: (resultId: string) => {
        console.log('🗑️ Deleting assessment result:', resultId)
        set(state => ({
          results: state.results.filter(result => result.id !== resultId)
        }))
      }
    }),
    {
      name: 'assessment-storage',
      partialize: (state) => ({
        results: state.results
        // Don't persist currentAssessment to avoid stale sessions
      })
    }
  )
)
