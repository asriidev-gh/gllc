'use client'

import { useState, useEffect } from 'react'
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
    finalScore: undefined
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
  const [courseCertificate, setCourseCertificate] = useState<CourseCertificate | null>(null)
  const [courseBadges, setCourseBadges] = useState<CourseBadge[]>([])

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

  const generateMockTopics = (courseData: any) => {
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
            isWatched: false,
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
            isWatched: false,
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
            isWatched: false,
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
            isWatched: false,
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
      certificateEarned: false,
      badgeEarned: false,
      finalScore: undefined
    })
  }

  const selectLesson = (lesson: VideoLesson) => {
    if (lesson.isLocked) {
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

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (currentLesson) {
      if (!isPlaying) {
        markLessonAsWatched(currentLesson.id)
      }
    }
  }

  const markLessonAsWatched = (lessonId: string) => {
    setTopics(prev => prev.map(topic => ({
      ...topic,
      lessons: topic.lessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, isWatched: true }
          : lesson
      )
    })))
    
    // Recalculate progress
    const totalLessons = topics.reduce((sum, topic) => sum + topic.lessons.length, 0)
    const completedLessons = topics.reduce((sum, topic) => 
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
    
    // Check if course is completed
    if (completedLessons === totalLessons) {
      handleCourseCompletion()
    } else {
      // Find and advance to next lesson
      const nextLesson = findNextLesson(lessonId)
      if (nextLesson) {
        setCurrentLesson(nextLesson)
        toast.success(`Advanced to next lesson: ${nextLesson.title}`)
      }
    }
    
    // Update lesson locks after completion
    updateLessonLocks()
    
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

  const skipLesson = (lessonId: string) => {
    // Mark lesson as watched (skipped)
    setTopics(prev => prev.map(topic => ({
      ...topic,
      lessons: topic.lessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, isWatched: true, isSkipped: true }
          : lesson
      )
    })))
    
    // Recalculate progress
    const totalLessons = topics.reduce((sum, topic) => sum + topic.lessons.length, 0)
    const completedLessons = topics.reduce((sum, topic) => 
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
    
    // Check if course is completed
    if (completedLessons === totalLessons) {
      handleCourseCompletion()
    } else {
      // Find and advance to next lesson
      const nextLesson = findNextLesson(lessonId)
      if (nextLesson) {
        setCurrentLesson(nextLesson)
        toast.success(`Advanced to next lesson: ${nextLesson.title}`)
      }
    }
    
    // Update lesson locks after skipping
    updateLessonLocks()
    
    setShowSkipLessonModal(false)
    toast.success('Lesson skipped and marked as completed!')
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
                  { id: 'notes', label: 'My Notes', icon: Edit3 }
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
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        <span className="text-gray-700">Completion Certificate</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Earn a certificate upon completing all lessons
                      </p>
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
                                ) : lesson.isLocked ? (
                                  <Circle className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <Play className="w-5 h-5 text-primary-600" />
                                )}
                                
                                <div className="flex-1">
                                  <h4 className={`font-medium ${
                                    lesson.isLocked ? 'text-gray-400' : 'text-gray-900'
                                  }`}>
                                    {lesson.title}
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
                                  disabled={lesson.isLocked}
                                >
                                  {lesson.isLocked ? 'Locked' : 'Start'}
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
                  <h2 className="text-xl font-semibold text-gray-900">My Notes</h2>
                  <Button
                    onClick={() => setShowNotes(!showNotes)}
                    variant="outline"
                  >
                    {showNotes ? 'Hide' : 'Show'} Note Editor
                  </Button>
                </div>
                
                {showNotes && currentLesson && (
                  <div className="bg-white border rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Taking Notes: {currentLesson.title}
                    </h3>
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
                    <div className="text-center py-12">
                      <Edit3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Notes Yet</h3>
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
                            : 'hover:bg-gray-50'
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
                                lesson.isLocked ? 'text-gray-400' : 'text-gray-900'
                              }`}>
                                {lesson.title}
                                {lesson.isSkipped && (
                                  <span className="ml-2 text-xs text-orange-600 font-medium">(Skipped)</span>
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

      {/* Final Assessment Modal */}
      {showAssessmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl max-w-4xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Final Assessment - {course.name}
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Test your knowledge and earn your final score. This assessment will help you 
              demonstrate your mastery of the course material.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Assessment Details:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• 20 multiple-choice questions</li>
                <li>• 30 minutes time limit</li>
                <li>• Passing score: 70%</li>
                <li>• Certificate awarded upon completion</li>
              </ul>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => {
                  setShowAssessmentModal(false)
                  // TODO: Navigate to assessment page
                  toast.success('Assessment feature coming soon!')
                }}
                className="bg-primary-600 hover:bg-primary-700"
              >
                <Target className="w-4 h-4 mr-2" />
                Start Assessment
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowAssessmentModal(false)}
              >
                Take Later
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
