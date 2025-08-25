'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
import { useAuthStore } from '@/stores'
import { Header } from '@/components/Header'
import toast from 'react-hot-toast'
import { recordLearningActivity } from '@/lib/learningActivity'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface VideoLesson {
  id: string
  title: string
  summary: string
  duration: string
  videoUrl: string
  thumbnail: string
  isWatched: boolean
  isLocked: boolean
  isSkipped?: boolean
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

export default function CourseLearningPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const courseId = params.courseId as string
  
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
  
  // New state for enhanced course completion system
  const [showSkipLessonModal, setShowSkipLessonModal] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [showAssessmentReviewModal, setShowAssessmentReviewModal] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [courseCertificate, setCourseCertificate] = useState<CourseCertificate | null>(null)
  const [courseBadges, setCourseBadges] = useState<CourseBadge[]>([])
  const certificateRef = useRef<HTMLDivElement>(null)
  
  // Assessment system state
  const [assessmentStarted, setAssessmentStarted] = useState(false)
  const [assessmentCompleted, setAssessmentCompleted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({})
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [assessmentScore, setAssessmentScore] = useState(0)
  
  // Assessment questions for the course (original order)
  const originalAssessmentQuestions = [
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

  // Shuffled assessment questions (will be set when assessment starts)
  const [assessmentQuestions, setAssessmentQuestions] = useState(originalAssessmentQuestions)

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

  const saveLessonProgress = (courseId: string, lessonId: string, progress: { isWatched: boolean, isSkipped?: boolean, completedAt: string }) => {
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
      userProgress[courseId].totalLessons = courseLessons.length
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
    // Load saved lesson progress
    const savedProgress = loadLessonProgress(courseId)
    
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
            videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            thumbnail: '/api/placeholder/300/200',
            isWatched: savedProgress['lesson_1_1']?.isWatched || false,
            isSkipped: savedProgress['lesson_1_1']?.isSkipped || false,
            isLocked: false,
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
            videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            thumbnail: '/api/placeholder/300/200',
            isWatched: savedProgress['lesson_1_2']?.isWatched || false,
            isSkipped: savedProgress['lesson_1_2']?.isSkipped || false,
            isLocked: false,
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
            videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            thumbnail: '/api/placeholder/300/200',
            isWatched: savedProgress['lesson_2_1']?.isWatched || false,
            isSkipped: savedProgress['lesson_2_1']?.isSkipped || false,
            isLocked: true,
            order: 3,
            resources: [],
            comments: []
          },
          {
            id: 'lesson_2_2',
            title: 'Practice Exercises',
            summary: 'Hands-on practice with basic concepts',
            duration: '15:20',
            videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            thumbnail: '/api/placeholder/300/200',
            isWatched: savedProgress['lesson_2_2']?.isWatched || false,
            isSkipped: savedProgress['lesson_2_2']?.isSkipped || false,
            isLocked: true,
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
    
    // Update lesson locks based on completion status
    updateLessonLocks()
    
    // Calculate progress
    const totalLessons = mockTopics.reduce((sum, topic) => sum + topic.lessons.length, 0)
    const completedLessons = mockTopics.reduce((sum, topic) => 
      sum + topic.lessons.filter(lesson => lesson.isWatched).length, 0
    )
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
  }

  const selectLesson = (lesson: VideoLesson) => {
    // Allow access to completed/skipped lessons, only block genuinely locked lessons
    if (lesson.isLocked && !lesson.isWatched) {
      toast.error('This lesson is locked. Complete previous lessons first.')
      return
    }
    
    setCurrentLesson(lesson)
    setCurrentNote('')
    setShowNotes(false)
    
    // Record course study activity (once per lesson selection)
    if (user?.email) {
      recordLearningActivity(user.email, 'course_study', `${course.name} - ${lesson.title}`)
    }
  }

  const updateLessonLocks = () => {
    // Flatten all lessons and sort by order
    const allLessons = topics
      .flatMap(topic => topic.lessons)
      .sort((a, b) => a.order - b.order)
    
    console.log('Updating lesson locks:', allLessons.map(l => ({ 
      id: l.id, 
      title: l.title, 
      order: l.order, 
      isWatched: l.isWatched, 
      isLocked: l.isLocked 
    })))
    
    setTopics(prev => prev.map(topic => ({
      ...topic,
      lessons: topic.lessons.map(lesson => {
        // First lesson is always unlocked
        if (lesson.order === 1) return { ...lesson, isLocked: false }
        
        // Find the previous lesson by order (across all topics)
        const previousLesson = allLessons.find(l => l.order === lesson.order - 1)
        const isUnlocked = previousLesson && previousLesson.isWatched
        
        console.log(`Lesson ${lesson.order} (${lesson.title}): previous lesson completed = ${isUnlocked}, will be locked = ${!isUnlocked}`)
        
        return { ...lesson, isLocked: !isUnlocked }
      })
    })))
  }

  const updateLessonLocksDirectly = (currentTopics: CourseTopic[]): CourseTopic[] => {
    // Flatten all lessons and sort by order
    const allLessons = currentTopics
      .flatMap(topic => topic.lessons)
      .sort((a, b) => a.order - b.order)
    
    console.log('Updating lesson locks:', allLessons.map(l => ({ 
      id: l.id, 
      title: l.title, 
      order: l.order, 
      isWatched: l.isWatched, 
      isLocked: l.isLocked 
    })))
    
    return currentTopics.map(topic => ({
      ...topic,
      lessons: topic.lessons.map(lesson => {
        // First lesson is always unlocked
        if (lesson.order === 1) return { ...lesson, isLocked: false }
        
        // Find the previous lesson by order (across all topics)
        const previousLesson = allLessons.find(l => l.order === lesson.order - 1)
        const isUnlocked = previousLesson && previousLesson.isWatched
        
        console.log(`Lesson ${lesson.order} (${lesson.title}): previous lesson completed = ${isUnlocked}, will be locked = ${!isUnlocked}`)
        
        return { ...lesson, isLocked: !isUnlocked }
      })
    }))
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (currentLesson) {
      if (!isPlaying) {
        markLessonAsWatched(currentLesson.id)
      }
    }
  }

  const markLessonAsWatched = (lessonId: string) => {
    // Mark lesson as watched and get updated topics
    const updatedTopics = topics.map(topic => ({
      ...topic,
      lessons: topic.lessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, isWatched: true }
          : lesson
      )
    }))
    
    // Update topics state
    setTopics(updatedTopics)
    
    // Save lesson progress to localStorage
    saveLessonProgress(courseId, lessonId, {
      isWatched: true,
      isSkipped: false,
      completedAt: new Date().toISOString()
    })
    
    // Recalculate progress with updated topics
    const totalLessons = updatedTopics.reduce((sum, topic) => sum + topic.lessons.length, 0)
    const completedLessons = updatedTopics.reduce((sum, topic) => 
      sum + topic.lessons.filter(lesson => lesson.isWatched).length, 0
    )
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
    
    // Record lesson completion activity
    if (user?.email && currentLesson) {
      recordLearningActivity(user.email, 'lesson_completed', `${currentLesson.title} - ${course.name}`)
    }
    
    // Update lesson locks with updated topics BEFORE finding next lesson
    const unlockedTopics = updateLessonLocksDirectly(updatedTopics)
    
    // IMPORTANT: Update the main topics state with unlocked lessons
    setTopics(unlockedTopics)
    
    // Check if course is completed
    if (completedLessons === totalLessons) {
      handleCourseCompletion()
    } else {
      // Find and advance to next lesson using the unlocked topics
      const nextLesson = findNextLessonFromTopics(lessonId, unlockedTopics)
      if (nextLesson) {
        setCurrentLesson(nextLesson)
        toast.success(`Advanced to next lesson: ${nextLesson.title}`)
        
        // Debug: Verify the next lesson is unlocked
        console.log('Next lesson unlocked status:', {
          nextLesson: nextLesson.title,
          isLocked: nextLesson.isLocked,
          isWatched: nextLesson.isWatched,
          order: nextLesson.order
        })
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
    
    // Ensure the next lesson is unlocked (should be unlocked if previous was completed)
    if (nextLesson && !nextLesson.isLocked) {
      return nextLesson
    }
    
    return null
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
    
    // Ensure the next lesson is unlocked (should be unlocked if previous was completed)
    if (nextLesson && !nextLesson.isLocked) {
      return nextLesson
    }
    
    return null
  }

  const skipLesson = (lessonId: string) => {
    // Mark lesson as watched (skipped) and get updated topics
    const updatedTopics = topics.map(topic => ({
      ...topic,
      lessons: topic.lessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, isWatched: true, isSkipped: true }
          : lesson
      )
    }))
    
    // Update topics state
    setTopics(updatedTopics)
    
    // Save lesson progress to localStorage
    saveLessonProgress(courseId, lessonId, {
      isWatched: true,
      isSkipped: true,
      completedAt: new Date().toISOString()
    })
    
    // Debug: Log the lesson state after marking as watched
    console.log('After marking lesson as watched:', {
      lessonId,
      currentLesson: currentLesson?.title,
      updatedTopics: updatedTopics.map(topic => ({
        title: topic.title,
        lessons: topic.lessons.map(l => ({ id: l.id, title: l.title, order: l.order, isWatched: l.isWatched, isLocked: l.isLocked }))
      }))
    })
    
    // Recalculate progress with updated topics
    const totalLessons = updatedTopics.reduce((sum, topic) => sum + topic.lessons.length, 0)
    const completedLessons = updatedTopics.reduce((sum, topic) => 
      sum + topic.lessons.filter(lesson => lesson.isWatched).length, 0
    )
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
    
    // Record lesson skip activity
    if (user?.email && currentLesson) {
      recordLearningActivity(user.email, 'lesson_skipped', `${currentLesson.title} - ${course.name}`)
    }
    
    // Update lesson locks with updated topics BEFORE finding next lesson
    const unlockedTopics = updateLessonLocksDirectly(updatedTopics)
    
    // IMPORTANT: Update the main topics state with unlocked lessons
    setTopics(unlockedTopics)
    
    // Check if course is completed
    if (completedLessons === totalLessons) {
      handleCourseCompletion()
    } else {
      // Find and advance to next lesson using the unlocked topics
      const nextLesson = findNextLessonFromTopics(lessonId, unlockedTopics)
      if (nextLesson) {
        setCurrentLesson(nextLesson)
        toast.success(`Advanced to next lesson: ${nextLesson.title}`)
        
        // Debug: Verify the next lesson is unlocked
        console.log('Next lesson unlocked status:', {
          nextLesson: nextLesson.title,
          isLocked: nextLesson.isLocked,
          isWatched: nextLesson.isWatched,
          order: nextLesson.order
        })
      } else {
        console.log('No next lesson found after skip:', { lessonId, completedLessons, totalLessons })
      }
    }
    
    setShowSkipLessonModal(false)
    toast.success('Lesson skipped and marked as completed!')
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
    setShowCompletionModal(true)
    
    // Record course completion activity
    if (user?.email) {
      recordLearningActivity(user.email, 'course_completed', course.name)
    }
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
    setCurrentTime(newTime)
    setVideoProgress((newTime / duration) * 100)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVideoVolume(newVolume)
  }

  const generatePDF = async () => {
    if (!certificateRef.current) return
    
    try {
      toast.loading('Generating PDF...', { id: 'pdf-generation' })
      
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
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Player Section */}
          <div className="bg-black relative">
            <div className="aspect-video relative">
              {/* Video Player */}
              <video
                className="w-full h-full"
                poster={currentLesson?.thumbnail}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={() => {
                  setIsPlaying(false)
                  if (currentLesson) {
                    markLessonAsWatched(currentLesson.id)
                  }
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
                  
                  {/* Skip Lesson Button - Only show if lesson not completed */}
                  {currentLesson && !currentLesson.isWatched && (
                    <Button
                      onClick={() => setShowSkipLessonModal(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white border-0"
                      title="Skip this lesson and mark as completed"
                    >
                      <ChevronRight className="w-4 h-4 mr-1" />
                      Skip Lesson
                    </Button>
                  )}
                  
                  {/* Debug info - remove in production */}
                  {process.env.NODE_ENV === 'development' && currentLesson && (
                    <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                      Lesson {currentLesson.order}: {currentLesson.title} | Watched: {currentLesson.isWatched ? 'Yes' : 'No'} | Skipped: {currentLesson.isSkipped ? 'Yes' : 'No'}
                    </div>
                  )}
                  
                  {/* Progress Bar */}
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleVideoProgress}
                      className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  
                  {/* Time Display */}
                  <div className="text-white text-sm">
                    {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} / 
                    {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}
                  </div>
                  
                  {/* Volume Control */}
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-white" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={videoVolume}
                      onChange={handleVolumeChange}
                      className="w-20 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
                    <Maximize className="w-4 h-4" />
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
                  { id: 'discussions', label: 'Discussions', icon: MessageCircle },
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
                              onClick={retakeAssessment}
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
                              onClick={() => setShowAssessmentModal(true)}
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
                                  lesson.isSkipped ? (
                                    <ChevronRight className="w-5 h-5 text-orange-600" />
                                  ) : (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  )
                                ) : lesson.isLocked ? (
                                  <Circle className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <Play className="w-5 h-5 text-primary-600" />
                                )}
                                
                                <div className="flex-1">
                                  <h4 className={`font-medium ${
                                    lesson.isLocked && !lesson.isWatched ? 'text-gray-400' : 'text-gray-900'
                                  }`}>
                                    {lesson.title}
                                    {lesson.isSkipped && (
                                      <span className="ml-2 text-xs text-orange-600 font-medium">(Skipped)</span>
                                    )}
                                    {lesson.isWatched && !lesson.isSkipped && (
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
                                
                                {/* Skip Lesson Button - Only show if lesson not completed */}
                                {!lesson.isWatched && (
                                  <Button
                                    onClick={() => {
                                      setCurrentLesson(lesson)
                                      setShowSkipLessonModal(true)
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                                  >
                                    <ChevronRight className="w-4 h-4 mr-1" />
                                    Skip
                                  </Button>
                                )}
                                
                                <Button
                                  onClick={() => selectLesson(lesson)}
                                  variant="outline"
                                  size="sm"
                                  disabled={lesson.isLocked && !lesson.isWatched}
                                  className={lesson.isLocked && !lesson.isWatched ? 'opacity-60 cursor-not-allowed' : ''}
                                >
                                  {lesson.isLocked && !lesson.isWatched ? 'Locked' : lesson.isWatched ? 'Replay' : 'Start'}
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

            {activeTab === 'discussions' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Discussions</h2>
                
                {currentLesson ? (
                  <div className="space-y-6">
                    <div className="bg-white border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Discussion for: {currentLesson.title}
                      </h3>
                      
                      {/* Add Comment */}
                      <div className="mb-4">
                        <textarea
                          placeholder="Add a comment or question..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows={3}
                        />
                        <div className="flex justify-end mt-2">
                          <Button>Post Comment</Button>
                        </div>
                      </div>
                      
                      {/* Comments List */}
                      <div className="space-y-4">
                        {currentLesson.comments?.map((comment) => (
                          <div key={comment.id} className="border-l-4 border-primary-200 pl-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-medium">
                                {comment.avatar}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-gray-900">{comment.user}</span>
                                  <span className="text-sm text-gray-500">{comment.timestamp}</span>
                                </div>
                                <p className="text-gray-700 mb-2">{comment.content}</p>
                                
                                <div className="flex items-center space-x-4 text-sm">
                                  <button className="flex items-center space-x-1 text-gray-500 hover:text-primary-600">
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>{comment.likes}</span>
                                  </button>
                                  <button className="text-gray-500 hover:text-primary-600">Reply</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Lesson Selected</h3>
                    <p className="text-gray-600">Select a lesson to view and participate in discussions.</p>
                  </div>
                )}
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
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          currentLesson?.id === lesson.id
                            ? 'bg-primary-50 border border-primary-200'
                            : lesson.isLocked && !lesson.isWatched
                            ? 'opacity-60 cursor-not-allowed'
                            : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {lesson.isWatched ? (
                              lesson.isSkipped ? (
                                <ChevronRight className="w-4 h-4 text-orange-600" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )
                            ) : lesson.isLocked ? (
                              <Circle className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Play className="w-4 h-4 text-primary-600" />
                            )}
                            
                            <div className="text-left">
                              <p className={`text-sm font-medium ${
                                lesson.isLocked && !lesson.isWatched ? 'text-gray-400' : 'text-gray-900'
                              }`}>
                                {lesson.title}
                                {lesson.isSkipped && (
                                  <span className="ml-2 text-xs text-orange-600 font-medium">(Skipped)</span>
                                )}
                                {lesson.isWatched && !lesson.isSkipped && (
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
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Skip Lesson Confirmation Modal */}
      {showSkipLessonModal && currentLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skip Lesson</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to skip <strong>{currentLesson.title}</strong>? 
              This lesson will be marked as completed and you can proceed to the next one.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowSkipLessonModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => skipLesson(currentLesson.id)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Skip & Mark Complete
              </Button>
            </div>
          </div>
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
                    onClick={() => setAssessmentStarted(true)}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Start Assessment
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
