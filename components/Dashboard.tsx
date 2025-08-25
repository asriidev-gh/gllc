'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Award,
  BarChart3,
  Users,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores'
import toast from 'react-hot-toast'

interface EnrolledCourse {
  id: string
  name: string
  language: string
  flag: string
  level: string
  progress: number
  totalLessons: number
  completedLessons: number
  currentLesson: number
  rating: number
  lastAccessed: string
  timeSpent: string
  certificate?: boolean
}

interface DashboardStats {
  totalCourses: number
  totalLessons: number
  completedLessons: number
  totalTimeSpent: string
  averageRating: number
  streakDays: number
  achievements: number
}

export function Dashboard() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    totalTimeSpent: '0h 0m',
    averageRating: 0,
    streakDays: 0,
    achievements: 0
  })
  const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(null)
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false)
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false)
  const [courseToUnenroll, setCourseToUnenroll] = useState<EnrolledCourse | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [achievementDetails, setAchievementDetails] = useState<any[]>([])
  const [showAllActivities, setShowAllActivities] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/')
      return
    }

    // Simulate loading enrolled courses
    loadEnrolledCourses()
    
    // Load recent activity
    loadRecentActivity()
    
    // Record dashboard visit activity
    recordLearningActivity('dashboard_visit', 'Dashboard accessed')
    
    // Show welcome message for new users
    const isNewUser = localStorage.getItem('show_welcome_message')
    if (isNewUser === 'true') {
      setShowWelcomeMessage(true)
      // Remove the flag so it doesn't show again
      localStorage.removeItem('show_welcome_message')
      
      // Auto-hide welcome message after 10 seconds
      setTimeout(() => {
        setShowWelcomeMessage(false)
      }, 10000)
    }
    
    // Initialize sample learning activity for testing (remove in production)
    initializeSampleLearningActivity()
  }, [isAuthenticated, router])

  // Reload recent activity when filters change
  useEffect(() => {
    if (isAuthenticated) {
      loadRecentActivity()
    }
  }, [selectedDate, showAllActivities])

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Calculate learning streak based on actual activity
  const calculateLearningStreak = (): number => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    // Get learning activity from localStorage
    const learningActivity = JSON.parse(localStorage.getItem('learningActivity') || '{}')
    const userActivity = learningActivity[user?.email || ''] || []
    
    if (userActivity.length === 0) return 0
    
    // Sort activities by date (newest first)
    const sortedActivity = userActivity.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    let streak = 0
    let currentDate = new Date(today)
    
    // Check consecutive days
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dateStr = currentDate.toISOString().split('T')[0]
      const hasActivity = sortedActivity.some((activity: any) => 
        activity.date === dateStr
      )
      
      if (hasActivity) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  // Calculate achievements based on actual user progress and return detailed breakdown
  const calculateAchievements = (courses: EnrolledCourse[], completedLessons: number, totalLessons: number): { count: number, details: any[] } => {
    let achievementCount = 0
    const achievements = []
    
    // Achievement 1: First Course Enrollment
    if (courses.length >= 1) {
      achievementCount++
      achievements.push({
        id: 'first_course',
        title: 'First Steps',
        description: 'Enrolled in your first course',
        icon: '📚',
        unlocked: true,
        category: 'Course Enrollment'
      })
    }
    
    // Achievement 2: Multiple Course Enrollments
    if (courses.length >= 3) {
      achievementCount++
      achievements.push({
        id: 'multiple_courses',
        title: 'Course Collector',
        description: `Enrolled in ${courses.length} courses`,
        icon: '🎯',
        unlocked: true,
        category: 'Course Enrollment'
      })
    }
    
    // Achievement 3: First Lesson Completion
    if (completedLessons >= 1) {
      achievementCount++
      achievements.push({
        id: 'first_lesson',
        title: 'Lesson Learner',
        description: 'Completed your first lesson',
        icon: '✅',
        unlocked: true,
        category: 'Lesson Completion'
      })
    }
    
    // Achievement 4: Lesson Completion Milestones
    if (completedLessons >= 5) {
      achievementCount++
      achievements.push({
        id: 'five_lessons',
        title: 'Getting Started',
        description: 'Completed 5 lessons',
        icon: '🚀',
        unlocked: true,
        category: 'Lesson Completion'
      })
    }
    if (completedLessons >= 10) {
      achievementCount++
      achievements.push({
        id: 'ten_lessons',
        title: 'Steady Progress',
        description: 'Completed 10 lessons',
        icon: '📈',
        unlocked: true,
        category: 'Lesson Completion'
      })
    }
    if (completedLessons >= 25) {
      achievementCount++
      achievements.push({
        id: 'twenty_five_lessons',
        title: 'Lesson Master',
        description: 'Completed 25 lessons',
        icon: '👑',
        unlocked: true,
        category: 'Lesson Completion'
      })
    }
    
    // Achievement 5: Course Progress Milestones
    if (totalLessons > 0) {
      const progressPercentage = (completedLessons / totalLessons) * 100
      if (progressPercentage >= 25) {
        achievementCount++
        achievements.push({
          id: 'progress_25',
          title: 'Quarter Way There',
          description: '25% course progress achieved',
          icon: '🎯',
          unlocked: true,
          category: 'Progress Milestones'
        })
      }
      if (progressPercentage >= 50) {
        achievementCount++
        achievements.push({
          id: 'progress_50',
          title: 'Halfway Point',
          description: '50% course progress achieved',
          icon: '🎯',
          unlocked: true,
          category: 'Progress Milestones'
        })
      }
      if (progressPercentage >= 75) {
        achievementCount++
        achievements.push({
          id: 'progress_75',
          title: 'Almost There',
          description: '75% course progress achieved',
          icon: '🎯',
          unlocked: true,
          category: 'Progress Milestones'
        })
      }
      if (progressPercentage >= 100) {
        achievementCount++
        achievements.push({
          id: 'progress_100',
          title: 'Course Champion',
          description: '100% course progress achieved',
          icon: '🏆',
          unlocked: true,
          category: 'Progress Milestones'
        })
      }
    }
    
    // Achievement 6: Learning Streak
    const streak = calculateLearningStreak()
    if (streak >= 3) {
      achievementCount++
      achievements.push({
        id: 'streak_3',
        title: 'Getting in the Habit',
        description: '3-day learning streak',
        icon: '🔥',
        unlocked: true,
        category: 'Learning Streaks'
      })
    }
    if (streak >= 7) {
      achievementCount++
      achievements.push({
        id: 'streak_7',
        title: 'Week Warrior',
        description: '7-day learning streak',
        icon: '🔥',
        unlocked: true,
        category: 'Learning Streaks'
      })
    }
    if (streak >= 14) {
      achievementCount++
      achievements.push({
        id: 'streak_14',
        title: 'Fortnight Fighter',
        description: '14-day learning streak',
        icon: '🔥',
        unlocked: true,
        category: 'Learning Streaks'
      })
    }
    if (streak >= 30) {
      achievementCount++
      achievements.push({
        id: 'streak_30',
        title: 'Monthly Master',
        description: '30-day learning streak',
        icon: '🔥',
        unlocked: true,
        category: 'Learning Streaks'
      })
    }
    
    // Achievement 7: Language Diversity
    const uniqueLanguages = new Set(courses.map(course => course.language))
    if (uniqueLanguages.size >= 2) {
      achievementCount++
      achievements.push({
        id: 'languages_2',
        title: 'Bilingual Beginner',
        description: `Learning ${uniqueLanguages.size} languages`,
        icon: '🌍',
        unlocked: true,
        category: 'Language Diversity'
      })
    }
    if (uniqueLanguages.size >= 3) {
      achievementCount++
      achievements.push({
        id: 'languages_3',
        title: 'Polyglot in Progress',
        description: `Learning ${uniqueLanguages.size} languages`,
        icon: '🌍',
        unlocked: true,
        category: 'Language Diversity'
      })
    }
    
    return { count: achievementCount, details: achievements }
  }

  const loadEnrolledCourses = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Load real enrolled courses from localStorage
    const savedEnrollments = localStorage.getItem('enrolled_courses')
    let courses: EnrolledCourse[] = []
    
    if (savedEnrollments) {
      try {
        const enrollments = JSON.parse(savedEnrollments)
        console.log('Raw enrollments from localStorage:', enrollments)
        
        courses = enrollments.map((enrollment: any) => {
          console.log('Processing enrollment:', enrollment)
          console.log('Enrollment properties:', Object.keys(enrollment))
          console.log('enrollment.name:', enrollment.name)
          console.log('enrollment.title:', enrollment.title)
          
          return {
            id: enrollment.id,
            name: enrollment.name || enrollment.title || 'Unknown Course', // Fallback to title if name doesn't exist
            language: enrollment.language,
            flag: enrollment.flag,
            level: enrollment.level,
            progress: enrollment.progress || 0,
            totalLessons: enrollment.totalLessons,
            completedLessons: enrollment.completedLessons || 0,
            currentLesson: enrollment.currentLesson || 1,
            rating: enrollment.rating,
            lastAccessed: enrollment.lastAccessed || 'Just now',
            timeSpent: enrollment.timeSpent || '0h 0m',
            certificate: enrollment.certificate || false
          }
        })
        
        console.log('Processed courses for dashboard:', courses)
      } catch (error) {
        console.error('Error loading enrolled courses:', error)
        courses = []
      }
    }
    
    setEnrolledCourses(courses)
    
    // Calculate stats from real data
    const totalLessons = courses.reduce((sum, course) => sum + course.totalLessons, 0)
    const completedLessons = courses.reduce((sum, course) => sum + course.completedLessons, 0)
    const totalTimeSpent = courses.reduce((sum, course) => {
      const [hours, minutes] = course.timeSpent.split('h ')
      return sum + parseInt(hours) + parseInt(minutes) / 60
    }, 0)
    const averageRating = courses.length > 0 
      ? courses.reduce((sum, course) => sum + course.rating, 0) / courses.length 
      : 0
    
    // Calculate real learning streak and achievements
    const streakDays = calculateLearningStreak()
    const achievementsData = calculateAchievements(courses, completedLessons, totalLessons)
    
    setStats({
      totalCourses: courses.length,
      totalLessons,
      completedLessons,
      totalTimeSpent: `${Math.floor(totalTimeSpent)}h ${Math.round((totalTimeSpent % 1) * 60)}m`,
      averageRating: Math.round(averageRating * 10) / 10,
      streakDays,
      achievements: achievementsData.count
    })
    
    // Store achievement details for display
    setAchievementDetails(achievementsData.details)
  }



  // Function to unenroll from a specific course
  const unenrollFromCourse = (courseId: string) => {
    try {
      // Get current enrollments
      const savedEnrollments = JSON.parse(localStorage.getItem('enrolled_courses') || '[]')
      
      // Find the course name before removing it
      const courseToRemove = savedEnrollments.find((enrollment: any) => enrollment.id === courseId)
      const courseName = courseToRemove?.name || 'Unknown Course'
      
      // Remove the specific course
      const updatedEnrollments = savedEnrollments.filter((enrollment: any) => enrollment.id !== courseId)
      
      // Save back to localStorage
      localStorage.setItem('enrolled_courses', JSON.stringify(updatedEnrollments))
      
      // Update local state
      setEnrolledCourses(prev => prev.filter(course => course.id !== courseId))
      
      // Recalculate stats
      loadEnrolledCourses()
      
      // Record unenrollment activity
      recordLearningActivity('course_unenrollment', courseName)
      
      // Show success toast
      toast.success(`Successfully unenrolled from ${courseName}`)
      
      console.log(`Unenrolled from course ${courseId}`)
    } catch (error) {
      console.error('Error unenrolling from course:', error)
      toast.error('Failed to unenroll from course. Please try again.')
    }
  }

  // Function to show unenroll confirmation
  const showUnenrollConfirmation = (course: EnrolledCourse) => {
    setCourseToUnenroll(course)
    setShowUnenrollConfirm(true)
  }

  // Function to confirm unenrollment
  const confirmUnenroll = () => {
    if (courseToUnenroll) {
      toast.success(`Unenrolling from ${courseToUnenroll.name}...`)
      unenrollFromCourse(courseToUnenroll.id)
      setShowUnenrollConfirm(false)
      setCourseToUnenroll(null)
    }
  }

  const continueLearning = (course: EnrolledCourse) => {
    // Record learning activity before navigating
    recordLearningActivity('course_access', course.name)
    
    // Navigate to the course learning page
    router.push(`/courses/${course.id}`)
  }

  // Record learning activity for streak calculation
  const recordLearningActivity = (action: string, details: string) => {
    if (!user?.email) return
    
    const today = new Date().toISOString().split('T')[0]
    const learningActivity = JSON.parse(localStorage.getItem('learningActivity') || '{}')
    const userActivity = learningActivity[user.email] || []
    
    // Check if we already have activity for today
    const todayActivity = userActivity.find((activity: any) => activity.date === today)
    
    if (todayActivity) {
      // Update existing activity
      todayActivity.actions = [...(todayActivity.actions || []), { action, details, timestamp: new Date().toISOString() }]
    } else {
      // Create new activity for today
      userActivity.push({
        date: today,
        actions: [{ action, details, timestamp: new Date().toISOString() }]
      })
    }
    
    // Save back to localStorage
    learningActivity[user.email] = userActivity
    localStorage.setItem('learningActivity', JSON.stringify(learningActivity))
    
    // Refresh recent activity display
    loadRecentActivity()
    
    console.log('Learning activity recorded:', { action, details, date: today })
  }

  // Initialize sample learning activity for testing (remove in production)
  const initializeSampleLearningActivity = () => {
    if (!user?.email) return
    
    const learningActivity = JSON.parse(localStorage.getItem('learningActivity') || '{}')
    const userActivity = learningActivity[user.email] || []
    
    // Only initialize if no activity exists
    if (userActivity.length === 0) {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const twoDaysAgo = new Date(today)
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
      
      const sampleActivity = [
        {
          date: today.toISOString().split('T')[0],
          actions: [
            { action: 'course_access', details: 'Dashboard visit', timestamp: today.toISOString() }
          ]
        },
        {
          date: yesterday.toISOString().split('T')[0],
          actions: [
            { action: 'lesson_completed', details: 'English Basics Lesson 1', timestamp: yesterday.toISOString() }
          ]
        },
        {
          date: twoDaysAgo.toISOString().split('T')[0],
          actions: [
            { action: 'course_enrollment', details: 'Tagalog Conversation', timestamp: twoDaysAgo.toISOString() }
          ]
        }
      ]
      
      learningActivity[user.email] = sampleActivity
      localStorage.setItem('learningActivity', JSON.stringify(learningActivity))
      console.log('Sample learning activity initialized for testing')
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 60) return 'text-yellow-600'
    if (progress >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getProgressBarColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-yellow-500'
    if (progress >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Load recent activity from learning activity data
  const loadRecentActivity = () => {
    if (!user?.email) return
    
    try {
      const learningActivity = JSON.parse(localStorage.getItem('learningActivity') || '{}')
      const userActivity = learningActivity[user.email] || []
      
      // Get activities based on date filter
      const recentActivities: any[] = []
      const today = new Date()
      
      let daysToCheck = 7 // Default to last 7 days
      if (selectedDate === '30') daysToCheck = 30
      else if (selectedDate === '90') daysToCheck = 90
      else if (selectedDate === '') daysToCheck = 365 // All time
      
      for (let i = 0; i < daysToCheck; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayActivity = userActivity.find((activity: any) => activity.date === dateStr)
        if (dayActivity && dayActivity.actions) {
          dayActivity.actions.forEach((action: any) => {
            recentActivities.push({
              ...action,
              date: dateStr,
              displayDate: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i} days ago`
            })
          })
        }
      }
      
      // Sort by timestamp (most recent first)
      const sortedActivities = recentActivities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      // Apply limit based on showAllActivities state
      const limitedActivities = showAllActivities ? sortedActivities : sortedActivities.slice(0, 5)
      
      setRecentActivity(limitedActivities)
      console.log('Recent activity loaded:', limitedActivities.length, 'activities')
    } catch (error) {
      console.error('Error loading recent activity:', error)
      setRecentActivity([])
    }
  }

  // Get activity icon and color based on action type
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'dashboard_visit':
        return { icon: '🏠', color: 'bg-gray-500' }
      case 'course_access':
        return { icon: '🎯', color: 'bg-blue-500' }
      case 'course_browsing':
        return { icon: '🔍', color: 'bg-indigo-500' }
      case 'lesson_completed':
        return { icon: '✅', color: 'bg-green-500' }
      case 'course_enrollment':
        return { icon: '📚', color: 'bg-purple-500' }
      case 'course_unenrollment':
        return { icon: '🚫', color: 'bg-red-500' }
      case 'achievement_earned':
        return { icon: '🏆', color: 'bg-yellow-500' }
      case 'assessment_completed':
        return { icon: '📊', color: 'bg-indigo-500' }
      default:
        return { icon: '📝', color: 'bg-gray-500' }
    }
  }

  // Format activity description
  const formatActivityDescription = (action: string, details: string) => {
    switch (action) {
      case 'dashboard_visit':
        return details
      case 'course_access':
        return `Accessed ${details}`
      case 'course_browsing':
        return details
      case 'lesson_completed':
        return `Completed ${details}`
      case 'course_enrollment':
        return `Enrolled in ${details}`
      case 'course_unenrollment':
        return `Unenrolled from ${details}`
      case 'achievement_earned':
        return `Earned ${details}`
      case 'assessment_completed':
        return `Completed assessment: ${details}`
      default:
        return details
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name || 'Student'}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Continue your language learning journey
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Learning Streak</p>
                <p className="text-2xl font-bold text-primary-600">{stats.streakDays} days 🔥</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Achievements</p>
                <p className="text-2xl font-bold text-secondary-600">{stats.achievements} 🏆</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        {showWelcomeMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎉</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Welcome to Global Language Training Center!</h2>
                  <p className="text-green-100 text-lg">
                    Your account has been created successfully. Start exploring our courses and begin your language learning journey!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWelcomeMessage(false)}
                className="text-white/80 hover:text-white transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Lessons</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedLessons}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTimeSpent}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-gray-600 mt-1">
              Get started quickly with these options
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline"
                className="h-16 text-lg justify-start"
                onClick={() => router.push('/courses')}
              >
                <BookOpen className="w-6 h-6 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Browse All Courses</div>
                  <div className="text-sm text-gray-500">Discover new languages to learn</div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                className="h-16 text-lg justify-start"
                onClick={() => router.push('/assessment')}
              >
                <Target className="w-6 h-6 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Take Assessment</div>
                  <div className="text-sm text-gray-500">Find your perfect starting level</div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                className="h-16 text-lg justify-start"
                onClick={() => router.push('/assessment?step=history')}
              >
                <Award className="w-6 h-6 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Assessment History</div>
                  <div className="text-sm text-gray-500">Review your past results</div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Enrolled Courses</h2>
                <p className="text-gray-600 mt-1">
                  Continue where you left off or start a new lesson
                </p>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => router.push('/courses')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Browse More
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled yet</h3>
                <p className="text-gray-600 mb-6">
                  Start your language learning journey by enrolling in a course
                </p>
                <div className="space-y-4">
                  <Button 
                    className="px-6 py-3"
                    onClick={() => router.push('/courses')}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse All Courses
                  </Button>
                  <p className="text-sm text-gray-500">
                    Discover languages like English, Tagalog, Korean, Japanese, and more!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {enrolledCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">{course.flag}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                            <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                              {course.level}
                            </span>
                            {course.certificate && (
                              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center">
                                <Award className="w-3 h-3 mr-1" />
                                Certificate
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                            <span className="flex items-center">
                              <BookOpen className="w-4 h-4 mr-1" />
                              Lesson {course.currentLesson} of {course.totalLessons}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {course.lastAccessed}
                            </span>
                            <span className="flex items-center">
                              <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                              {course.rating}
                            </span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Progress</span>
                              <span className={`text-sm font-semibold ${getProgressColor(course.progress)}`}>
                                {course.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getProgressBarColor(course.progress)}`}
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <Button
                          onClick={() => continueLearning(course)}
                          className="px-6 py-2"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Continue
                        </Button>
                        <Button
                          onClick={() => showUnenrollConfirmation(course)}
                          variant="outline"
                          className="px-4 py-2 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 transition-colors"
                          title="Remove this course from your enrolled courses"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Unenroll
                        </Button>
                        <p className="text-xs text-gray-500 text-right mt-2">
                          {course.timeSpent} spent
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Browse All Courses Link */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Want to learn more languages? Explore our complete course catalog
                </p>
                <Button 
                  variant="outline"
                  className="px-6 py-3"
                  onClick={() => router.push('/courses')}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse All Courses
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <div className="flex items-center space-x-3">
              {/* Date Filter */}
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              
              {/* View All Button */}
              <button
                onClick={() => setShowAllActivities(!showAllActivities)}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                {showAllActivities ? 'Show Recent' : 'View All'}
              </button>
              
              {/* Refresh Button */}
              <button
                onClick={loadRecentActivity}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                title="Refresh recent activity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const { icon, color } = getActivityIcon(activity.action)
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-white text-sm`}>
                        {icon}
                      </div>
                      <span className="text-sm text-gray-600 flex-1">
                        {formatActivityDescription(activity.action, activity.details)}
                      </span>
                      <span className="text-xs text-gray-400">{activity.displayDate}</span>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No recent activity yet</p>
                <p className="text-sm text-gray-400 mt-1">Start learning to see your activity here!</p>
              </div>
            )}
          </div>
        </div>

        {/* Achievements Breakdown */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Achievements</h2>
            <p className="text-sm text-gray-600 mt-1">
              {achievementDetails.length} of 20+ possible achievements unlocked
            </p>
          </div>
          <div className="p-6">
            {achievementDetails.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievementDetails.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{achievement.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          {achievement.category}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No achievements unlocked yet</p>
                <p className="text-sm text-gray-400 mt-1">Start learning to earn your first achievement!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unenroll Confirmation Dialog */}
      {showUnenrollConfirm && courseToUnenroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Unenrollment</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to unenroll from <strong>{courseToUnenroll.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowUnenrollConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmUnenroll}>
                Unenroll
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
