'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Play, 
  Pause, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  Circle, 
  ChevronRight,
  ChevronDown,
  Volume2,
  Maximize,
  Download,
  MessageCircle,
  Bookmark,
  Star,
  FileText,
  User,
  Award,
  Target,
  CheckCircle2,
  Heart,
  Share2,
  Flag,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Edit3,
  Save,
  X,
  Trophy
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/stores'
import { Header } from '@/components/Header'
import toast from 'react-hot-toast'
import { recordLearningActivity } from '@/lib/learningActivity'


interface VideoLesson {
  id: string
  title: string
  summary: string
  duration: string
  videoUrl: string
  thumbnail: string
  isWatched: boolean


  order: number
  resources?: CourseResource[]
  comments?: LessonComment[]
}

interface CourseTopic {
  id: string
  title: string
  description: string
  lessons: VideoLesson[]
  order: number
}

interface CourseResource {
  id: string
  name: string
  type: 'pdf' | 'video' | 'audio' | 'document'
  url: string
  size: string
}

interface LessonComment {
  id: string
  user: string
  avatar: string
  content: string
  timestamp: string
  likes: number
  replies: CommentReply[]
}

interface CommentReply {
  id: string
  user: string
  avatar: string
  content: string
  timestamp: string
  likes: number
}

interface CourseNote {
  id: string
  lessonId: string
  content: string
  timestamp: string
  tags: string[]
}

interface CourseProgress {
  totalLessons: number
  completedLessons: number
  totalDuration: string
  watchedDuration: string
  isCompleted: boolean
  completionDate?: string
  certificateEarned?: boolean
  badgeEarned?: boolean
  finalScore?: number
  assessmentCompleted?: boolean
  assessmentDate?: string
}

interface CourseCertificate {
  id: string
  courseName: string
  userName: string
  completionDate: string
  finalScore: number
  certificateUrl: string
  shareableLink: string
}

interface CourseBadge {
  id: string
  name: string
  description: string
  icon: string
  category: string
  unlockedAt: string
}

interface AssessmentQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

const CourseLearningPage = () => {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const courseId = params.courseId as string
  
  // Constants
  const COMPLETION_THRESHOLD = 90 // Percentage of video that must be watched to complete lesson
  
  const [course, setCourse] = useState<any>(null)
  const [topics, setTopics] = useState<CourseTopic[]>([])
  const [currentLesson, setCurrentLesson] = useState<VideoLesson | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'resources' | 'discussions' | 'notes'>('overview')
  const [progress, setProgress] = useState<CourseProgress>({
    totalLessons: 0,
    completedLessons: 0,
    totalDuration: '0h 0m',
    watchedDuration: '0h 0m',
    isCompleted: false,
    completionDate: undefined,
    certificateEarned: false,
    badgeEarned: false,
    finalScore: undefined,
    assessmentCompleted: false,
    assessmentDate: undefined
  })
  const [notes, setNotes] = useState<CourseNote[]>([])
  const [currentNote, setCurrentNote] = useState('')
  const [bookmarkedLessons, setBookmarkedLessons] = useState<string[]>([])
  const [showNotes, setShowNotes] = useState(false)
  const [videoVolume, setVideoVolume] = useState(1)
  const [videoProgress, setVideoProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // New state for enhanced course completion system

  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [showAssessmentReviewModal, setShowAssessmentReviewModal] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [courseCertificate, setCourseCertificate] = useState<CourseCertificate | null>(null)
  const [courseBadges, setCourseBadges] = useState<CourseBadge[]>([])
  const certificateRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Assessment system state
  const [assessmentStarted, setAssessmentStarted] = useState(false)
  const [assessmentCompleted, setAssessmentCompleted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({})
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [assessmentScore, setAssessmentScore] = useState(0)
  
  // Assessment questions for the course (loaded on demand)
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([])
  const [assessmentQuestionsLoaded, setAssessmentQuestionsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])
  
  // Load existing progress when component mounts
  useEffect(() => {
    if (courseId && user?.email) {
      console.log('Loading existing progress for course:', courseId)
      loadExistingProgress()
    }
  }, [courseId, user?.email])
  
  // Handle lesson changes and video loading
  useEffect(() => {
    if (currentLesson && videoRef.current) {
      console.log(`Lesson changed to: ${currentLesson.title}`)
      console.log(`Video URL: ${currentLesson.videoUrl}`)
      
      // Reset video states for new lesson
      setCurrentTime(0)
      setDuration(0)
      setVideoProgress(0)
      setIsPlaying(false)
      
      // Load the new video
      if (videoRef.current.src !== currentLesson.videoUrl) {
        console.log('Updating video source')
        videoRef.current.src = currentLesson.videoUrl
        videoRef.current.load() // Force video to reload
      }
    }
  }, [currentLesson])
  
  // Monitor progress changes for debugging
  useEffect(() => {
    console.log('Progress state changed:', progress)
  }, [progress])
  
  // Load assessment questions only when needed
  const loadAssessmentQuestions = () => {
    if (assessmentQuestionsLoaded) return
    
    const questions: AssessmentQuestion[] = [
      {
        question: "What is the primary goal of this language course?",
        options: [
          "To memorize vocabulary only",
          "To develop practical communication skills",
          "To pass written exams",
          "To learn grammar rules by heart"
        ],
        correctAnswer: 1
      },
      {
        question: "Which learning method is most effective for language acquisition?",
        options: [
          "Reading textbooks only",
          "Passive listening",
          "Active practice and conversation",
          "Memorizing grammar rules"
        ],
        correctAnswer: 2
      },
      {
        question: "How should you approach learning a new language?",
        options: [
          "Focus only on perfect pronunciation",
          "Learn everything at once",
          "Start with basics and build gradually",
          "Skip beginner lessons"
        ],
        correctAnswer: 2
      },
      {
        question: "What is the best way to retain new vocabulary?",
        options: [
          "Write it down once",
          "Use it in context and practice regularly",
          "Read it silently",
          "Memorize without understanding"
        ],
        correctAnswer: 1
      },
      {
        question: "Why is cultural context important in language learning?",
        options: [
          "It's not important at all",
          "It helps with grammar rules",
          "It enhances understanding and communication",
          "It's only useful for advanced learners"
        ],
        correctAnswer: 2
      },
      {
        question: "What should you do when you make mistakes while speaking?",
        options: [
          "Stop speaking immediately",
          "Ignore the mistakes and continue",
          "Learn from them and keep practicing",
          "Give up on the language"
        ],
        correctAnswer: 2
      },
      {
        question: "How often should you practice to maintain language skills?",
        options: [
          "Once a month",
          "Only when you have time",
          "Regularly, ideally daily",
          "Only before exams"
        ],
        correctAnswer: 2
      },
      {
        question: "What is the role of listening in language learning?",
        options: [
          "It's not necessary",
          "It helps develop speaking skills",
          "It's only useful for reading",
          "It wastes time"
        ],
        correctAnswer: 1
      },
      {
        question: "How can you make language learning more enjoyable?",
        options: [
          "Focus only on difficult topics",
          "Use materials that interest you",
          "Study in isolation",
          "Avoid any fun activities"
        ],
        correctAnswer: 1
      },
      {
        question: "What is the key to successful language learning?",
        options: [
          "Natural talent",
          "Consistency and persistence",
          "Expensive materials",
          "Perfect memory"
        ],
        correctAnswer: 1
      }
    ]
    
    // Shuffle questions for variety
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5)
    setAssessmentQuestions(shuffledQuestions)
    setAssessmentQuestionsLoaded(true)
  }

  useEffect(() => {
    console.log('Course details page - Authentication state:', isAuthenticated)
    console.log('Course details page - Course ID:', courseId)
    
    // Add a small delay to ensure authentication state is properly loaded
    const timer = setTimeout(() => {
      console.log('Course details page - Delayed auth check:', isAuthenticated)
      
      if (!isAuthenticated) {
        console.log('Course details page - User not authenticated, redirecting to login')
        toast.error('Please sign in to access course content')
        router.push(`/login?redirect=/courses/${courseId}`)
        return
      }

      console.log('Course details page - User authenticated, loading course data')
      loadCourseData()
      loadUserData()
    }, 100)

    return () => clearTimeout(timer)
  }, [courseId, isAuthenticated, router])

  // Remove the problematic useEffect that was causing infinite loops

  const loadUserData = () => {
    // Load user's notes and bookmarks
    const savedNotes = localStorage.getItem(`course_notes_${courseId}`)
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
    
    const savedBookmarks = localStorage.getItem(`course_bookmarks_${courseId}`)
    if (savedBookmarks) {
      setBookmarkedLessons(JSON.parse(savedBookmarks))
    }
  }

  const loadCourseData = async () => {
    try {
      setIsLoading(true)
      console.log('Loading course data for courseId:', courseId)
      const savedEnrollments = localStorage.getItem('enrolled_courses')
      console.log('Saved enrollments:', savedEnrollments)
      
      if (savedEnrollments) {
        const enrollments = JSON.parse(savedEnrollments)
        console.log('Parsed enrollments:', enrollments)
        const courseData = enrollments.find((enrollment: any) => enrollment.id === courseId)
        console.log('Found course data:', courseData)
        
        if (courseData) {
          setCourse(courseData)
          generateMockTopics(courseData)
          
          // Load assessment results if they exist
          if (user?.email) {
            const userProgressKey = `user_course_progress_${user.email}`
            const userProgress = localStorage.getItem(userProgressKey)
            if (userProgress) {
              const progressData = JSON.parse(userProgress)
              if (progressData[courseId]?.assessmentCompleted) {
                setProgress(prev => ({
                  ...prev,
                  assessmentCompleted: progressData[courseId].assessmentCompleted,
                  assessmentDate: progressData[courseId].assessmentDate,
                  finalScore: progressData[courseId].assessmentScore
                }))
              }
            }
          }
        } else {
          console.error('Course not found in enrollments. Available IDs:', enrollments.map((e: any) => e.id))
          toast.error('Course not found or you are not enrolled')
          router.push('/courses')
        }
      } else {
        console.log('No enrollments found in localStorage')
        toast.error('No enrollments found')
        router.push('/courses')
      }
    } catch (error) {
      console.error('Error loading course:', error)
      toast.error('Failed to load course')
    } finally {
      setIsLoading(false)
    }
  }

  const loadExistingProgress = () => {
    try {
      console.log('Loading existing progress for course:', courseId)
      
      // Load lesson progress
      const lessonProgress = loadLessonProgress(courseId)
      console.log('Loaded lesson progress:', lessonProgress)
      
      // Load user course progress
      const userProgressKey = `user_course_progress_${user?.email || 'anonymous'}`
      const userProgress = localStorage.getItem(userProgressKey)
      if (userProgress) {
        const userProgressData = JSON.parse(userProgress)
        console.log('Loaded user progress:', userProgressData)
      }
      
      // Load course progress
      const courseProgressKey = `course_progress_${courseId}`
      const courseProgress = localStorage.getItem(courseProgressKey)
      if (courseProgress) {
        const courseProgressData = JSON.parse(courseProgress)
        console.log('Loaded course progress:', courseProgressData)
      }
      
      return { lessonProgress, userProgress, courseProgress }
    } catch (error) {
      console.error('Error loading existing progress:', error)
      return {}
    }
  }

  const loadLessonProgress = (courseId: string) => {
    try {
      const savedProgress = localStorage.getItem(`course_progress_${courseId}`)
      if (savedProgress) {
        return JSON.parse(savedProgress)
      }
    } catch (error) {
      console.error('Error loading lesson progress:', error)
    }
    return {}
  }

  const saveLessonProgress = (courseId: string, lessonId: string, progress: { isWatched: boolean, completedAt: string }) => {
    try {
      const currentProgress = loadLessonProgress(courseId)
      currentProgress[lessonId] = progress
      localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(currentProgress))
      
      // Also update the main user progress for dashboard
      updateUserCourseProgress(courseId, lessonId, progress)
    } catch (error) {
      console.error('Error saving lesson progress:', error)
    }
  }

  const updateCourseProgressForDashboard = (courseId: string, totalLessons: number, completedLessons: number, isCompleted: boolean) => {
    try {
      console.log(`Updating course progress for dashboard: ${courseId}`, { totalLessons, completedLessons, isCompleted })
      
      // Update user course progress with course metadata
      const userProgressKey = `user_course_progress_${user?.email || 'anonymous'}`
      const currentUserProgress = localStorage.getItem(userProgressKey)
      let userProgress = currentUserProgress ? JSON.parse(currentUserProgress) : {}
      
      // Initialize course progress if it doesn't exist
      if (!userProgress[courseId]) {
        userProgress[courseId] = {
          lessons: {},
          totalLessons: 0,
          completedLessons: 0,
          isCompleted: false,
          completionDate: undefined,
          lastUpdated: new Date().toISOString()
        }
      }
      
      // Update course metadata
      userProgress[courseId].totalLessons = totalLessons
      userProgress[courseId].completedLessons = completedLessons
      userProgress[courseId].isCompleted = isCompleted
      userProgress[courseId].completionDate = isCompleted ? new Date().toISOString() : undefined
      userProgress[courseId].lastUpdated = new Date().toISOString()
      
      // Save updated user progress
      localStorage.setItem(userProgressKey, JSON.stringify(userProgress))
      
      console.log('Updated course progress for dashboard:', userProgress[courseId])
    } catch (error) {
      console.error('Error updating course progress for dashboard:', error)
    }
  }

  const updateUserCourseProgress = (courseId: string, lessonId: string, lessonProgress: any) => {
    try {
      // Get current user progress
      const userProgressKey = `user_course_progress_${user?.email || 'anonymous'}`
      const currentUserProgress = localStorage.getItem(userProgressKey)
      let userProgress = currentUserProgress ? JSON.parse(currentUserProgress) : {}
      
      // Initialize course progress if it doesn't exist
      if (!userProgress[courseId]) {
        userProgress[courseId] = {
          lessons: {},
          totalLessons: 0,
          completedLessons: 0,
          lastUpdated: new Date().toISOString()
        }
      }
      
      // Update lesson progress
      userProgress[courseId].lessons[lessonId] = lessonProgress
      
      // Recalculate course totals
      const courseLessons = Object.keys(userProgress[courseId].lessons)
      // Don't update totalLessons here - it should be set from the course structure
      // userProgress[courseId].totalLessons = courseLessons.length
      userProgress[courseId].completedLessons = courseLessons.filter(lessonId => 
        userProgress[courseId].lessons[lessonId]?.isWatched
      ).length
      userProgress[courseId].lastUpdated = new Date().toISOString()
      
      // Save updated user progress
      localStorage.setItem(userProgressKey, JSON.stringify(userProgress))
      
      console.log('Updated user course progress:', userProgress[courseId])
    } catch (error) {
      console.error('Error updating user course progress:', error)
    }
  }

  const generateMockTopics = (courseData: any) => {
    console.log('Generating mock topics for course:', courseId)
    
    // Load existing progress instead of clearing it
    const existingProgress = loadExistingProgress()
    console.log('Existing progress loaded:', existingProgress)
    
    // Use existing progress or default to unwatched
    const savedProgress = existingProgress.lessonProgress || {}
    
    const mockTopics: CourseTopic[] = [
      {
        id: 'topic_1',
        title: 'Getting Started',
        description: 'Introduction to the course and basic concepts',
        order: 1,
        lessons: [
          {
            id: 'lesson_1_1',
            title: 'Welcome to the Course',
            summary: 'Course overview and what you\'ll learn',
            duration: '5:30',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            thumbnail: '/api/placeholder/300/200',
            isWatched: savedProgress['lesson_1_1']?.isWatched || false,
            order: 1,
            resources: [
              { id: 'res_1', name: 'Course Syllabus', type: 'pdf', url: '#', size: '2.1 MB' },
              { id: 'res_2', name: 'Lesson Transcript', type: 'document', url: '#', size: '15 KB' }
            ],
            comments: [
              {
                id: 'com_1',
                user: 'Maria Santos',
                avatar: '👩',
                content: 'Great introduction! I\'m excited to start learning.',
                timestamp: '2 hours ago',
                likes: 3,
                replies: []
              }
            ]
          },
          {
            id: 'lesson_1_2',
            title: 'Setting Up Your Learning Environment',
            summary: 'Tools and resources you\'ll need',
            duration: '8:15',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            thumbnail: '/api/placeholder/300/200',
            isWatched: savedProgress['lesson_1_2']?.isWatched || false,
            order: 2,
            resources: [
              { id: 'res_3', name: 'Setup Checklist', type: 'pdf', url: '#', size: '1.8 MB' }
            ],
            comments: []
          }
        ]
      },
      {
        id: 'topic_2',
        title: 'Basic Fundamentals',
        description: 'Core concepts and essential knowledge',
        order: 2,
        lessons: [
          {
            id: 'lesson_2_1',
            title: 'Understanding the Basics',
            summary: 'Fundamental concepts and principles',
            duration: '12:45',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            thumbnail: '/api/placeholder/300/200',
            isWatched: savedProgress['lesson_2_1']?.isWatched || false,
            order: 3,
            resources: [],
            comments: []
          },
          {
            id: 'lesson_2_2',
            title: 'Practice Exercises',
            summary: 'Hands-on practice with basic concepts',
            duration: '15:20',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            thumbnail: '/api/placeholder/300/200',
            isWatched: savedProgress['lesson_2_2']?.isWatched || false,
            order: 4,
            resources: [
              { id: 'res_4', name: 'Exercise Workbook', type: 'pdf', url: '#', size: '3.2 MB' }
            ],
            comments: []
          }
        ]
      }
    ]
    
    setTopics(mockTopics)
    if (mockTopics[0]?.lessons[0]) {
      setCurrentLesson(mockTopics[0].lessons[0])
    }
    

    
    // Calculate progress from the actual topics with saved progress
    const totalLessons = mockTopics.reduce((sum, topic) => sum + topic.lessons.length, 0)
    const completedLessons = mockTopics.reduce((sum, topic) => 
      sum + topic.lessons.filter(lesson => lesson.isWatched).length, 0
    )
    
    console.log('Progress calculation:', { totalLessons, completedLessons, savedProgress })
    
    setProgress({
      totalLessons,
      completedLessons,
      totalDuration: '2h 30m',
      watchedDuration: `${Math.floor(completedLessons * 15)}m`,
      isCompleted: completedLessons === totalLessons,
      completionDate: completedLessons === totalLessons ? new Date().toISOString() : undefined,
      certificateEarned: progress.certificateEarned,
      badgeEarned: progress.badgeEarned,
      finalScore: progress.finalScore
    })
    
    // Update course progress for dashboard with the loaded progress
    if (user?.email) {
      updateCourseProgressForDashboard(courseId, totalLessons, completedLessons, completedLessons === totalLessons)
    }
  }

  const selectLesson = (lesson: VideoLesson) => {
    console.log(`=== selectLesson called for lesson: ${lesson.title} ===`)
    
    // Stop current video if playing
    if (videoRef.current && isPlaying) {
      console.log('Stopping current video playback')
      videoRef.current.pause()
      setIsPlaying(false)
    }
    
    // Update current lesson
    setCurrentLesson(lesson)
    setCurrentNote('')
    setShowNotes(false)
    
    // Auto-play the new lesson after a short delay to allow video to load
    // The useEffect will handle video state reset and source loading
    setTimeout(() => {
      if (videoRef.current && lesson) {
        console.log(`Auto-playing new lesson: ${lesson.title}`)
        videoRef.current.play()
        setIsPlaying(true)
      }
    }, 1500) // 1.5 second delay to allow video to load and states to reset
    
    // Record course study activity (once per lesson selection)
    if (user?.email) {
      recordLearningActivity(user.email, 'course_study', `${course.name} - ${lesson.title}`)
    }
    
    console.log(`Lesson switched to: ${lesson.title}`)
  }







  const togglePlayPause = () => {
    if (!videoRef.current) return
    
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
    // Don't mark lesson as watched just for playing/pausing
    // Lesson will be marked as watched when video actually completes
  }

  const markLessonAsWatched = (lessonId: string, bypassProgressCheck: boolean = false) => {
    console.log(`=== markLessonAsWatched called for lesson: ${lessonId} ===`)
    console.log('Current video progress:', videoProgress)
    console.log('Completion threshold:', COMPLETION_THRESHOLD)
    console.log('Current lesson ID:', currentLesson?.id)
    console.log('Requested lesson ID:', lessonId)
    console.log('Bypass progress check:', bypassProgressCheck)
    
    // Find the lesson to mark as completed
    const lessonToComplete = topics
      .flatMap(topic => topic.lessons)
      .find(lesson => lesson.id === lessonId)
    
    if (!lessonToComplete) {
      console.log(`Lesson ${lessonId} not found`)
      toast.error('Lesson not found')
      return
    }
    
    // Prevent multiple calls for the same lesson
    if (lessonToComplete.isWatched) {
      console.log(`Lesson ${lessonId} is already marked as watched, skipping`)
      toast('Lesson is already completed', { icon: 'ℹ️' })
      return
    }
    
    // Check progress threshold unless bypassing (for sidebar completion)
    if (!bypassProgressCheck && videoProgress < COMPLETION_THRESHOLD) {
      console.log(`Lesson completion blocked: progress ${videoProgress}% < threshold ${COMPLETION_THRESHOLD}%`)
      toast.error(`Please watch at least ${COMPLETION_THRESHOLD}% of the lesson to mark it as completed`)
      return
    }
    
    if (bypassProgressCheck) {
      console.log(`Lesson completion allowed: bypassing progress check (called from sidebar)`)
    } else {
      console.log(`Lesson completion allowed: progress ${videoProgress}% >= threshold ${COMPLETION_THRESHOLD}%`)
    }
    
    // Mark lesson as watched and get updated topics
    console.log('Before updating - Current lesson states:')
    topics.forEach(topic => {
      topic.lessons.forEach(lesson => {
        console.log(`  ${lesson.title}: isWatched = ${lesson.isWatched}`)
      })
    })
    
    const updatedTopics = topics.map(topic => ({
      ...topic,
      lessons: topic.lessons.map(lesson => {
        if (lesson.id === lessonId) {
          console.log(`Marking lesson "${lesson.title}" as watched`)
          return { ...lesson, isWatched: true }
        } else {
          console.log(`Keeping lesson "${lesson.title}" as isWatched = ${lesson.isWatched}`)
          return lesson
        }
      })
    }))
    
    console.log('After updating - Updated lesson states:')
    updatedTopics.forEach(topic => {
      topic.lessons.forEach(lesson => {
        console.log(`  ${lesson.title}: isWatched = ${lesson.isWatched}`)
      })
    })
    
    // Update topics state
    setTopics(updatedTopics)
    
    // Save lesson progress to localStorage
    saveLessonProgress(courseId, lessonId, {
      isWatched: true,
      completedAt: new Date().toISOString()
    })
    
    // Recalculate progress with updated topics
    const totalLessons = updatedTopics.reduce((sum, topic) => sum + topic.lessons.length, 0)
    const completedLessons = updatedTopics.reduce((sum, topic) => 
      sum + topic.lessons.filter(lesson => lesson.isWatched).length, 0
    )
    
    console.log('Progress recalculation after lesson completion:', {
      totalLessons,
      completedLessons,
      isCompleted: completedLessons === totalLessons,
      updatedTopics: updatedTopics.map(topic => ({
        title: topic.title,
        lessons: topic.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          isWatched: lesson.isWatched
        }))
      }))
    })
    
    // Update local progress state
    const newProgress = {
      totalLessons,
      completedLessons,
      totalDuration: '2h 30m',
      watchedDuration: `${Math.floor(completedLessons * 15)}m`,
      isCompleted: completedLessons === totalLessons,
      completionDate: completedLessons === totalLessons ? new Date().toISOString() : undefined,
      certificateEarned: progress.certificateEarned,
      badgeEarned: progress.badgeEarned,
      finalScore: progress.finalScore
    }
    
    console.log('Setting new progress state:', newProgress)
    setProgress(newProgress)
    
    // Update course progress for dashboard
    updateCourseProgressForDashboard(courseId, totalLessons, completedLessons, completedLessons === totalLessons)
    
    // Record lesson completion activity
    if (user?.email && currentLesson) {
      recordLearningActivity(user.email, 'lesson_completed', `${currentLesson.title} - ${course.name}`)
    }
    
    // No need to update lesson locks - all lessons are always unlocked
    
    // Check if course is completed
    console.log('Course completion check:', {
      completedLessons,
      totalLessons,
      isCompleted: completedLessons === totalLessons,
      courseId,
      lessonId
    })
    
    if (completedLessons === totalLessons) {
      console.log('🎉 COURSE COMPLETED! Calling handleCourseCompletion')
      handleCourseCompletion()
    } else {
      // Find and advance to next lesson using the updated topics
      const nextLesson = findNextLessonFromTopics(lessonId, updatedTopics)
      if (nextLesson) {
        console.log(`Advancing to next lesson: ${nextLesson.title}`)
        setCurrentLesson(nextLesson)
        
        // Reset video states for the new lesson
        setCurrentTime(0)
        setDuration(0)
        setVideoProgress(0)
        setIsPlaying(false)
        
        // Auto-play the next lesson after a short delay
        setTimeout(() => {
          if (videoRef.current && nextLesson) {
            console.log(`Auto-playing next lesson: ${nextLesson.title}`)
            videoRef.current.play()
            setIsPlaying(true)
          }
        }, 1000) // 1 second delay to allow video to load
        
        toast.success(`Advanced to next lesson: ${nextLesson.title}`)
        
        // Debug: Verify the next lesson status
        console.log('Next lesson status:', {
          nextLesson: nextLesson.title,
          isWatched: nextLesson.isWatched,
          order: nextLesson.order
        })
      } else {
        console.log('No next lesson found - course may be completed')
      }
    }
    
    toast.success('Progress saved!')
  }

  const findNextLesson = (currentLessonId: string): VideoLesson | null => {
    // Flatten all lessons from all topics and sort by order
    const allLessons = topics
      .flatMap(topic => topic.lessons)
      .sort((a, b) => a.order - b.order)
    
    const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLessonId)
    
    if (currentIndex === -1 || currentIndex === allLessons.length - 1) {
      return null // No next lesson available
    }
    
    // Simply return the next lesson in sequence, regardless of topic
    const nextLesson = allLessons[currentIndex + 1]
    
    // Debug logging
    console.log('Lesson progression:', {
      currentLesson: allLessons[currentIndex]?.title,
      currentIndex,
      nextLesson: nextLesson?.title,
      nextIndex: currentIndex + 1,
      totalLessons: allLessons.length,
      allLessonTitles: allLessons.map(l => ({ id: l.id, title: l.title, order: l.order, topic: topics.find(t => t.lessons.includes(l))?.title }))
    })
    
    // All lessons are accessible - no locking needed
    return nextLesson
  }

  const findNextLessonFromTopics = (currentLessonId: string, currentTopics: CourseTopic[]): VideoLesson | null => {
    // Flatten all lessons from all topics and sort by order
    const allLessons = currentTopics
      .flatMap(topic => topic.lessons)
      .sort((a, b) => a.order - b.order)
    
    const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLessonId)
    
    if (currentIndex === -1 || currentIndex === allLessons.length - 1) {
      return null // No next lesson available
    }
    
    // Simply return the next lesson in sequence, regardless of topic
    const nextLesson = allLessons[currentIndex + 1]
    
    // Debug logging
    console.log('Lesson progression:', {
      currentLesson: allLessons[currentIndex]?.title,
      currentIndex,
      nextLesson: nextLesson?.title,
      nextIndex: currentIndex + 1,
      totalLessons: allLessons.length,
      allLessonTitles: allLessons.map(l => ({ id: l.id, title: l.title, order: l.order, topic: currentTopics.find(t => t.lessons.includes(l))?.title }))
    })
    
    // All lessons are accessible - no locking needed
    return nextLesson
  }



  const submitAssessment = () => {
    // Calculate score
    let correct = 0
    const detailedResults = Object.keys(selectedAnswers).map(questionIndex => {
      const questionIdx = parseInt(questionIndex)
      const isCorrect = selectedAnswers[questionIdx] === assessmentQuestions[questionIdx].correctAnswer
      if (isCorrect) correct++
      
      return {
        questionIndex: questionIdx,
        question: assessmentQuestions[questionIdx].question,
        userAnswer: selectedAnswers[questionIdx],
        correctAnswer: assessmentQuestions[questionIdx].correctAnswer,
        isCorrect,
        options: assessmentQuestions[questionIdx].options
      }
    })
    
    const score = Math.round((correct / assessmentQuestions.length) * 100)
    
    // Update state
    setCorrectAnswers(correct)
    setAssessmentScore(score)
    setAssessmentCompleted(true)
    
    // Store detailed assessment results
    const assessmentResults = {
      score,
      correctAnswers: correct,
      totalQuestions: assessmentQuestions.length,
      completedAt: new Date().toISOString(),
      detailedResults,
      selectedAnswers: { ...selectedAnswers }
    }
    
    localStorage.setItem(`assessment_results_${courseId}_${user?.email}`, JSON.stringify(assessmentResults))
    
    // Update course progress with assessment score
    if (user?.email) {
      const userProgressKey = `user_course_progress_${user.email}`
      const userProgress = JSON.parse(localStorage.getItem(userProgressKey) || '{}')
      
      if (!userProgress[courseId]) {
        userProgress[courseId] = { lessons: {}, totalLessons: 0, completedLessons: 0, lastUpdated: new Date().toISOString() }
      }
      
      userProgress[courseId].assessmentCompleted = true
      userProgress[courseId].assessmentScore = score
      userProgress[courseId].assessmentDate = new Date().toISOString()
      userProgress[courseId].lastUpdated = new Date().toISOString()
      
      localStorage.setItem(userProgressKey, JSON.stringify(userProgress))
      
      // Record assessment completion activity
      recordLearningActivity(user.email, 'assessment_completed', `${course.name} - Score: ${score}%`)
    }
    
    // Update progress with assessment score
    setProgress(prev => ({
      ...prev,
      finalScore: score,
      assessmentCompleted: true,
      assessmentDate: new Date().toISOString()
    }))
    
    toast.success(`Assessment completed! Your score: ${score}%`)
  }

  const resetAssessment = () => {
    setAssessmentStarted(false)
    setAssessmentCompleted(false)
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setCorrectAnswers(0)
    setAssessmentScore(0)
  }

  const closeAssessmentModal = () => {
    resetAssessment()
    setShowAssessmentModal(false)
  }

  const loadAssessmentResults = () => {
    if (!user?.email) return null
    
    try {
      const savedResults = localStorage.getItem(`assessment_results_${courseId}_${user.email}`)
      if (savedResults) {
        return JSON.parse(savedResults)
      }
    } catch (error) {
      console.error('Error loading assessment results:', error)
    }
    return null
  }

  const retakeAssessment = () => {
    // Clear previous results
    if (user?.email) {
      localStorage.removeItem(`assessment_results_${courseId}_${user.email}`)
    }
    
    // Reset progress
    setProgress(prev => ({
      ...prev,
      assessmentCompleted: false,
      assessmentDate: undefined,
      finalScore: undefined
    }))
    
    // Reset assessment state
    resetAssessment()
    
    // Show assessment modal
    setShowAssessmentModal(true)
  }

  const handleCourseCompletion = () => {
    console.log('🎉 handleCourseCompletion called!')
    console.log('Setting showCompletionModal to true')
    setShowCompletionModal(true)
    
    // Record course completion activity
    if (user?.email) {
      recordLearningActivity(user.email, 'course_completed', course.name)
    }
    
    console.log('Course completion modal should now be visible')
  }

  const getProgressPercentage = () => {
    return progress.totalLessons === 0 ? 0 : (progress.completedLessons / progress.totalLessons) * 100
  }

  const toggleBookmark = (lessonId: string) => {
    setBookmarkedLessons(prev => {
      const newBookmarks = prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
      
      localStorage.setItem(`course_bookmarks_${courseId}`, JSON.stringify(newBookmarks))
      toast.success(prev.includes(lessonId) ? 'Removed from bookmarks' : 'Added to bookmarks')
      return newBookmarks
    })
  }

  const saveNote = () => {
    if (!currentNote.trim() || !currentLesson) return
    
    const newNote: CourseNote = {
      id: Date.now().toString(),
      lessonId: currentLesson.id,
      content: currentNote,
      timestamp: new Date().toISOString(),
      tags: []
    }
    
    const updatedNotes = [...notes, newNote]
    setNotes(updatedNotes)
    localStorage.setItem(`course_notes_${courseId}`, JSON.stringify(updatedNotes))
    setCurrentNote('')
    toast.success('Note saved successfully!')
  }

  const handleVideoProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    
    // Don't allow seeking if duration is not valid
    if (!duration || duration <= 0) {
      return
    }
    
    // Update state immediately for responsive UI
    setCurrentTime(newTime)
    setVideoProgress((newTime / duration) * 100)
    
    // Actually seek the video to the new time
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVideoVolume(newVolume)
    
    // Apply volume to the video element
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const generatePDF = async () => {
    if (!certificateRef.current) return
    
    try {
      toast.loading('Generating PDF...', { id: 'pdf-generation' })
      
      // Dynamically import heavy libraries only when needed
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ])
      
      // Capture the certificate content
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#fefce8' // Light yellow background
      })
      
      const imgData = canvas.toDataURL('image/png')
      
      // Create PDF
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Calculate dimensions to fit the certificate properly
      const imgWidth = pdfWidth - 20 // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // Center the image on the page
      const x = (pdfWidth - imgWidth) / 2
      const y = (pdfHeight - imgHeight) / 2
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)
      
      // Add metadata
      pdf.setProperties({
        title: `Certificate - ${course.name}`,
        subject: 'Course Completion Certificate',
        author: 'Global Language Training Center',
        creator: 'Global Language Training Center'
      })
      
      // Generate filename
      const filename = `certificate_${course.name.replace(/\s+/g, '_')}_${user?.name || 'student'}_${user?.email || 'student'}_${new Date().toISOString().split('T')[0]}.pdf`
      
      // Download the PDF
      pdf.save(filename)
      
      toast.success('Certificate downloaded successfully!', { id: 'pdf-generation' })
      
      // Record certificate download activity
      if (user?.email) {
        recordLearningActivity(user.email, 'certificate_downloaded', course.name)
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF. Please try again.', { id: 'pdf-generation' })
    }
  }

  if (!course || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">Please sign in to access this course content.</p>
          <Button onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Course Content</h2>
            <p className="text-gray-600">Please wait while we prepare your learning experience...</p>
          </div>
        </div>
      )}
      
      {!isLoading && (
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Video Player Section */}
            <div className="bg-black relative">
            <div className="aspect-video relative">
              {/* Video Loading Indicator */}
              {duration <= 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-lg">Loading video...</p>
                  </div>
                </div>
              )}
              
              {/* Video Player */}
              <video
                key={currentLesson?.id} // Force re-render when lesson changes
                ref={videoRef}
                className="w-full h-full"
                poster={currentLesson?.thumbnail}
                controls={false}
                preload="metadata" // Preload video metadata for better performance
                onLoadStart={() => {
                  console.log('Video load started')
                  setDuration(0)
                  setCurrentTime(0)
                  setVideoProgress(0)
                }}
                onLoadedMetadata={(e) => {
                  const video = e.currentTarget
                  console.log('Video metadata loaded:', { duration: video.duration, videoUrl: currentLesson?.videoUrl })
                  if (video.duration && isFinite(video.duration)) {
                    setDuration(video.duration)
                  }
                }}
                onCanPlay={(e) => {
                  const video = e.currentTarget
                  console.log('Video can play:', { duration: video.duration, currentTime: video.currentTime })
                  if (video.duration && isFinite(video.duration)) {
                    setDuration(video.duration)
                  }
                  
                  // Set initial volume
                  if (videoRef.current) {
                    videoRef.current.volume = videoVolume
                  }
                }}
                onTimeUpdate={(e) => {
                  const video = e.currentTarget
                  const currentTime = video.currentTime
                  const videoDuration = video.duration
                  
                  setCurrentTime(currentTime)
                  
                  // Update duration if it's valid and different
                  if (videoDuration && isFinite(videoDuration) && videoDuration !== duration) {
                    setDuration(videoDuration)
                  }
                  
                  // Calculate and update video progress
                  if (videoDuration && isFinite(videoDuration) && videoDuration > 0) {
                    const progressPercentage = (currentTime / videoDuration) * 100
                    setVideoProgress(progressPercentage)
                  }
                }}
                onEnded={() => {
                  console.log('Video ended')
                  console.log('Video progress at end:', videoProgress)
                  console.log('Completion threshold:', COMPLETION_THRESHOLD)
                  setIsPlaying(false)
                  
                  // Only mark as completed if user watched at least the completion threshold
                  if (currentLesson && videoProgress >= COMPLETION_THRESHOLD) {
                    console.log('Auto-completing lesson due to sufficient progress')
                    markLessonAsWatched(currentLesson.id, false)
                    toast.success('Lesson completed! Great job!')
                  } else if (currentLesson) {
                    console.log('Lesson not auto-completed due to insufficient progress')
                    toast(`Please watch at least ${COMPLETION_THRESHOLD}% of the lesson to mark it as completed`, { icon: 'ℹ️' })
                  }
                }}
                onError={(e) => {
                  console.error('Video error:', e)
                }}
              >
                <source src={currentLesson?.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={togglePlayPause}
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  
                  {/* Progress Indicator */}
                  {currentLesson && (
                    <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                      Progress: {Math.round(videoProgress)}%
                      {videoProgress >= COMPLETION_THRESHOLD && !currentLesson.isWatched && (
                        <span className="ml-2 text-green-400">✓ Ready to complete (90%)</span>
                      )}
                    </div>
                  )}
                  
                  {/* Manual Mark as Completed Button for Testing */}
                  {currentLesson && !currentLesson.isWatched && videoProgress >= COMPLETION_THRESHOLD && (
                    <Button
                      onClick={() => markLessonAsWatched(currentLesson.id, false)}
                      className="bg-green-500 hover:bg-green-600 text-white border-0"
                      title={`Mark lesson as completed (${COMPLETION_THRESHOLD}% watched)`}
                    >
                      Mark Complete
                    </Button>
                  )}
                  
                  

                  
                  {/* Progress Bar */}
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max={duration > 0 ? duration : 100}
                      value={currentTime}
                      onChange={handleVideoProgress}
                      disabled={duration <= 0}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider ${
                        duration > 0 
                          ? 'bg-white/30 hover:bg-white/40' 
                          : 'bg-white/20 cursor-not-allowed opacity-50'
                      }`}
                      title={duration > 0 ? 'Drag to seek video' : 'Loading video...'}
                    />
                    {/* Progress indicator overlay */}
                    {duration > 0 && (
                      <div 
                        className="absolute top-0 left-0 h-2 bg-white/60 rounded-l-lg pointer-events-none transition-all duration-150"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    )}
                  </div>
                  
                  {/* Time Display */}
                  <div className="text-white text-sm">
                    {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} / 
                    {duration > 0 
                      ? `${Math.floor(duration / 60)}:${(duration % 60).toFixed(0).padStart(2, '0')}`
                      : '--:--'
                    }
                  </div>
                  
                  {/* Volume Control */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (videoVolume > 0) {
                          // Store current volume and mute
                          setVideoVolume(0)
                          if (videoRef.current) {
                            videoRef.current.volume = 0
                          }
                        } else {
                          // Restore to previous volume (default to 0.7 if was 0)
                          const newVolume = 0.7
                          setVideoVolume(newVolume)
                          if (videoRef.current) {
                            videoRef.current.volume = newVolume
                          }
                        }
                      }}
                      className="hover:bg-white/20 rounded p-1 transition-colors"
                      title={videoVolume > 0 ? "Click to mute" : "Click to unmute"}
                    >
                      {videoVolume > 0 ? (
                        <Volume2 className="w-4 h-4 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white opacity-50" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={videoVolume}
                      onChange={handleVolumeChange}
                      className="w-24 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.3) ${videoVolume * 100}%, rgba(255,255,255,0.1) ${videoVolume * 100}%)`
                      }}
                    />
                    <span className="text-white text-xs min-w-[2rem] text-center">
                      {videoVolume > 0 ? `${Math.round(videoVolume * 100)}%` : 'Muted'}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      if (videoRef.current) {
                        if (isFullscreen) {
                          document.exitFullscreen()
                        } else {
                          videoRef.current.requestFullscreen()
                        }
                      }
                    }}
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    {isFullscreen ? <X className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Course Info and Tabs */}
          <div className="bg-white border-b">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.name}</h1>
                  <p className="text-gray-600">{course.language} • {course.level}</p>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Progress</p>
                    <p className="text-lg font-semibold text-primary-600">
                      {Math.round(getProgressPercentage())}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Lessons</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {progress.completedLessons}/{progress.totalLessons}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {progress.watchedDuration}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-t border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: BookOpen },
                  { id: 'content', label: 'Content', icon: Play },
                  { id: 'resources', label: 'Resources', icon: Download },
                  // { id: 'discussions', label: 'Discussions', icon: MessageCircle }, // Hidden for future implementation
                  { id: 'notes', label: 'Notes & Bookmarks', icon: Edit3 }
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Course Description */}
                  <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Course</h2>
                    <p className="text-gray-700 mb-6">{course.description}</p>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Learn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      {course.features?.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mb-6">
                      <li>No prior experience required</li>
                      <li>Basic computer skills</li>
                      <li>Dedication to learn</li>
                    </ul>
                  </div>
                  
                  {/* Course Stats & Instructor */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Course Statistics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Lessons:</span>
                          <span className="font-medium">{progress.totalLessons}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{progress.totalDuration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Level:</span>
                          <span className="font-medium">{course.level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Language:</span>
                          <span className="font-medium">{course.language}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Instructor</h3>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{course.instructor}</p>
                          <p className="text-sm text-gray-600">Language Expert</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Certificate</h3>
                      {progress.isCompleted ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Award className="w-6 h-6 text-green-600" />
                            <span className="text-green-700 font-medium">Course Completed! 🎉</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Congratulations! You've successfully completed this course.
                          </p>
                          {progress.completionDate && (
                            <p className="text-xs text-gray-500">
                              Completed on: {new Date(progress.completionDate).toLocaleDateString()}
                            </p>
                          )}
                          <div className="space-y-2">
                            <Button 
                              onClick={() => setShowCertificateModal(true)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              View Certificate
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              size="sm"
                              onClick={() => setShowAssessmentModal(true)}
                            >
                              <Target className="w-4 h-4 mr-2" />
                              Take Final Assessment
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Award className="w-5 h-5 text-yellow-600" />
                            <span className="text-gray-700">Completion Certificate</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Earn a certificate upon completing all lessons
                          </p>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-blue-700">Progress:</span>
                              <span className="text-blue-700 font-medium">
                                {progress.completedLessons}/{progress.totalLessons} lessons
                              </span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getProgressPercentage()}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Assessment Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Final Assessment</h3>
                      {progress.assessmentCompleted ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Target className="w-6 h-6 text-green-600" />
                              <span className="text-green-700 font-medium">Assessment Completed</span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary-600">
                                {progress.finalScore || 0}%
                              </div>
                              <div className="text-xs text-gray-500">
                                {(progress.finalScore || 0) >= 70 ? 'Passed' : 'Not Passed'}
                              </div>
                            </div>
                          </div>
                          {progress.assessmentDate && (
                            <p className="text-xs text-gray-500">
                              Taken on: {new Date(progress.assessmentDate).toLocaleDateString()}
                            </p>
                          )}
                          
                          {/* Passing Score Info */}
                          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-center">
                            <span className="text-xs text-blue-700">
                              Passing Score: <span className="font-semibold">70%</span>
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <Button 
                              onClick={() => {
                                loadAssessmentQuestions()
                                retakeAssessment()
                              }}
                              variant="outline"
                              className="w-full"
                              size="sm"
                            >
                              <Target className="w-4 h-4 mr-2" />
                              Retake Assessment
                            </Button>
                            <Button 
                              onClick={() => setShowAssessmentReviewModal(true)}
                              variant="outline"
                              className="w-full"
                              size="sm"
                            >
                              <BookOpen className="w-4 h-4 mr-2" />
                              Review Answers
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Target className="w-6 h-6 text-gray-400" />
                            <span className="text-gray-600">Final Assessment</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Test your knowledge and earn your certificate
                          </p>
                          
                          {/* Passing Score Info */}
                          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-center">
                            <span className="text-xs text-blue-700">
                              Passing Score: <span className="font-semibold">70%</span>
                            </span>
                          </div>
                          
                          {progress.isCompleted ? (
                            <Button 
                              onClick={() => {
                                loadAssessmentQuestions()
                                setShowAssessmentModal(true)
                              }}
                              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                              size="sm"
                            >
                              <Target className="w-4 h-4 mr-2" />
                              Take Assessment
                            </Button>
                          ) : (
                            <p className="text-xs text-gray-500 text-center">
                              Complete all lessons to unlock assessment
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
                  <Button
                    onClick={() => setShowSidebar(!showSidebar)}
                    variant="outline"
                    className="lg:hidden"
                  >
                    {showSidebar ? 'Hide' : 'Show'} Content
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {topics.map((topic) => (
                    <div key={topic.id} className="bg-white border rounded-lg overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b">
                        <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                      </div>
                      
                      <div className="divide-y">
                        {topic.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className={`p-4 hover:bg-gray-50 transition-colors ${
                              currentLesson?.id === lesson.id ? 'bg-primary-50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {lesson.isWatched ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Play className="w-5 h-5 text-primary-600" />
                                )}
                                
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    {lesson.title}
                                    {lesson.isWatched && (
                                      <span className="ml-2 text-xs text-green-600 font-medium">(Completed)</span>
                                    )}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">{lesson.summary}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">{lesson.duration}</span>
                                <Button
                                  onClick={() => toggleBookmark(lesson.id)}
                                  variant="ghost"
                                  size="sm"
                                  className={`${
                                    bookmarkedLessons.includes(lesson.id)
                                      ? 'text-yellow-600'
                                      : 'text-gray-400'
                                  }`}
                                >
                                  <Bookmark className="w-4 h-4" />
                                </Button>
                                

                                
                                <Button
                                  onClick={() => selectLesson(lesson)}
                                  variant="outline"
                                  size="sm"
                                >
                                  {lesson.isWatched ? 'Replay' : 'Start'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Resources</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topics.flatMap(topic => 
                    topic.lessons.flatMap(lesson => 
                      lesson.resources?.map(resource => (
                        <div key={resource.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-5 h-5 text-primary-600" />
                              <span className="font-medium text-gray-900">{resource.name}</span>
                            </div>
                            <span className="text-sm text-gray-500">{resource.size}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">{resource.type}</span>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      )) || []
                    )
                  )}
                </div>
              </div>
            )}

            {/* Placeholder for future Course Discussions implementation */}
            {activeTab === 'discussions' && (
              <div className="p-6">
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Course Discussions</h3>
                  <p className="text-gray-600">This feature is coming soon! Students will be able to discuss lessons, ask questions, and share insights.</p>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">My Notes & Bookmarks</h2>
                  <Button
                    onClick={() => setShowNotes(!showNotes)}
                    variant="outline"
                  >
                    {showNotes ? 'Hide' : 'Show'} Note Editor
                  </Button>
                </div>
                
                {/* Bookmarked Lessons Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Bookmarked Lessons</h3>
                  {bookmarkedLessons.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-medium text-gray-900 mb-2">No Bookmarked Lessons</h4>
                      <p className="text-gray-600">Click the bookmark icon on any lesson to save it for later.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {bookmarkedLessons.map((lessonId) => {
                        const lesson = topics
                          .flatMap(t => t.lessons)
                          .find(l => l.id === lessonId)
                        
                        if (!lesson) return null
                        
                        return (
                          <div key={lessonId} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Bookmark className="w-4 h-4 text-yellow-600" />
                                <h4 className="font-medium text-gray-900 text-sm">{lesson.title}</h4>
                              </div>
                              <Button
                                onClick={() => toggleBookmark(lessonId)}
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-red-500"
                                title="Remove bookmark"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <p className="text-xs text-gray-600 mb-3">{lesson.summary}</p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{lesson.duration}</span>
                              <Button
                                onClick={() => selectLesson(lesson)}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
                                {lesson.isWatched ? 'Replay' : 'Start'}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                
                {/* Notes Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 My Notes</h3>
                  
                  {showNotes && currentLesson && (
                    <div className="bg-white border rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Taking Notes: {currentLesson.title}
                      </h4>
                      <textarea
                        value={currentNote}
                        onChange={(e) => setCurrentNote(e.target.value)}
                        placeholder="Write your notes here..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={4}
                      />
                      <div className="flex justify-end space-x-2 mt-3">
                        <Button variant="outline" onClick={() => setCurrentNote('')}>
                          Clear
                        </Button>
                        <Button onClick={saveNote}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Note
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {notes.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Edit3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-medium text-gray-900 mb-2">No Notes Yet</h4>
                        <p className="text-gray-600">Start taking notes as you learn to track your progress.</p>
                      </div>
                    ) : (
                      notes.map((note) => {
                        const lesson = topics
                          .flatMap(t => t.lessons)
                          .find(l => l.id === note.lessonId)
                        
                        return (
                          <div key={note.id} className="bg-white border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900">
                                {lesson?.title || 'Unknown Lesson'}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {new Date(note.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{note.content}</p>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Course Content */}
        {showSidebar && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
                <Button
                  onClick={() => setShowSidebar(false)}
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-4">
              {topics.map((topic) => (
                <div key={topic.id} className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">{topic.title}</h4>
                  <div className="space-y-2">
                    {topic.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={`w-full p-3 rounded-lg transition-colors ${
                          currentLesson?.id === lesson.id
                            ? 'bg-primary-50 border border-primary-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Lesson Info - Clickable to select */}
                        <button
                          onClick={() => selectLesson(lesson)}
                          className="w-full text-left cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              {lesson.isWatched ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Play className="w-4 h-4 text-primary-600" />
                              )}
                              
                              <div className="text-left">
                                <p className="text-sm font-medium text-gray-900">
                                  {lesson.title}
                                  {lesson.isWatched && (
                                    <span className="ml-2 text-xs text-green-600 font-medium">(Completed)</span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">{lesson.summary}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{lesson.duration}</span>
                            </div>
                          </div>
                        </button>
                        
                        {/* Mark as Completed Button */}
                        {!lesson.isWatched && (
                          <div className="flex justify-end">
                            <Button
                              onClick={() => markLessonAsWatched(lesson.id, true)}
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white border-0 text-xs px-3 py-1 h-7"
                              title="Mark lesson as completed (bypasses video progress requirement)"
                            >
                              Mark Complete
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      )}



      {/* Course Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl max-w-2xl w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">🎉 Course Completed!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Congratulations! You've successfully completed <strong>{course.name}</strong>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">🏆 Certificate</h3>
                <p className="text-blue-700 text-sm">Earn your completion certificate</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">🏅 Badge</h3>
                <p className="text-yellow-700 text-sm">Unlock achievement badges</p>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => setShowAssessmentModal(true)}
                className="bg-primary-600 hover:bg-primary-700"
              >
                <Target className="w-4 h-4 mr-2" />
                Take Final Assessment
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowCompletionModal(false)}
              >
                Continue Learning
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Display Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Certificate of Completion</h2>
                <Button
                  onClick={() => setShowCertificateModal(false)}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Certificate Content */}
            <div className="p-8">
              {/* Certificate Design */}
              <div ref={certificateRef} className="border-8 border-double border-gray-300 rounded-lg p-8 bg-gradient-to-br from-yellow-50 to-orange-50 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-400 opacity-10 rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-blue-400 to-purple-400 opacity-10 rounded-full translate-x-20 translate-y-20"></div>
                
                {/* Certificate Header */}
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Award className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-4xl font-serif text-gray-800 mb-2">Certificate of Completion</h1>
                  <p className="text-lg text-gray-600">This is to certify that</p>
                </div>
                
                {/* Student Name */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2 border-b-2 border-gray-300 pb-2">
                    {user?.name || 'Student Name'}
                  </h2>
                  <p className="text-lg text-gray-600">has successfully completed the course</p>
                </div>
                
                {/* Course Details */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-blue-800 mb-2">{course.name}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex justify-center space-x-8 text-sm text-gray-500">
                    <span>Level: {course.level}</span>
                    <span>Language: {course.language}</span>
                    <span>Lessons: {progress.totalLessons}</span>
                  </div>
                </div>
                
                {/* Completion Details */}
                <div className="text-center mb-8">
                  <p className="text-gray-600 mb-2">Completed on</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {progress.completionDate 
                      ? new Date(progress.completionDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                    }
                  </p>
                </div>
                
                {/* Signature Section */}
                <div className="flex justify-between items-end mt-12">
                  <div className="text-center">
                    <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
                    <p className="text-sm text-gray-600">Course Instructor</p>
                    <p className="font-semibold text-gray-800">{course.instructor || 'Language Expert'}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
                    <p className="text-sm text-gray-600">Platform Director</p>
                    <p className="font-semibold text-gray-800">Global Language Training Center</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-8">
                <Button 
                  onClick={generatePDF}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  onClick={() => {
                    // TODO: Implement social sharing
                    toast.success('Social sharing feature coming soon!')
                  }}
                  variant="outline"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Certificate
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowCertificateModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Assessment Modal */}
      {showAssessmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {!assessmentStarted ? (
              // Assessment Introduction
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Final Assessment - {course.name}
                  </h2>
                  <Button 
                    variant="ghost"
                    onClick={closeAssessmentModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-gray-600 mb-8 text-center">
                  Test your knowledge and earn your final score. This assessment will help you 
                  demonstrate your mastery of the course material.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Assessment Details:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 10 multiple-choice questions</li>
                    <li>• No time limit - take your time</li>
                    <li>• <span className="text-primary-600 font-semibold">Passing score: 70%</span></li>
                    <li>• Certificate awarded upon completion</li>
                    <li>• Score will be recorded and displayed on your profile</li>
                  </ul>
                  
                  {/* Passing Score Highlight */}
                  <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                    <div className="flex items-center justify-center space-x-2">
                      <Target className="w-5 h-5 text-primary-600" />
                      <span className="text-primary-800 font-medium">
                        You need to score 70% or higher to pass this assessment
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={() => {
                      if (!assessmentQuestionsLoaded) {
                        loadAssessmentQuestions()
                      }
                      setAssessmentStarted(true)
                    }}
                    className="bg-primary-600 hover:bg-primary-700"
                    disabled={!assessmentQuestionsLoaded}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    {assessmentQuestionsLoaded ? 'Start Assessment' : 'Loading Questions...'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={closeAssessmentModal}
                  >
                    Take Later
                  </Button>
                </div>
              </>
            ) : !assessmentCompleted ? (
              // Assessment Questions
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>Score: {correctAnswers}/{currentQuestionIndex}</span>
                      <span className="text-primary-600 font-medium">Passing Score: 70%</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost"
                    onClick={() => {
                      if (Object.keys(selectedAnswers).length > 0) {
                        if (confirm('Are you sure you want to exit the assessment? Your progress will be lost.')) {
                          closeAssessmentModal()
                        }
                      } else {
                        closeAssessmentModal()
                      }
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {assessmentQuestions[currentQuestionIndex].question}
                  </h3>
                  
                  <div className="space-y-3">
                    {assessmentQuestions[currentQuestionIndex].options.map((option, index) => (
                      <label key={index} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-3 rounded-lg transition-colors">
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          value={index}
                          checked={selectedAnswers[currentQuestionIndex] === index}
                          onChange={() => setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: index }))}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Button 
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      if (Object.keys(selectedAnswers).length > 0) {
                        // User has answered some questions, show confirmation
                        if (confirm('Are you sure you want to cancel the assessment? Your progress will be lost.')) {
                          closeAssessmentModal()
                        }
                      } else {
                        // No answers yet, exit directly
                        closeAssessmentModal()
                      }
                    }}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Cancel Assessment
                  </Button>
                  
                  {currentQuestionIndex === assessmentQuestions.length - 1 ? (
                    <Button 
                      onClick={submitAssessment}
                      disabled={selectedAnswers[currentQuestionIndex] === undefined}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Submit Assessment
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      disabled={selectedAnswers[currentQuestionIndex] === undefined}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      Next Question
                    </Button>
                  )}
                </div>
              </>
            ) : (
              // Assessment Results
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Assessment Complete! 🎉
                  </h2>
                  <Button 
                    variant="ghost"
                    onClick={closeAssessmentModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-8 mb-6 text-center">
                  <div className="text-6xl mb-4">
                    {assessmentScore >= 70 ? '🏆' : '📚'}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {assessmentScore >= 70 ? 'Congratulations!' : 'Good Effort!'}
                  </h3>
                  <p className="text-xl text-gray-700 mb-4">
                    Your Final Score: <span className="font-bold text-2xl text-primary-600">{assessmentScore}%</span>
                  </p>
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                    <div className="flex items-center justify-center space-x-2">
                      <Target className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">
                        Passing Score: <span className="font-semibold">70%</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    {assessmentScore >= 70 
                      ? `You've successfully passed the assessment with ${correctAnswers} out of ${assessmentQuestions.length} correct answers!`
                      : `You got ${correctAnswers} out of ${assessmentQuestions.length} correct. Keep studying and try again!`
                    }
                  </p>
                </div>
                
                {assessmentScore >= 70 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <Trophy className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="text-yellow-800 font-medium">
                        Certificate unlocked! You can now view and download your completion certificate.
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={() => {
                      closeAssessmentModal()
                      if (assessmentScore >= 70) {
                        setShowCertificateModal(true)
                      }
                    }}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    {assessmentScore >= 70 ? 'View Certificate' : 'Close'}
                  </Button>
                  
                  {assessmentScore < 70 && (
                    <Button 
                      onClick={resetAssessment}
                      variant="outline"
                    >
                      Retake Assessment
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Assessment Review Modal */}
      {showAssessmentReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Assessment Review - {course.name}
              </h2>
              <Button 
                variant="outline"
                onClick={() => setShowAssessmentReviewModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {(() => {
              const results = loadAssessmentResults()
              if (!results) {
                return (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No assessment results found.</p>
                  </div>
                )
              }
              
              return (
                <div className="space-y-6">
                  {/* Score Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-2">
                      {results.score >= 70 ? '🏆' : '📚'}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Final Score: {results.score}%
                    </h3>
                    <p className="text-gray-600">
                      {results.correctAnswers} out of {results.totalQuestions} questions correct
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Completed on: {new Date(results.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Question Review */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Question Review</h3>
                    {results.detailedResults.map((result: any, index: number) => (
                      <div key={index} className={`border rounded-lg p-4 ${
                        result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            Question {result.questionIndex + 1}
                          </h4>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            result.isCorrect 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.isCorrect ? 'Correct' : 'Incorrect'}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{result.question}</p>
                        
                        <div className="space-y-2">
                          {result.options.map((option: string, optionIndex: number) => (
                            <div key={optionIndex} className={`flex items-center space-x-3 p-2 rounded ${
                              optionIndex === result.userAnswer 
                                ? result.isCorrect 
                                  ? 'bg-green-200' 
                                  : 'bg-red-200'
                                : optionIndex === result.correctAnswer
                                  ? 'bg-green-200'
                                  : 'bg-gray-100'
                            }`}>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                optionIndex === result.userAnswer 
                                  ? result.isCorrect 
                                    ? 'border-green-600 bg-green-600' 
                                    : 'border-red-600 bg-red-600'
                                  : optionIndex === result.correctAnswer
                                    ? 'border-green-600 bg-green-600'
                                    : 'border-gray-300'
                              }`}>
                                {optionIndex === result.userAnswer && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                                {optionIndex === result.correctAnswer && optionIndex !== result.userAnswer && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                              <span className={`text-sm ${
                                optionIndex === result.userAnswer 
                                  ? result.isCorrect 
                                    ? 'text-green-800 font-medium' 
                                    : 'text-red-800 font-medium'
                                  : optionIndex === result.correctAnswer
                                    ? 'text-green-800 font-medium'
                                    : 'text-gray-700'
                              }`}>
                                {option}
                              </span>
                              {optionIndex === result.userAnswer && !result.isCorrect && (
                                <span className="text-xs text-red-600 ml-2">Your Answer</span>
                              )}
                              {optionIndex === result.correctAnswer && (
                                <span className="text-xs text-green-600 ml-2">Correct Answer</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-4 pt-4">
                    <Button 
                      onClick={() => setShowAssessmentReviewModal(false)}
                      variant="outline"
                    >
                      Close Review
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowAssessmentReviewModal(false)
                        retakeAssessment()
                      }}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Retake Assessment
                    </Button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(CourseLearningPage)
