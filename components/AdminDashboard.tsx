'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Shield, 
  Settings, 
  BarChart3, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  UserCheck,
  UserX,
  Crown,
  GraduationCap,
  BookOpen,
  Activity,
  ArrowRight,
  Search
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'
import { CreateUserModal } from './CreateUserModal'
import { ViewUserModal } from './ViewUserModal'
import { EditUserModal } from './EditUserModal'
import { DeleteUserModal } from './DeleteUserModal'

interface SystemUser {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPERADMIN'
  status: 'active' | 'inactive' | 'suspended'
  lastLogin: string
  createdAt: string
  coursesCount: number
  studentsCount?: number
}

interface SystemStats {
  totalUsers: number
  totalCourses: number
  totalStudents: number
  totalTeachers: number
  activeUsers: number
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical'
}

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage()
  const { user: currentUser, hasPermission, canAccess } = useAuthStore()
  const router = useRouter()
  const [users, setUsers] = useState<SystemUser[]>([])
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    activeUsers: 0,
    systemHealth: 'excellent'
  })
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system' | 'analytics'>('overview')
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null)
  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false)
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadMockData()
  }, [])

  const loadMockData = () => {
    // Mock users data
    const mockUsers: SystemUser[] = [
      {
        id: '1',
        name: 'Maria Santos',
        email: 'maria@example.com',
        role: 'STUDENT',
        status: 'active',
        lastLogin: '2024-01-25',
        createdAt: '2024-01-01',
        coursesCount: 3
      },
      {
        id: '2',
        name: 'Juan Dela Cruz',
        email: 'juan@example.com',
        role: 'TEACHER',
        status: 'active',
        lastLogin: '2024-01-25',
        createdAt: '2024-01-05',
        coursesCount: 2,
        studentsCount: 45
      },
      {
        id: '3',
        name: 'Ana Rodriguez',
        email: 'ana@example.com',
        role: 'ADMIN',
        status: 'active',
        lastLogin: '2024-01-25',
        createdAt: '2024-01-10',
        coursesCount: 0
      },
      {
        id: '4',
        name: 'Carlos Mendoza',
        email: 'carlos@example.com',
        role: 'STUDENT',
        status: 'inactive',
        lastLogin: '2024-01-20',
        createdAt: '2024-01-15',
        coursesCount: 1
      }
    ]

    // Mock system stats
    const mockStats: SystemStats = {
      totalUsers: mockUsers.length,
      totalCourses: 15,
      totalStudents: 120,
      totalTeachers: 8,
      activeUsers: mockUsers.filter(u => u.status === 'active').length,
      systemHealth: 'excellent'
    }

    setUsers(mockUsers)
    setStats(mockStats)
  }

  // Navigation functions for stats cards
  const navigateToUsers = () => {
    setActiveTab('users')
  }

  const navigateToCourses = () => {
    // For admin, this could navigate to a course management page
    // For now, we'll show a message or could implement course management
    setActiveTab('overview')
  }

  const navigateToActiveUsers = () => {
    setActiveTab('users')
    // You could add a filter for active users here
  }

  const navigateToSystemHealth = () => {
    setActiveTab('system')
  }

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return <Crown className="w-4 h-4 text-purple-600" />
      case 'ADMIN': return <Shield className="w-4 h-4 text-blue-600" />
      case 'TEACHER': return <GraduationCap className="w-4 h-4 text-green-600" />
      case 'STUDENT': return <Users className="w-4 h-4 text-gray-600" />
      default: return <Users className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return 'bg-purple-100 text-purple-800'
      case 'ADMIN': return 'bg-blue-100 text-blue-800'
      case 'TEACHER': return 'bg-green-100 text-green-800'
      case 'STUDENT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const canManageUsers = canAccess('users', 'edit')
  const canDeleteUsers = canAccess('users', 'delete')
  const canViewSystem = canAccess('system', 'view')

  const handleUserCreated = (newUser: SystemUser) => {
    // Add the new user to the users list
    setUsers(prevUsers => [newUser, ...prevUsers])
    
    // Update stats
    setStats(prevStats => ({
      ...prevStats,
      totalUsers: prevStats.totalUsers + 1,
      activeUsers: prevStats.activeUsers + 1,
      totalStudents: newUser.role === 'STUDENT' ? prevStats.totalStudents + 1 : prevStats.totalStudents,
      totalTeachers: newUser.role === 'TEACHER' ? prevStats.totalTeachers + 1 : prevStats.totalTeachers
    }))
  }

  // User action handlers
  const handleViewUser = (user: SystemUser) => {
    setSelectedUser(user)
    setIsViewUserModalOpen(true)
  }

  const handleEditUser = (user: SystemUser) => {
    setSelectedUser(user)
    setIsEditUserModalOpen(true)
  }

  const handleDeleteUser = (user: SystemUser) => {
    setSelectedUser(user)
    setIsDeleteUserModalOpen(true)
  }

  const handleUserDeleted = (userId: string) => {
    // Remove the user from the users list
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
    
    // Update stats
    if (selectedUser) {
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: prevStats.totalUsers - 1,
        activeUsers: selectedUser.status === 'active' ? prevStats.activeUsers - 1 : prevStats.activeUsers,
        totalStudents: selectedUser.role === 'STUDENT' ? prevStats.totalStudents - 1 : prevStats.totalStudents,
        totalTeachers: selectedUser.role === 'TEACHER' ? prevStats.totalTeachers - 1 : prevStats.totalTeachers
      }))
    }
    
    setIsDeleteUserModalOpen(false)
    setSelectedUser(null)
  }

  const handleUserUpdated = (updatedUser: SystemUser) => {
    // Update the user in the users list
    setUsers(prevUsers => prevUsers.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ))
    
    // Update stats if role or status changed
    if (selectedUser) {
      const roleChanged = selectedUser.role !== updatedUser.role
      const statusChanged = selectedUser.status !== updatedUser.status
      
      if (roleChanged || statusChanged) {
        setStats(prevStats => {
          let newStats = { ...prevStats }
          
          // Handle role changes
          if (roleChanged) {
            if (selectedUser.role === 'STUDENT') newStats.totalStudents--
            if (selectedUser.role === 'TEACHER') newStats.totalTeachers--
            if (updatedUser.role === 'STUDENT') newStats.totalStudents++
            if (updatedUser.role === 'TEACHER') newStats.totalTeachers++
          }
          
          // Handle status changes
          if (statusChanged) {
            if (selectedUser.status === 'active') newStats.activeUsers--
            if (updatedUser.status === 'active') newStats.activeUsers++
          }
          
          return newStats
        })
      }
    }
    
    setIsEditUserModalOpen(false)
    setSelectedUser(null)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setRoleFilter('all')
    setStatusFilter('all')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('admin.dashboard.title') || 'Admin Dashboard'}
          </h1>
          <p className="text-gray-600">
            {t('admin.dashboard.subtitle') || 'System administration and user management'}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: t('admin.dashboard.tabs.overview') || 'Overview', icon: BarChart3 },
              { id: 'users', label: t('admin.dashboard.tabs.users') || 'Users', icon: Users },
              { id: 'system', label: t('admin.dashboard.tabs.system') || 'System', icon: Settings },
              { id: 'analytics', label: t('admin.dashboard.tabs.analytics') || 'Analytics', icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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
              {/* Total Users Card */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={navigateToUsers}
                className="bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t('admin.dashboard.stats.totalUsers') || 'Total Users'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs text-blue-600 font-medium">
                    {t('admin.dashboard.stats.clickToViewUsers') || 'Click to view users'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>

              {/* Total Courses Card */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={navigateToCourses}
                className="bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-green-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t('admin.dashboard.stats.totalCourses') || 'Total Courses'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs text-green-600 font-medium">
                    {t('admin.dashboard.stats.clickToViewCourses') || 'Click to view courses'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>

              {/* Active Users Card */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={navigateToActiveUsers}
                className="bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-yellow-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t('admin.dashboard.stats.activeUsers') || 'Active Users'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                    <UserCheck className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs text-yellow-600 font-medium">
                    {t('admin.dashboard.stats.clickToViewActiveUsers') || 'Click to view active users'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-yellow-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>

              {/* System Health Card */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={navigateToSystemHealth}
                className="bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-purple-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t('admin.dashboard.stats.systemHealth') || 'System Health'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{stats.systemHealth}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs text-purple-600 font-medium">
                    {t('admin.dashboard.stats.clickToViewSystem') || 'Click to view system'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('admin.dashboard.systemHealth.title') || 'System Health'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getHealthColor(stats.systemHealth)}`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {t('admin.dashboard.systemHealth.status') || 'Status'}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">{stats.systemHealth}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {t('admin.dashboard.systemHealth.teachers') || 'Teachers'}
                      </p>
                      <p className="text-sm text-gray-600">{stats.totalTeachers}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {t('admin.dashboard.systemHealth.students') || 'Students'}
                      </p>
                      <p className="text-sm text-gray-600">{stats.totalStudents}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* User Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('admin.dashboard.users.title') || 'User Management'}
              </h2>
              {canManageUsers && (
                <button 
                  onClick={() => setIsCreateUserModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('admin.dashboard.users.create') || 'Create User'}</span>
                </button>
              )}
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.search') || 'Search Users'}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('admin.dashboard.users.searchPlaceholder') || 'Search by name or email...'}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.filterByRole') || 'Filter by Role'}
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">{t('admin.dashboard.users.allRoles') || 'All Roles'}</option>
                    <option value="STUDENT">{t('admin.dashboard.users.roleStudent') || 'Student'}</option>
                    <option value="TEACHER">{t('admin.dashboard.users.roleTeacher') || 'Teacher'}</option>
                    <option value="ADMIN">{t('admin.dashboard.users.roleAdmin') || 'Admin'}</option>
                    {currentUser?.role === 'SUPERADMIN' && (
                      <option value="SUPERADMIN">{t('admin.dashboard.users.roleSuperAdmin') || 'SuperAdmin'}</option>
                    )}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.dashboard.users.filterByStatus') || 'Filter by Status'}
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">{t('admin.dashboard.users.allStatuses') || 'All Statuses'}</option>
                    <option value="active">{t('admin.dashboard.users.statusActive') || 'Active'}</option>
                    <option value="inactive">{t('admin.dashboard.users.statusInactive') || 'Inactive'}</option>
                    <option value="suspended">{t('admin.dashboard.users.statusSuspended') || 'Suspended'}</option>
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {t('admin.dashboard.users.showingResults') || 'Showing'} <span className="font-medium">{filteredUsers.length}</span> {t('admin.dashboard.users.of') || 'of'} <span className="font-medium">{users.length}</span> {t('admin.dashboard.users.users') || 'users'}
                </div>
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {t('admin.dashboard.users.clearFilters') || 'Clear Filters'}
                </button>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.dashboard.users.user') || 'User'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.dashboard.users.role') || 'Role'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.dashboard.users.status') || 'Status'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.dashboard.users.lastLogin') || 'Last Login'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.dashboard.users.actions') || 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((systemUser) => (
                      <tr key={systemUser.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {systemUser.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{systemUser.name}</div>
                              <div className="text-sm text-gray-500">{systemUser.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(systemUser.role)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(systemUser.role)}`}>
                              {systemUser.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(systemUser.status)}`}>
                            {systemUser.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {systemUser.lastLogin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewUser(systemUser)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              title={t('admin.dashboard.users.actions.view') || 'View User'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canManageUsers && (
                              <button 
                                onClick={() => handleEditUser(systemUser)}
                                className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors"
                                title={t('admin.dashboard.users.actions.edit') || 'Edit User'}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {canDeleteUsers && (
                              <button 
                                onClick={() => handleDeleteUser(systemUser)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                title={t('admin.dashboard.users.actions.delete') || 'Delete User'}
                              >
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

        {activeTab === 'system' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {canViewSystem ? (
              <>
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('admin.dashboard.system.title') || 'System Configuration'}
                </h2>
                
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <p className="text-gray-600">
                    {t('admin.dashboard.system.comingSoon') || 'System configuration options coming soon!'}
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Shield className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      {t('admin.dashboard.system.accessDenied') || 'Access Denied'}
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        {t('admin.dashboard.system.insufficientPermissions') || 'You do not have sufficient permissions to view system configuration.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              {t('admin.dashboard.analytics.title') || 'Analytics'}
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <p className="text-gray-600">
                {t('admin.dashboard.analytics.comingSoon') || 'Detailed analytics and reporting features coming soon!'}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      {/* View User Modal */}
      <ViewUserModal
        isOpen={isViewUserModalOpen}
        onClose={() => setIsViewUserModalOpen(false)}
        user={selectedUser}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={isDeleteUserModalOpen}
        onClose={() => setIsDeleteUserModalOpen(false)}
        onConfirm={handleUserDeleted}
        user={selectedUser}
      />
    </div>
  )
}
