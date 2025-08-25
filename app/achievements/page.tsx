'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, Target, BookOpen, Clock, Award, Medal, Crown, Globe, MessageCircle, Headphones, Calendar } from 'lucide-react'
import { Header } from '@/components/Header'
import { useAuthStore } from '@/stores'
import { useRouter } from 'next/navigation'

export default function AchievementsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [achievementDetails, setAchievementDetails] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    totalTimeSpent: '0h 0m',
    averageRating: 0,
    streakDays: 0,
    achievements: 0
  })

  // Calculate learning streak based on learning activity
  const calculateLearningStreak = (): number => {
    if (!user?.email) return 0
    
    try {
      const learningActivity = JSON.parse(localStorage.getItem('learningActivity') || '{}')
      const userActivity = learningActivity[user.email] || []
      
      if (userActivity.length === 0) return 0
      
      let streak = 0
      const today = new Date()
      let currentDate = new Date(today)
      
      // Check consecutive days backwards from today
      for (let i = 0; i < 30; i++) { // Check up to 30 days
        const dateStr = currentDate.toISOString().split('T')[0]
        const dayActivity = userActivity.find((activity: any) => activity.date === dateStr)
        
        if (dayActivity && dayActivity.actions && dayActivity.actions.length > 0) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else {
          break
        }
      }
      
      return streak
    } catch (error) {
      console.error('Error calculating learning streak:', error)
      return 0
    }
  }

  // Calculate achievements based on actual user progress and return detailed breakdown
  const calculateAchievements = (courses: any[], completedLessons: number, totalLessons: number): { count: number, details: any[] } => {
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
        category: 'Course Enrollment',
        unlockedAt: new Date().toISOString().split('T')[0]
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
        category: 'Course Enrollment',
        unlockedAt: new Date().toISOString().split('T')[0]
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
        category: 'Lesson Completion',
        unlockedAt: new Date().toISOString().split('T')[0]
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
        category: 'Lesson Completion',
        unlockedAt: new Date().toISOString().split('T')[0]
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
        category: 'Lesson Completion',
        unlockedAt: new Date().toISOString().split('T')[0]
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
        category: 'Lesson Completion',
        unlockedAt: new Date().toISOString().split('T')[0]
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
          category: 'Progress Milestones',
          unlockedAt: new Date().toISOString().split('T')[0]
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
          category: 'Progress Milestones',
          unlockedAt: new Date().toISOString().split('T')[0]
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
          category: 'Progress Milestones',
          unlockedAt: new Date().toISOString().split('T')[0]
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
          category: 'Progress Milestones',
          unlockedAt: new Date().toISOString().split('T')[0]
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
        category: 'Learning Streaks',
        unlockedAt: new Date().toISOString().split('T')[0]
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
        category: 'Learning Streaks',
        unlockedAt: new Date().toISOString().split('T')[0]
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
        category: 'Learning Streaks',
        unlockedAt: new Date().toISOString().split('T')[0]
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
        category: 'Learning Streaks',
        unlockedAt: new Date().toISOString().split('T')[0]
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
        category: 'Language Diversity',
        unlockedAt: new Date().toISOString().split('T')[0]
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
        category: 'Language Diversity',
        unlockedAt: new Date().toISOString().split('T')[0]
      })
    }
    
    return { count: achievementCount, details: achievements }
  }

  // Load enrolled courses and calculate achievements
  const loadEnrolledCourses = async () => {
    try {
      const savedEnrollments = localStorage.getItem('enrolled_courses')
      let courses: any[] = []
      
      if (savedEnrollments) {
        courses = JSON.parse(savedEnrollments).map((enrollment: any) => ({
          id: enrollment.id,
          name: enrollment.name || enrollment.title || 'Unknown Course',
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
        }))
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
      
      // Load recent activity
      loadRecentActivity()
      
    } catch (error) {
      console.error('Error loading enrolled courses:', error)
    }
  }

  // Load recent activity from learning activity data
  const loadRecentActivity = () => {
    if (!user?.email) return
    
    try {
      const learningActivity = JSON.parse(localStorage.getItem('learningActivity') || '{}')
      const userActivity = learningActivity[user.email] || []
      
      // Get recent activities (last 7 days)
      const recentActivities: any[] = []
      const today = new Date()
      
      for (let i = 0; i < 7; i++) {
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
      
      // Sort by timestamp (most recent first) and take top 5
      const sortedActivities = recentActivities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5)
      
      setRecentActivity(sortedActivities)
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
      return
    }
    
    loadEnrolledCourses()
  }, [isAuthenticated, router])

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Please sign in to view your achievements</h1>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Achievements</h1>
            <p className="text-xl text-gray-600">Track your progress and celebrate your language learning milestones</p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalLessons}</h3>
              <p className="text-sm text-gray-600">Total Lessons</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.streakDays} days</h3>
              <p className="text-sm text-gray-600">Study Streak</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{enrolledCourses.length}</h3>
              <p className="text-sm text-gray-600">Courses</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{achievementDetails.length}</h3>
              <p className="text-sm text-gray-600">Achievements</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
                  <span className="text-sm text-gray-600">
                    {achievementDetails.filter(a => a.unlocked).length} of {achievementDetails.length} unlocked
                  </span>
                </div>

                <div className="space-y-4">
                  {achievementDetails.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      className="p-4 rounded-lg border bg-green-50 border-green-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-green-800">
                              {achievement.title}
                            </h3>
                            <span className="text-xs text-green-600 font-medium">
                              Unlocked {achievement.unlockedAt}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {achievement.category}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => {
                      const { icon, color } = getActivityIcon(activity.action)
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.1 }}
                          className="flex items-center space-x-3 text-sm"
                        >
                          <div className={`w-2 h-2 ${color} rounded-full`}></div>
                          <span className="text-gray-600 flex-1">
                            {formatActivityDescription(activity.action, activity.details)}
                          </span>
                          <span className="text-gray-400">{activity.displayDate}</span>
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
            </motion.div>
          </div>

          {/* Motivation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white"
          >
            <Award className="w-16 h-16 mx-auto mb-4 text-blue-200" />
            <h2 className="text-2xl font-bold mb-4">Keep Up the Great Work!</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              You're making excellent progress in your language learning journey. 
              Every lesson completed brings you closer to fluency!
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Continue Learning
              </button>
              <button 
                onClick={() => router.push('/courses')}
                className="px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
              >
                Explore Courses
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
