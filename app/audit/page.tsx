'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores'
import { 
  Search, 
  Filter, 
  Download, 
  Activity, 
  Calendar,
  User,
  Shield,
  Eye,
  Clock,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/Button'



export default function AuditPage() {
  const { user, actionLogs, getUserActionLogs } = useAuthStore()
  
  // Debug logging
  console.log('🔍 AUDIT PAGE - Action Logs:', actionLogs)
  console.log('🔍 AUDIT PAGE - User:', user)
  
  const [filteredLogs, setFilteredLogs] = useState(actionLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [dateRange, setDateRange] = useState('all')


  // Update filtered logs when actionLogs change
  useEffect(() => {
    setFilteredLogs(actionLogs)
  }, [actionLogs])

  useEffect(() => {
    let logs = actionLogs

    // Apply search filter
    if (searchTerm) {
      logs = logs.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply action filter
    if (selectedAction) {
      logs = logs.filter(log => log.action === selectedAction)
    }

    // Apply user filter
    if (selectedUser) {
      logs = logs.filter(log => log.userId === selectedUser)
    }

    // Apply date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      logs = logs.filter(log => new Date(log.timestamp) >= cutoffDate)
    }

    setFilteredLogs(logs)
  }, [actionLogs, searchTerm, selectedAction, selectedUser, dateRange])

  // Get unique actions and users for filters
  const uniqueActions = Array.from(new Set(actionLogs.map(log => log.action)))
  const uniqueUsers = Array.from(new Set(actionLogs.map(log => log.userId)))

  // Calculate statistics
  const totalActions = actionLogs.length
  const todayActions = actionLogs.filter(log => {
    const today = new Date()
    const logDate = new Date(log.timestamp)
    return logDate.toDateString() === today.toDateString()
  }).length
  
  const securityActions = actionLogs.filter(log => 
    ['LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'DEMO_USER_CREATED'].includes(log.action)
  ).length
  
  const uniqueUsersCount = uniqueUsers.length

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting timestamp:', error)
      // Fallback to simple format if there's an error
      const date = new Date(timestamp)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'LOGOUT':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'REGISTER':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'PASSWORD_CHANGE':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'DEMO_USER_CREATED':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return <CheckCircle className="w-4 h-4" />
      case 'LOGOUT':
        return <XCircle className="w-4 h-4" />
      case 'REGISTER':
        return <User className="w-4 h-4" />
      case 'PASSWORD_CHANGE':
        return <Shield className="w-4 h-4" />
      case 'DEMO_USER_CREATED':
        return <User className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User ID', 'Action', 'Details'],
      ...filteredLogs.map(log => [
        formatTimestamp(log.timestamp),
        log.userId,
        log.action,
        log.details
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }









  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-4">Please sign in to view audit logs</p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                Audit & Security Logs
              </h1>
              <p className="text-gray-600 mt-2">Monitor user activities and security events</p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="outline"
                className="flex items-center"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Statistics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Actions</p>
                <p className="text-2xl font-bold text-gray-900">{totalActions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Actions</p>
                <p className="text-2xl font-bold text-gray-900">{todayActions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Security Events</p>
 <p className="text-2xl font-bold text-gray-900">{securityActions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueUsersCount}</p>
              </div>
            </div>
          </div>
        </motion.div>



        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border mb-6"
        >
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Filters & Search
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search actions, details, or users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Filter */}
              <div>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Actions</option>
                  {uniqueActions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>

              {/* User Filter */}
              <div>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Users</option>
                  {uniqueUsers.map(userId => (
                    <option key={userId} value={userId}>{userId}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredLogs.length} of {actionLogs.length} actions
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  onClick={exportLogs} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </motion.div>



        {/* Debug Section - Remove in production */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6"
        >
          <h3 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Debug Info (Remove in production)
          </h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <p>Total Action Logs: {actionLogs.length}</p>
            <p>Current User: {user?.email || 'None'}</p>
            <p>User ID: {user?.id || 'None'}</p>
            <p>Action Logs Data: {JSON.stringify(actionLogs, null, 2)}</p>
          </div>
        </motion.div>

        {/* Action Logs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border overflow-hidden"
        >
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-blue-600" />
              Activity Logs
            </h2>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No actions found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later for new activity.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                          <span className="ml-1">{log.action}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.userId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {log.details}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
