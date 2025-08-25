'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Globe, Edit, Save, X, Camera } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/Header'
import { useAuthStore, useUserStore } from '@/stores'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { profile, updateProfile } = useUserStore()
  
  const [isEditing, setIsEditing] = useState(false)
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalLessons: 0,
    completedLessons: 0
  })
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    targetLanguages: user?.targetLanguages || [],
    nativeLanguage: user?.nativeLanguage || '',
    bio: profile?.bio || ''
  })

  // Load enrolled courses and calculate stats
  const loadEnrolledCourses = () => {
    try {
      const savedEnrollments = localStorage.getItem('enrolled_courses')
      let courses: any[] = []
      
      if (savedEnrollments) {
        courses = JSON.parse(savedEnrollments).map((enrollment: any) => ({
          id: enrollment.id,
          name: enrollment.name || enrollment.title || 'Unknown Course',
          language: enrollment.language,
          progress: enrollment.progress || 0,
          totalLessons: enrollment.totalLessons,
          completedLessons: enrollment.completedLessons || 0
        }))
      }
      
      setEnrolledCourses(courses)
      
      // Calculate stats from real data
      const totalLessons = courses.reduce((sum, course) => sum + course.totalLessons, 0)
      const completedLessons = courses.reduce((sum, course) => sum + course.completedLessons, 0)
      
      setStats({
        totalCourses: courses.length,
        totalLessons,
        completedLessons
      })
      
    } catch (error) {
      console.error('Error loading enrolled courses:', error)
    }
  }

  useEffect(() => {
    loadEnrolledCourses()
  }, [])

  const handleSave = async () => {
    try {
      await updateProfile({
        bio: formData.bio
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      age: user?.age || '',
      targetLanguages: user?.targetLanguages || [],
      nativeLanguage: user?.nativeLanguage || '',
      bio: profile?.bio || ''
    })
    setIsEditing(false)
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Please sign in to view your profile</h1>
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
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl shadow-sm border p-6">
                {/* Profile Picture */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                  <p className="text-gray-600">{user.role}</p>
                </div>

                {/* Member Since */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'August 23, 2025'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Learning Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-600">Courses Enrolled</span>
                    <span className="text-sm font-medium text-blue-900">{stats.totalCourses}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-600">Lessons Completed</span>
                    <span className="text-sm font-medium text-green-900">{stats.completedLessons}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Target Courses Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Courses</h3>
                <div className="space-y-2">
                  {enrolledCourses.length > 0 ? (
                    enrolledCourses.map((course, index) => (
                      <span
                        key={index}
                        className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mb-2"
                      >
                        {course.name}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No courses enrolled yet</p>
                  )}
                </div>
              </div>
              </div>
            </motion.div>

            {/* Profile Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSave}
                        className="flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={!isEditing}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={!isEditing}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          disabled={!isEditing}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Native Language</label>
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.nativeLanguage}
                          onChange={(e) => setFormData({ ...formData, nativeLanguage: e.target.value })}
                          disabled={!isEditing}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>



                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      placeholder="Tell us about yourself and your language learning goals..."
                    />
                  </div>


                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
