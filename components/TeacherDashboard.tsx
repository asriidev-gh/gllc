'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  GraduationCap,
  Clock,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  title: string
  language: string
  level: string
  students: number
  progress: number
  status: 'active' | 'draft' | 'archived'
  createdAt: string
}

interface Student {
  id: string
  name: string
  email: string
  enrolledCourses: number
  progress: number
  lastActive: string
}

export const TeacherDashboard: React.FC = () => {
  const { t } = useLanguage()
  const { user, hasPermission } = useAuthStore()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students' | 'analytics'>('overview')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all')

  useEffect(() => {
    // Load mock data for demo
    loadMockData()
  }, [])

  const loadMockData = () => {
    // Mock courses data
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'English for Beginners',
        language: 'English',
        level: 'Beginner',
        students: 24,
        progress: 85,
        status: 'active',
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        title: 'Tagalog Conversation',
        language: 'Tagalog',
        level: 'Intermediate',
        students: 18,
        progress: 72,
        status: 'active',
        createdAt: '2024-01-10'
      },
      {
        id: '3',
        title: 'Korean Basics',
        language: 'Korean',
        level: 'Beginner',
        students: 12,
        progress: 45,
        status: 'draft',
        createdAt: '2024-01-20'
      }
    ]

    // Mock students data
    const mockStudents: Student[] = [
      {
        id: '1',
        name: 'Maria Santos',
        email: 'maria@example.com',
        enrolledCourses: 3,
        progress: 78,
        lastActive: '2024-01-25'
      },
      {
        id: '2',
        name: 'Juan Dela Cruz',
        email: 'juan@example.com',
        enrolledCourses: 2,
        progress: 65,
        lastActive: '2024-01-24'
      },
      {
        id: '3',
        name: 'Ana Rodriguez',
        email: 'ana@example.com',
        enrolledCourses: 4,
        progress: 92,
        lastActive: '2024-01-25'
      }
    ]

    setCourses(mockCourses)
    setStudents(mockStudents)
  }

  // Navigation functions for stats cards
  const navigateToCourses = () => {
    setActiveTab('courses')
  }

  const navigateToStudents = () => {
    setActiveTab('students')
  }

  const navigateToActiveCourses = () => {
    setActiveTab('courses')
    // Set a filter to show only active courses
    setActiveFilter('active')
  }

  const navigateToProgress = () => {
    setActiveTab('analytics')
  }

  // Get filtered courses based on active filter
  const getFilteredCourses = () => {
    if (activeFilter === 'all') return courses
    return courses.filter(course => course.status === activeFilter)
  }

  // Reset filter when switching tabs
  const handleTabChange = (tab: 'overview' | 'courses' | 'students' | 'analytics') => {
    setActiveTab(tab)
    if (tab !== 'courses') {
      setActiveFilter('all')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const canCreateCourse = hasPermission('create_courses')
  const canEditCourse = hasPermission('edit_courses')
  const canDeleteCourse = hasPermission('delete_courses')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('teacher.dashboard.title') || 'Teacher Dashboard'}
          </h1>
          <p className="text-gray-600">
            {t('teacher.dashboard.subtitle') || 'Manage your courses and monitor student progress'}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: t('teacher.dashboard.tabs.overview') || 'Overview', icon: BarChart3 },
              { id: 'courses', label: t('teacher.dashboard.tabs.courses') || 'Courses', icon: BookOpen },
              { id: 'students', label: t('teacher.dashboard.tabs.students') || 'Students', icon: Users },
              { id: 'analytics', label: t('teacher.dashboard.tabs.analytics') || 'Analytics', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Courses Card */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={navigateToCourses}
                className="bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t('teacher.dashboard.stats.totalCourses') || 'Total Courses'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs text-blue-600 font-medium">
                    {t('teacher.dashboard.stats.clickToViewCourses') || 'Click to view courses'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>

              {/* Total Students Card */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={navigateToStudents}
                className="bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-green-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t('teacher.dashboard.stats.totalStudents') || 'Total Students'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {students.reduce((sum, student) => sum + student.enrolledCourses, 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs text-green-600 font-medium">
                    {t('teacher.dashboard.stats.clickToViewStudents') || 'Click to view students'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>

              {/* Active Courses Card */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={navigateToActiveCourses}
                className="bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-yellow-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t('teacher.dashboard.stats.activeCourses') || 'Active Courses'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {courses.filter(course => course.status === 'active').length}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                    <GraduationCap className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs text-yellow-600 font-medium">
                    {t('teacher.dashboard.stats.clickToViewActiveCourses') || 'Click to view active courses'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-yellow-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>

              {/* Average Progress Card */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={navigateToProgress}
                className="bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-purple-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t('teacher.dashboard.stats.avgProgress') || 'Avg Progress'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs text-purple-600 font-medium">
                    {t('teacher.dashboard.stats.clickToViewAnalytics') || 'Click to view analytics'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('teacher.dashboard.recentActivity.title') || 'Recent Activity'}
              </h3>
              <div className="space-y-3">
                {courses.slice(0, 3).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{course.title}</p>
                        <p className="text-sm text-gray-600">
                          {course.students} {t('teacher.dashboard.students') || 'students'} • {course.progress}% {t('teacher.dashboard.progress') || 'progress'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'courses' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Course Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('teacher.dashboard.courses.title') || 'My Courses'}
              </h2>
              {canCreateCourse && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>{t('teacher.dashboard.courses.create') || 'Create Course'}</span>
                </button>
              )}
            </div>

            {/* Course Filters */}
            <div className="flex space-x-2">
              {[
                { key: 'all', label: t('teacher.dashboard.filters.allCourses') || 'All Courses', count: courses.length },
                { key: 'active', label: t('teacher.dashboard.filters.active') || 'Active', count: courses.filter(c => c.status === 'active').length },
                { key: 'draft', label: t('teacher.dashboard.filters.draft') || 'Draft', count: courses.filter(c => c.status === 'draft').length },
                { key: 'archived', label: t('teacher.dashboard.filters.archived') || 'Archived', count: courses.filter(c => c.status === 'archived').length }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as any)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeFilter === filter.key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Courses List */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('teacher.dashboard.courses.course') || 'Course'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('teacher.dashboard.courses.language') || 'Language'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('teacher.dashboard.courses.students') || 'Students'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('teacher.dashboard.courses.progress') || 'Progress'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('teacher.dashboard.courses.status') || 'Status'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('teacher.dashboard.courses.actions') || 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredCourses().map((course) => (
                      <tr key={course.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                            <div className="text-sm text-gray-500">{course.level}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {course.language}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {course.students}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-900">{course.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                            {course.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            {canEditCourse && (
                              <button className="text-yellow-600 hover:text-yellow-900">
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {canDeleteCourse && (
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'students' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              {t('teacher.dashboard.students.title') || 'My Students'}
            </h2>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('teacher.dashboard.students.name') || 'Name'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('teacher.dashboard.students.email') || 'Email'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('teacher.dashboard.students.courses') || 'Courses'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('teacher.dashboard.students.progress') || 'Progress'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('teacher.dashboard.students.lastActive') || 'Last Active'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.enrolledCourses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-900">{student.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.lastActive}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              {t('teacher.dashboard.analytics.title') || 'Analytics'}
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <p className="text-gray-600">
                {t('teacher.dashboard.analytics.comingSoon') || 'Detailed analytics and reporting features coming soon!'}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
