import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** A lesson within a course section (used in course contents) */
export interface CourseLessonContent {
  id: string
  name: string
  description: string
  durationMinutes: number
  videoUrl?: string
  thumbnailUrl?: string
}

/** A section/category of the course with its lessons */
export interface CourseSectionContent {
  id: string
  name: string
  lessons: CourseLessonContent[]
}

export interface Course {
  id: string
  title: string
  description: string
  subject: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  duration: string
  lessons: number
  instructor: string
  price: number
  image?: string
  category: string[]
  createdAt: string
  updatedAt: string
  students: number
  rating: number
  features: string[]
  flag?: string
  /** Full curriculum: sections and lessons (from create course flow) */
  contents?: CourseSectionContent[]
  /** Course status for teacher dashboard */
  status?: 'active' | 'draft' | 'inactive' | 'archived'
  /** Whether course includes a certificate on completion */
  includesCertificate?: boolean
  /** Whether course includes a final assessment */
  includesFinalAssessment?: boolean
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  enrolledAt: string
  progress: number // 0-100
  completedLessons: string[]
  lastAccessedAt: string
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED'
}

export interface CoursesState {
  // State
  courses: Course[]
  enrollments: Enrollment[]
  isLoading: boolean
  
  // Actions
  fetchCourses: () => Promise<Course[]>
  addCourse: (course: Course) => void
  updateCourse: (courseId: string, updates: Partial<Course>) => void
  deleteCourse: (courseId: string) => void
  enrollInCourse: (courseId: string, userId: string) => Promise<Enrollment>
  updateProgress: (enrollmentId: string, lessonId: string, progress: number) => void
  getEnrolledCourses: (userId: string) => Course[]
  getEnrollment: (courseId: string, userId: string) => Enrollment | null
  completeLesson: (enrollmentId: string, lessonId: string) => void
}

export const useCoursesStore = create<CoursesState>()(
  persist(
    (set, get) => ({
      // Initial state
      courses: [],
      enrollments: [],
      isLoading: false,

      // Fetch courses
      fetchCourses: async () => {
        set({ isLoading: true })
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const mockCourses: Course[] = [
            {
              id: 'course_1',
              title: 'English for Beginners',
              description: 'Learn basic English vocabulary and grammar',
              subject: 'English',
              level: 'BEGINNER',
              duration: '8 weeks',
              lessons: 24,
              instructor: 'Sarah Johnson',
              price: 99.99,
              category: ['Language', 'Beginner'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              students: 2500,
              rating: 4.8,
              features: ['Interactive Lessons', 'Speaking Practice', 'Grammar Exercises', 'Vocabulary Building'],
              flag: '🇺🇸'
            },
            {
              id: 'course_2',
              title: 'Tagalog Conversation',
              description: 'Master everyday Tagalog conversations',
              subject: 'Tagalog',
              level: 'INTERMEDIATE',
              duration: '6 weeks',
              lessons: 18,
              instructor: 'Maria Santos',
              price: 79.99,
              category: ['Language', 'Conversation'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              students: 1200,
              rating: 4.9,
              features: ['Conversation Practice', 'Cultural Context', 'Pronunciation Guide', 'Real-life Scenarios'],
              flag: '🇵🇭'
            },
            {
              id: 'course_3',
              title: 'Korean Essentials',
              description: 'Essential Korean phrases and culture',
              subject: 'Korean',
              level: 'BEGINNER',
              duration: '10 weeks',
              lessons: 30,
              instructor: 'Ji-eun Kim',
              price: 119.99,
              category: ['Language', 'Culture'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              students: 3400,
              rating: 4.7,
              features: ['Hangul Writing', 'K-Culture', 'Grammar Basics', 'Listening Practice'],
              flag: '🇰🇷'
            }
          ]
          
          set({ courses: mockCourses, isLoading: false })
          return mockCourses
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      // Add a new course
      addCourse: (course: Course) => {
        set(state => ({ courses: [course, ...state.courses] }))
      },

      // Update an existing course
      updateCourse: (courseId: string, updates: Partial<Course>) => {
        const now = new Date().toISOString()
        set(state => ({
          courses: state.courses.map(c =>
            c.id === courseId
              ? { ...c, ...updates, updatedAt: now }
              : c
          )
        }))
      },

      // Delete a course and its enrollments
      deleteCourse: (courseId: string) => {
        set(state => ({
          courses: state.courses.filter(c => c.id !== courseId),
          enrollments: state.enrollments.filter(e => e.courseId !== courseId)
        }))
      },

      // Enroll in course
      enrollInCourse: async (courseId: string, userId: string) => {
        const { courses, enrollments } = get()
        const course = courses.find(c => c.id === courseId)
        
        if (!course) {
          throw new Error('Course not found')
        }
        
        // Check if already enrolled
        const existingEnrollment = enrollments.find(
          e => e.courseId === courseId && e.userId === userId
        )
        
        if (existingEnrollment) {
          return existingEnrollment
        }
        
        const newEnrollment: Enrollment = {
          id: `enrollment_${Date.now()}`,
          userId,
          courseId,
          enrolledAt: new Date().toISOString(),
          progress: 0,
          completedLessons: [],
          lastAccessedAt: new Date().toISOString(),
          status: 'ACTIVE'
        }
        
        set(state => ({
          enrollments: [...state.enrollments, newEnrollment]
        }))
        
        return newEnrollment
      },

      // Update progress
      updateProgress: (enrollmentId: string, lessonId: string, progress: number) => {
        set(state => ({
          enrollments: state.enrollments.map(enrollment => 
            enrollment.id === enrollmentId
              ? { 
                  ...enrollment, 
                  progress: Math.max(enrollment.progress, progress),
                  lastAccessedAt: new Date().toISOString()
                }
              : enrollment
          )
        }))
      },

      // Get enrolled courses for a user
      getEnrolledCourses: (userId: string) => {
        const { courses, enrollments } = get()
        const userEnrollments = enrollments.filter(e => e.userId === userId)
        
        return userEnrollments.map(enrollment => {
          const course = courses.find(c => c.id === enrollment.courseId)
          return course!
        }).filter(Boolean)
      },

      // Get specific enrollment
      getEnrollment: (courseId: string, userId: string) => {
        const { enrollments } = get()
        return enrollments.find(
          e => e.courseId === courseId && e.userId === userId
        ) || null
      },

      // Complete lesson
      completeLesson: (enrollmentId: string, lessonId: string) => {
        set(state => ({
          enrollments: state.enrollments.map(enrollment => 
            enrollment.id === enrollmentId
              ? { 
                  ...enrollment, 
                  completedLessons: Array.from(new Set([...enrollment.completedLessons, lessonId])),
                  lastAccessedAt: new Date().toISOString()
                }
              : enrollment
          )
        }))
      }
    }),
    {
      name: 'courses-storage',
      partialize: (state) => ({
        courses: state.courses,
        enrollments: state.enrollments
      })
    }
  )
)
