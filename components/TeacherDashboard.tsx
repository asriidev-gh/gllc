'use client'

import React, { useState, useMemo, useEffect, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type ColumnFiltersState,
} from '@tanstack/react-table'
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
  ArrowRight,
  X,
  ListOrdered,
  PlayCircle,
  FileText,
  AlertTriangle,
  UserCog,
  Shield,
  Crown,
  Lock
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useCoursesStore } from '@/stores/coursesStore'
import { useUserStore } from '@/stores/userStore'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { CreateCourseModal } from './CreateCourseModal'
import type { Course as StoreCourse } from '@/stores/coursesStore'

interface Course {
  id: string
  title: string
  level: string
  students: number
  instructor: string
  status: 'active' | 'draft' | 'inactive' | 'archived'
  price: number
  /** Currency code when price > 0 (e.g. USD, PHP) */
  currency?: string
  createdAt: string
  tags: string[]
}

type CourseColumnDef = ColumnDef<Course>[]

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', AUD: 'A$', CAD: 'C$',
  CHF: 'Fr', CNY: '¥', MXN: 'MX$', PHP: '₱'
}

function formatPrice(price: number, currencyCode?: string): string {
  if (price == null || price <= 0) return 'Free'
  const symbol = (currencyCode && CURRENCY_SYMBOLS[currencyCode]) || '$'
  return `${symbol}${Number(price).toFixed(2)}`
}

interface Student {
  id: string
  name: string
  email: string
  enrolledCourses: number
  memberSince: string
  lastActive: string
  membership?: string
}

const MEMBERSHIP_OPTIONS: { value: string; labelKey: string }[] = [
  { value: 'new - no membership', labelKey: 'admin.students.membership.nonMember' },
  { value: 'premium member', labelKey: 'admin.students.membership.premiumMember' },
  { value: 'vip member', labelKey: 'admin.students.membership.vipMember' }
]

export const TeacherDashboard: React.FC = () => {
  const { t } = useLanguage()
  const { user, hasPermission, registeredUsers, setUserPassword, updateUserStatusAndRemarks, createUserAsAdmin, updateUserRole, updateUserMembership, syncRegisteredUsersFromStorage } = useAuthStore()
  const { courses: storeCourses, addCourse, deleteCourse, updateCourse, enrollments } = useCoursesStore()
  const profilesByUserId = useUserStore((s) => s.profilesByUserId)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students' | 'analytics' | 'users'>('overview')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'draft' | 'inactive'>('all')
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null)
  const [editingStatusCourseId, setEditingStatusCourseId] = useState<string | null>(null)
  const [studentsFilterByCourseId, setStudentsFilterByCourseId] = useState<string | null>(null)
  const [coursesFilterByStudentId, setCoursesFilterByStudentId] = useState<string | null>(null)
  const [studentsFilterByTeacherId, setStudentsFilterByTeacherId] = useState<string | null>(null)
  const [studentsMembershipFilter, setStudentsMembershipFilter] = useState<string>('all')
  const [studentsSearchQuery, setStudentsSearchQuery] = useState('')
  const [showPaymentProofModal, setShowPaymentProofModal] = useState(false)
  const [paymentProofDataUrl, setPaymentProofDataUrl] = useState<string | null>(null)

  const isProofImage = (dataUrl: string) => /^data:image\//i.test(dataUrl)
  const isProofPdf = (dataUrl: string) => /^data:application\/pdf/i.test(dataUrl)
  const getPaymentStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  // Normalize stored status (persisted courses may have been saved before status existed, or with different casing)
  const normalizeStatus = (s: unknown): Course['status'] => {
    if (s === 'draft' || s === 'active' || s === 'inactive' || s === 'archived') return s
    const lower = typeof s === 'string' ? s.toLowerCase() : ''
    if (lower === 'draft' || lower === 'active' || lower === 'inactive' || lower === 'archived') return lower as Course['status']
    return 'active'
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'

  // When admin opens Students tab, ensure we have latest from persisted storage (rehydration can lag)
  useEffect(() => {
    if (isAdmin && activeTab === 'students' && typeof window !== 'undefined') {
      syncRegisteredUsersFromStorage()
    }
  }, [isAdmin, activeTab, syncRegisteredUsersFromStorage])

  // For teachers: only courses they created (instructorId === user.id, or legacy: instructor name matches). For admin: all courses.
  const coursesForCurrentUser = useMemo(() => {
    if (isAdmin) return storeCourses
    const uid = user?.id
    const teacherName = (user?.name ?? '').trim().toLowerCase()
    if (!uid && !teacherName) return []
    return storeCourses.filter((c) => {
      if (c.instructorId) return c.instructorId === uid
      // Legacy courses without instructorId: match by instructor name
      const inv = (c.instructor ?? '').trim().toLowerCase()
      return inv === teacherName
    })
  }, [storeCourses, user?.id, user?.name, isAdmin])

  // Teacher's course IDs: used for student filtering (only students enrolled in this teacher's courses)
  const teacherCourseIds = useMemo(
    () => coursesForCurrentUser.map((c) => c.id),
    [coursesForCurrentUser]
  )

  // Map store courses to dashboard Course shape; students count from enrollments
  const courses: Course[] = useMemo(() => {
    const enrollmentCountByCourseId: Record<string, number> = {}
    ;(enrollments || []).forEach((e) => {
      enrollmentCountByCourseId[e.courseId] = (enrollmentCountByCourseId[e.courseId] ?? 0) + 1
    })
    return coursesForCurrentUser.map(c => ({
      id: c.id,
      title: c.title,
      level: c.level ? c.level.charAt(0) + c.level.slice(1).toLowerCase() : '—',
      students: enrollmentCountByCourseId[c.id] ?? c.students ?? 0,
      instructor: c.instructor ?? '—',
      status: normalizeStatus(c.status),
      price: c.price ?? 0,
      currency: c.currency,
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
      tags: Array.isArray(c.category) ? c.category : []
    }))
  }, [coursesForCurrentUser, enrollments])

  // Students: admin = all registered students; teacher = anyone enrolled in their courses (from enrollments + registeredUsers)
  const students: Student[] = useMemo(() => {
    const enrollmentsInScope = isAdmin
      ? (enrollments || [])
      : (enrollments || []).filter((e) => teacherCourseIds.includes(e.courseId))
    const enrolledUserIds = Array.from(new Set(enrollmentsInScope.map((e) => e.userId)))
    const userById = new Map((registeredUsers || []).map((u) => [u.id, u]))
    let list: Array<{ id: string; name: string; email: string; createdAt?: string; membership?: string }>
    if (isAdmin) {
      list = (registeredUsers || [])
        .filter((u) => u.role === 'STUDENT')
        .map((u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt, membership: u.membership }))
    } else {
      list = []
      for (const uid of enrolledUserIds) {
        const u = userById.get(uid)
        if (u && u.role === 'STUDENT') {
          list.push({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt, membership: u.membership })
        } else if (!list.some((x) => x.id === uid)) {
          list.push({ id: uid, name: 'Unknown', email: '—' })
        }
      }
    }
    return list.map((u) => {
      const userEnrollments = enrollmentsInScope.filter((e) => e.userId === u.id)
      const enrolledCourses = userEnrollments.length
      const lastAccessed = userEnrollments
        .map((e) => e.lastAccessedAt)
        .filter(Boolean)
        .sort()
        .pop()
      const lastActive = lastAccessed
        ? new Date(lastAccessed).toISOString().split('T')[0]
        : u.createdAt
        ? new Date(u.createdAt).toISOString().split('T')[0]
        : '—'
      const memberSince = u.createdAt
        ? new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : '—'
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        enrolledCourses,
        memberSince,
        lastActive,
        membership: u.membership ?? 'new - no membership',
      }
    })
  }, [registeredUsers, enrollments, teacherCourseIds, isAdmin])

  // When viewing Students tab with a course filter, show only students enrolled in that course
  const enrollmentsInScopeForFilter = useMemo(
    () =>
      isAdmin ? (enrollments || []) : (enrollments || []).filter((e) => teacherCourseIds.includes(e.courseId)),
    [enrollments, teacherCourseIds, isAdmin]
  )
  const filteredStudents = useMemo(() => {
    let out = students
    if (studentsFilterByCourseId) {
      out = out.filter((s) =>
        enrollmentsInScopeForFilter.some(
          (e) => e.userId === s.id && e.courseId === studentsFilterByCourseId
        )
      )
    } else if (studentsFilterByTeacherId) {
      const teacher = (registeredUsers || []).find((u) => u.id === studentsFilterByTeacherId)
      const teacherName = (teacher?.name ?? '').trim().toLowerCase()
      const teacherCourseIds = new Set(
        storeCourses
          .filter((c) => (c.instructor ?? '').trim().toLowerCase() === teacherName)
          .map((c) => c.id)
      )
      const enrolledUserIds = new Set(
        (enrollments || []).filter((e) => teacherCourseIds.has(e.courseId)).map((e) => e.userId)
      )
      out = out.filter((s) => enrolledUserIds.has(s.id))
    }
    if (studentsMembershipFilter !== 'all') {
      out = out.filter((s) => (s.membership ?? 'new - no membership') === studentsMembershipFilter)
    }
    if (studentsSearchQuery.trim()) {
      const q = studentsSearchQuery.trim().toLowerCase()
      out = out.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
      )
    }
    return out
  }, [students, studentsFilterByCourseId, studentsFilterByTeacherId, studentsMembershipFilter, studentsSearchQuery, enrollmentsInScopeForFilter, registeredUsers, storeCourses, enrollments])

  const membershipCounts = useMemo(() => {
    const nonMember = students.filter((s) => (s.membership ?? 'new - no membership') === 'new - no membership').length
    const premium = students.filter((s) => (s.membership ?? '') === 'premium member').length
    const vip = students.filter((s) => (s.membership ?? '') === 'vip member').length
    return { nonMember, premium, vip }
  }, [students])

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

  const handleCourseCreated = (newCourse: { id: string; title: string; subject: string; level: string; description?: string; status: string; students: number; progress: number; createdAt: string }) => {
    addCourse({
      id: newCourse.id,
      title: newCourse.title,
      description: newCourse.description ?? '',
      subject: newCourse.subject,
      level: (newCourse.level.toUpperCase() as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'),
      duration: '',
      lessons: 0,
      instructor: user?.name ?? 'Instructor',
      price: 0,
      category: [],
      createdAt: newCourse.createdAt,
      updatedAt: new Date().toISOString(),
      students: newCourse.students ?? 0,
      rating: 0,
      features: [],
      status: (newCourse.status === 'archived' ? 'archived' : newCourse.status === 'active' ? 'active' : newCourse.status === 'draft' ? 'draft' : 'inactive') as 'active' | 'draft' | 'inactive' | 'archived'
    })
    setActiveTab('courses')
    setActiveFilter('all')
  }

  // Filtered courses for the table (depends on activeFilter so table updates when filter changes)
  const filteredCourses = useMemo(() => {
    if (activeFilter === 'all') return courses
    if (activeFilter === 'inactive') return courses.filter(c => c.status === 'inactive' || c.status === 'archived')
    return courses.filter(course => course.status === activeFilter)
  }, [courses, activeFilter])

  // When viewing Courses tab with a student filter, show only courses that student is enrolled in
  const coursesForTable = useMemo(() => {
    if (!coursesFilterByStudentId) return filteredCourses
    const enrolledCourseIds = new Set(
      (enrollments || []).filter((e) => e.userId === coursesFilterByStudentId).map((e) => e.courseId)
    )
    return filteredCourses.filter((c) => enrolledCourseIds.has(c.id))
  }, [filteredCourses, coursesFilterByStudentId, enrollments])

  const canCreateCourse = hasPermission('create_courses')
  const canEditCourse = hasPermission('edit_courses')
  const canDeleteCourse = hasPermission('delete_courses')

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const coursesColumns = useMemo(() => ([
    {
      id: 'title',
      accessorKey: 'title',
      header: () => (t('teacher.dashboard.courses.course') || 'Course'),
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => openCourseDetails(row.original.id)}
          className="text-left hover:opacity-80 transition-opacity"
        >
          <div className="text-sm font-medium text-gray-900 dark:text-white">{row.original.title}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{row.original.level}</div>
        </button>
      ),
      filterFn: 'includesString',
    },
    {
      id: 'students',
      accessorKey: 'students',
      header: () => (t('teacher.dashboard.courses.students') || 'Students'),
      cell: ({ row, getValue }) => {
        const count = getValue() as number
        const courseId = row.original.id
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setStudentsFilterByCourseId(courseId)
              setActiveTab('students')
            }}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
            title={t('teacher.dashboard.courses.viewStudentsForCourse') || 'View students for this course'}
          >
            {count}
          </button>
        )
      },
    },
    {
      id: 'instructor',
      accessorKey: 'instructor',
      header: () => (t('teacher.dashboard.courses.instructor') || 'Instructor'),
      cell: ({ getValue }) => <span className="text-sm text-gray-900 dark:text-gray-100">{getValue() as string}</span>,
      filterFn: 'includesString',
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: () => (t('teacher.dashboard.courses.status') || 'Status'),
      cell: ({ row }) => {
        const course = row.original
        return (
          <div className="inline-flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            {editingStatusCourseId === course.id ? (
              <select
                autoFocus
                value={course.status}
                onChange={(e) => {
                  const newStatus = e.target.value as Course['status']
                  updateCourse(course.id, { status: newStatus })
                  setEditingStatusCourseId(null)
                }}
                onBlur={() => setEditingStatusCourseId(null)}
                className="text-xs font-medium rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-1.5 pl-2 pr-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">{t('teacher.dashboard.filters.active') || 'Active'}</option>
                <option value="draft">{t('teacher.dashboard.filters.draft') || 'Draft'}</option>
                <option value="inactive">{t('teacher.dashboard.filters.inactive') || 'Inactive'}</option>
                <option value="archived">{t('teacher.dashboard.filters.archived') || 'Archived'}</option>
              </select>
            ) : (
              <button
                type="button"
                onClick={() => canEditCourse && setEditingStatusCourseId(course.id)}
                className="inline-flex items-center gap-1.5 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                title={canEditCourse ? (t('teacher.dashboard.courses.editStatus') || 'Edit status') : undefined}
              >
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                  {course.status}
                </span>
                {canEditCourse && <Edit className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0" />}
              </button>
            )}
          </div>
        )
      },
      filterFn: 'equalsString',
    },
    {
      id: 'price',
      accessorKey: 'price',
      header: () => (t('teacher.dashboard.courses.price') || 'Price'),
      cell: ({ row }) => {
        const p = row.original.price
        const currency = row.original.currency
        return (
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatPrice(p, currency)}
          </span>
        )
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: () => (t('teacher.dashboard.courses.createdAt') || 'Created at'),
      cell: ({ getValue }) => <span className="text-sm text-gray-900 dark:text-gray-100">{(getValue() as string) || '—'}</span>,
    },
    {
      id: 'tags',
      accessorKey: 'tags',
      header: () => (t('teacher.dashboard.courses.tags') || 'Tags'),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {row.original.tags.length > 0 ? (
            row.original.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-gray-400 dark:text-gray-500">—</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => (t('teacher.dashboard.courses.actions') || 'Actions'),
      cell: ({ row }) => {
        const course = row.original
        return (
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => router.push(`/courses/${course.id}`)}
              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
              title={t('teacher.dashboard.courses.preview') || 'Preview'}
            >
              <PlayCircle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => openCourseDetails(course.id)}
              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
              title={t('teacher.dashboard.courses.viewDetails') || 'View details'}
            >
              <Eye className="w-4 h-4" />
            </button>
            {canEditCourse && (
              <button
                type="button"
                onClick={() => router.push(`/courses/create?edit=${course.id}`)}
                className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                title={t('teacher.dashboard.courses.editCourse') || 'Edit course'}
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {canDeleteCourse && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setCourseToDelete({ id: course.id, title: course.title }) }}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                title={t('teacher.dashboard.courses.deleteCourse') || 'Delete course'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )
      },
    },
  ] as CourseColumnDef), [t, canEditCourse, canDeleteCourse, editingStatusCourseId, updateCourse])

  const coursesTable = useReactTable({
    data: coursesForTable,
    columns: coursesColumns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const selectedCourse: StoreCourse | undefined = selectedCourseId
    ? storeCourses.find(c => c.id === selectedCourseId)
    : undefined

  const openCourseDetails = (courseId: string) => {
    setSelectedCourseId(courseId)
  }

  const closeCourseDetails = () => {
    setSelectedCourseId(null)
  }

  const handleConfirmDeleteCourse = () => {
    if (!courseToDelete) return
    deleteCourse(courseToDelete.id)
    if (selectedCourseId === courseToDelete.id) {
      setSelectedCourseId(null)
    }
    setCourseToDelete(null)
  }

  // Reset filter when switching tabs
  const handleTabChange = (tab: 'overview' | 'courses' | 'students' | 'analytics' | 'users') => {
    setActiveTab(tab)
    if (tab !== 'courses') {
      setActiveFilter('all')
    }
  }

  // Users list (all registered users) for admin/superadmin – filter by role, name, email
  const [usersRoleFilter, setUsersRoleFilter] = useState<'all' | 'ADMIN' | 'SUPERADMIN' | 'TEACHER' | 'STUDENT'>('all')
  const [usersNameFilter, setUsersNameFilter] = useState('')
  const [usersEmailFilter, setUsersEmailFilter] = useState('')
  const [usersStatusFilter, setUsersStatusFilter] = useState<'all' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED'>('all')
  const [userToChangePassword, setUserToChangePassword] = useState<{ id: string; name: string } | null>(null)
  const [userToEditInfo, setUserToEditInfo] = useState<{ id: string; name: string; status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'; remarks: string } | null>(null)
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false)
  const [createUserName, setCreateUserName] = useState('')
  const [createUserEmail, setCreateUserEmail] = useState('')
  const [createUserPassword, setCreateUserPassword] = useState('')
  const [createUserConfirm, setCreateUserConfirm] = useState('')
  const [createUserRole, setCreateUserRole] = useState<'ADMIN' | 'TEACHER' | 'STUDENT'>('STUDENT')
  const [createUserError, setCreateUserError] = useState('')
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [editingRoleUserId, setEditingRoleUserId] = useState<string | null>(null)
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null)
  const [changePasswordNew, setChangePasswordNew] = useState('')
  const [changePasswordConfirm, setChangePasswordConfirm] = useState('')
  const [changePasswordError, setChangePasswordError] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const allUsers = useMemo(() => registeredUsers || [], [registeredUsers])

  // Admin must not see Super Admin filter; reset if they had it selected
  useEffect(() => {
    if (user?.role === 'ADMIN' && usersRoleFilter === 'SUPERADMIN') {
      setUsersRoleFilter('all')
    }
  }, [user?.role, usersRoleFilter])

  const filteredUsers = useMemo(() => {
    let list = allUsers
    if (usersRoleFilter !== 'all') {
      list = list.filter((u) => u.role === usersRoleFilter)
    }
    if (usersStatusFilter !== 'all') {
      list = list.filter((u) => (u.status || 'ACTIVE') === usersStatusFilter)
    }
    const nameLower = usersNameFilter.trim().toLowerCase()
    if (nameLower) {
      list = list.filter((u) => (u.name || '').toLowerCase().includes(nameLower))
    }
    const emailLower = usersEmailFilter.trim().toLowerCase()
    if (emailLower) {
      list = list.filter((u) => (u.email || '').toLowerCase().includes(emailLower))
    }
    return list
  }, [allUsers, usersRoleFilter, usersStatusFilter, usersNameFilter, usersEmailFilter])

  // Per-teacher: count of distinct students enrolled in courses taught by that teacher (instructor name match)
  const studentCountByTeacherId = useMemo(() => {
    const out: Record<string, number> = {}
    const teachers = allUsers.filter((u) => u.role === 'TEACHER')
    for (const t of teachers) {
      const teacherName = (t.name ?? '').trim().toLowerCase()
      const courseIds = new Set(
        storeCourses.filter((c) => (c.instructor ?? '').trim().toLowerCase() === teacherName).map((c) => c.id)
      )
      const userIds = new Set(
        (enrollments || []).filter((e) => courseIds.has(e.courseId)).map((e) => e.userId)
      )
      out[t.id] = userIds.size
    }
    return out
  }, [allUsers, storeCourses, enrollments])

  // Per-student: count of enrolled courses
  const enrolledCoursesCountByStudentId = useMemo(() => {
    const out: Record<string, number> = {}
    ;(enrollments || []).forEach((e) => {
      out[e.userId] = (out[e.userId] ?? 0) + 1
    })
    return out
  }, [enrollments])

  const formatDateTime = (iso: string | null | undefined) => {
    if (!iso) return '—'
    try {
      const d = new Date(iso)
      return isNaN(d.getTime()) ? '—' : d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    } catch {
      return '—'
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'inactive': case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const dashboardContent = (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isAdmin ? (t('admin.dashboard.title') || 'Admin Dashboard') : (t('teacher.dashboard.title') || 'Teacher Dashboard')}
          </h1>
          <p className="text-gray-600">
            {isAdmin ? (t('admin.dashboard.subtitle') || 'System overview, courses, and all students') : (t('teacher.dashboard.subtitle') || 'Manage your courses and monitor student progress')}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: t('teacher.dashboard.tabs.overview') || 'Overview', icon: BarChart3 },
              { id: 'courses', label: t('teacher.dashboard.tabs.courses') || 'Courses', icon: BookOpen },
              { id: 'students', label: t('teacher.dashboard.tabs.students') || 'Students', icon: Users },
              ...(isAdmin ? [{ id: 'users' as const, label: t('admin.dashboard.tabs.users') || 'Users', icon: UserCog }] : []),
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
                  {isAdmin && tab.id === 'students' && membershipCounts.nonMember > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200" title={t('admin.students.nonMemberCountTitle') || 'Non-members needing attention'}>
                      {membershipCounts.nonMember}
                    </span>
                  )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                      {students.length}
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
                      {t('teacher.dashboard.stats.activeCourses') || 'Active Courses'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {courses.length ? courses.filter(c => c.status === 'active').length : 0}
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

              {/* Total Enrollments Card */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={navigateToStudents}
                className="bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-indigo-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t('teacher.dashboard.stats.totalEnrollments') || 'Total Enrollments'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {courses.reduce((sum, course) => sum + course.students, 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <Clock className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs text-indigo-600 font-medium">
                    {t('teacher.dashboard.stats.clickToViewStudents') || 'Click to view students'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
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
                          {course.students} {t('teacher.dashboard.students') || 'students'} • {course.instructor}
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
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('teacher.dashboard.courses.title') || 'My Courses'}
              </h2>
              {coursesFilterByStudentId && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('teacher.dashboard.courses.filteredByStudent') || 'Showing courses for'}:{' '}
                    <strong className="text-gray-900 dark:text-white">
                      {students.find((s) => s.id === coursesFilterByStudentId)?.name ?? coursesFilterByStudentId}
                    </strong>
                    {' '}({coursesForTable.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setCoursesFilterByStudentId(null)}
                    className="text-sm px-2 py-1 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t('teacher.dashboard.courses.clearFilter') || 'Clear filter'}
                  </button>
                </div>
              )}
              {canCreateCourse && (
                <button 
                  onClick={() => {
                    // Prefer dedicated create page for future-proofing
                    try {
                      // Use router to navigate to create wizard
                      router.push('/courses/create')
                    } catch {
                      setIsCreateCourseModalOpen(true)
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('teacher.dashboard.courses.create') || 'Create Course'}</span>
                </button>
              )}
            </div>

            {/* Course Filters */}
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'all' as const, label: t('teacher.dashboard.filters.allCourses') || 'All Courses', count: courses.length },
                { key: 'active' as const, label: t('teacher.dashboard.filters.active') || 'Active', count: courses.filter(c => c.status === 'active').length },
                { key: 'draft' as const, label: t('teacher.dashboard.filters.draft') || 'Draft', count: courses.filter(c => c.status === 'draft').length },
                { key: 'inactive' as const, label: t('teacher.dashboard.filters.inactive') || 'Inactive', count: courses.filter(c => c.status === 'inactive' || c.status === 'archived').length }
              ] as const).map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeFilter === filter.key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Courses List (TanStack Table with header filters) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    {/* Header row */}
                    <tr>
                      {coursesTable.getHeaderGroups()[0]?.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                    {/* Filter row */}
                    <tr className="bg-gray-100/80 dark:bg-gray-700/50">
                      {coursesTable.getHeaderGroups()[0]?.headers.map((header) => {
                        const colId = header.column.id
                        const col = header.column
                        const filterValue = col.getFilterValue() as string | undefined
                        return (
                          <th key={header.id} className="px-4 py-2">
                            {colId === 'title' && (
                              <input
                                type="text"
                                value={filterValue ?? ''}
                                onChange={(e) => col.setFilterValue(e.target.value || undefined)}
                                placeholder={t('teacher.dashboard.courses.filterByCourse') || 'Filter...'}
                                className="w-full min-w-[100px] text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            )}
                            {colId === 'instructor' && (
                              <input
                                type="text"
                                value={filterValue ?? ''}
                                onChange={(e) => col.setFilterValue(e.target.value || undefined)}
                                placeholder={t('teacher.dashboard.courses.filterByInstructor') || 'Filter...'}
                                className="w-full min-w-[90px] text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            )}
                            {colId === 'status' && (
                              <select
                                value={filterValue ?? ''}
                                onChange={(e) => col.setFilterValue(e.target.value || undefined)}
                                className="w-full min-w-[90px] text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">{t('teacher.dashboard.courses.filterAll') || 'All'}</option>
                                <option value="active">{t('teacher.dashboard.filters.active') || 'Active'}</option>
                                <option value="draft">{t('teacher.dashboard.filters.draft') || 'Draft'}</option>
                                <option value="inactive">{t('teacher.dashboard.filters.inactive') || 'Inactive'}</option>
                                <option value="archived">{t('teacher.dashboard.filters.archived') || 'Archived'}</option>
                              </select>
                            )}
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {coursesTable.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td colSpan={coursesTable.getAllColumns().length} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          {t('teacher.dashboard.courses.noResults') || 'No courses match your filters.'}
                        </td>
                      </tr>
                    ) : (
                      coursesTable.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className={`px-4 py-3 text-sm ${cell.column.id === 'tags' ? '' : 'whitespace-nowrap'}`}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
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
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('teacher.dashboard.students.title') || 'My Students'}
              </h2>
              {isAdmin && (
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder={t('admin.students.filterPlaceholder') || 'Filter by name or email...'}
                    value={studentsSearchQuery}
                    onChange={(e) => setStudentsSearchQuery(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[180px]"
                  />
                  <select
                    value={studentsMembershipFilter}
                    onChange={(e) => setStudentsMembershipFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">{t('admin.students.filterAll') || 'All memberships'}</option>
                    {MEMBERSHIP_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(opt.labelKey) || opt.value}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {studentsFilterByCourseId && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('teacher.dashboard.students.filteredByCourse') || 'Showing students enrolled in'}:{' '}
                    <strong className="text-gray-900 dark:text-white">
                      {courses.find((c) => c.id === studentsFilterByCourseId)?.title ?? studentsFilterByCourseId}
                    </strong>
                    {' '}({filteredStudents.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setStudentsFilterByCourseId(null)}
                    className="text-sm px-2 py-1 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t('teacher.dashboard.students.clearFilter') || 'Clear filter'}
                  </button>
                </div>
              )}
              {studentsFilterByTeacherId && !studentsFilterByCourseId && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('teacher.dashboard.students.filteredByTeacher') || 'Showing students for teacher'}:{' '}
                    <strong className="text-gray-900 dark:text-white">
                      {(registeredUsers || []).find((u) => u.id === studentsFilterByTeacherId)?.name ?? studentsFilterByTeacherId}
                    </strong>
                    {' '}({filteredStudents.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setStudentsFilterByTeacherId(null)}
                    className="text-sm px-2 py-1 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t('teacher.dashboard.students.clearFilter') || 'Clear filter'}
                  </button>
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm"
                  onClick={() => setStudentsMembershipFilter('new - no membership')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setStudentsMembershipFilter('new - no membership')}
                >
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.students.membership.nonMember') || 'non member'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{membershipCounts.nonMember}</p>
                </div>
                <div
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm"
                  onClick={() => setStudentsMembershipFilter('premium member')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setStudentsMembershipFilter('premium member')}
                >
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.students.membership.premiumMember') || 'premium member'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{membershipCounts.premium}</p>
                </div>
                <div
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm"
                  onClick={() => setStudentsMembershipFilter('vip member')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setStudentsMembershipFilter('vip member')}
                >
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.students.membership.vipMember') || 'vip member'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{membershipCounts.vip}</p>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('teacher.dashboard.students.name') || 'Name'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('teacher.dashboard.students.email') || 'Email'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('teacher.dashboard.students.courses') || 'Courses'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('teacher.dashboard.students.memberSince') || 'Member Since'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('teacher.dashboard.students.lastActive') || 'Last Active'}
                      </th>
                      {isAdmin && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('admin.students.paymentStatus') || 'Payment Status'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('admin.students.action') || 'Action'}
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 7 : 5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          {studentsFilterByCourseId
                            ? (t('teacher.dashboard.students.noStudentsInCourse') || 'No students enrolled in this course.')
                            : studentsFilterByTeacherId
                            ? (t('teacher.dashboard.students.noStudentsForTeacher') || 'No students for this teacher.')
                            : (t('teacher.dashboard.students.noStudents') || 'No students yet.')}
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {student.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            <button
                              type="button"
                              onClick={() => {
                                setCoursesFilterByStudentId(student.id)
                                setActiveTab('courses')
                              }}
                              className="font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                              title={t('teacher.dashboard.students.viewCoursesForStudent') || 'View courses for this student'}
                            >
                              {student.enrolledCourses}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {student.memberSince}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {student.lastActive}
                          </td>
                          {isAdmin && (
                            <React.Fragment>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {(() => {
                                  const p = profilesByUserId?.[student.id] as any
                                  const status: string = p?.paymentValidationStatus ?? 'none'
                                  const proof: string | undefined = p?.paymentProofDataUrl
                                  return (
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ' + getPaymentStatusClass(status)}
                                      >
                                        {t(`profile.page.paymentStatus.${status}`) || status}
                                      </span>
                                      {proof ? (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPaymentProofDataUrl(proof)
                                            setShowPaymentProofModal(true)
                                          }}
                                          className="text-primary-600 hover:underline text-sm"
                                        >
                                          {t('profile.page.viewUploadedProof') || 'View uploaded proof'}
                                        </button>
                                      ) : (
                                        <span className="text-sm text-gray-400">—</span>
                                      )}
                                    </div>
                                  )
                                })()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={student.membership ?? 'new - no membership'}
                                  onChange={(e) => {
                                    const newMembership = e.target.value
                                    updateUserMembership(student.id, newMembership)
                                    toast.success(t('admin.students.membershipUpdated') || 'Successfully updated membership')
                                  }}
                                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                  {MEMBERSHIP_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {t(opt.labelKey) || opt.value}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </React.Fragment>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {isAdmin && activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('admin.dashboard.users.title') || 'User Management'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreateUserModalOpen(true)
                  setCreateUserName('')
                  setCreateUserEmail('')
                  setCreateUserPassword('')
                  setCreateUserConfirm('')
                  setCreateUserRole('STUDENT')
                  setCreateUserError('')
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('admin.dashboard.users.createUserButton') || 'Create user'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { key: 'all' as const, label: t('admin.dashboard.users.allRoles') || 'All' },
                ...(user?.role === 'SUPERADMIN' ? [{ key: 'SUPERADMIN' as const, label: t('admin.dashboard.users.roleSuperAdmin') || 'Super Admin' }] : []),
                { key: 'ADMIN' as const, label: t('admin.dashboard.users.roleAdmin') || 'Admin' },
                { key: 'TEACHER' as const, label: t('admin.dashboard.users.roleTeacher') || 'Teacher' },
                { key: 'STUDENT' as const, label: t('admin.dashboard.users.roleStudent') || 'Student' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setUsersRoleFilter(key)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    usersRoleFilter === key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('admin.dashboard.users.user') || 'User'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('admin.dashboard.users.role') || 'Role'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('admin.dashboard.users.studentsOrCourses') || 'Students / Courses'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('admin.dashboard.users.createdAt') || 'Created at'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('admin.dashboard.users.lastLogin') || 'Last login'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('admin.dashboard.users.status') || 'Status'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('admin.dashboard.users.remarks') || 'Remarks'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('admin.dashboard.users.actions') || 'Actions'}
                      </th>
                    </tr>
                    <tr className="bg-gray-100/80 dark:bg-gray-700/50">
                      <th className="px-6 py-2">
                        <input
                          type="text"
                          value={usersNameFilter}
                          onChange={(e) => setUsersNameFilter(e.target.value)}
                          placeholder={t('admin.dashboard.users.searchPlaceholder') || 'Filter by name...'}
                          className="w-full min-w-[120px] text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </th>
                      <th className="px-6 py-2">
                        <select
                          value={usersRoleFilter}
                          onChange={(e) => setUsersRoleFilter(e.target.value as typeof usersRoleFilter)}
                          className="w-full min-w-[100px] text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">{t('admin.dashboard.users.allRoles') || 'All'}</option>
                          {user?.role === 'SUPERADMIN' && (
                            <option value="SUPERADMIN">{t('admin.dashboard.users.roleSuperAdmin') || 'Super Admin'}</option>
                          )}
                          <option value="ADMIN">{t('admin.dashboard.users.roleAdmin') || 'Admin'}</option>
                          <option value="TEACHER">{t('admin.dashboard.users.roleTeacher') || 'Teacher'}</option>
                          <option value="STUDENT">{t('admin.dashboard.users.roleStudent') || 'Student'}</option>
                        </select>
                      </th>
                      <th className="px-6 py-2">
                        <input
                          type="text"
                          value={usersEmailFilter}
                          onChange={(e) => setUsersEmailFilter(e.target.value)}
                          placeholder={t('admin.dashboard.users.filterByEmail') || 'Filter by email...'}
                          className="w-full min-w-[140px] text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </th>
                      <th className="px-6 py-2" />
                      <th className="px-6 py-2" />
                      <th className="px-6 py-2" />
                      <th className="px-6 py-2">
                        <select
                          value={usersStatusFilter}
                          onChange={(e) => setUsersStatusFilter(e.target.value as typeof usersStatusFilter)}
                          className="w-full min-w-[100px] text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">{t('admin.dashboard.users.allStatuses') || 'All'}</option>
                          <option value="ACTIVE">{t('admin.dashboard.users.statusActive') || 'Active'}</option>
                          <option value="INACTIVE">{t('admin.dashboard.users.statusInactive') || 'Inactive'}</option>
                          <option value="BLOCKED">{t('admin.dashboard.users.statusBlocked') || 'Blocked'}</option>
                        </select>
                      </th>
                      <th className="px-6 py-2" />
                      <th className="px-6 py-2" />
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          {t('admin.dashboard.users.noUsers') || 'No users match the filter.'}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingRoleUserId === u.id ? (
                              <div className="flex items-center gap-2">
                                <select
                                  defaultValue={u.role}
                                  disabled={!!updatingRoleUserId}
                                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                                  onChange={async (e) => {
                                    const newRole = e.target.value as 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPERADMIN'
                                    if (newRole === u.role) {
                                      setEditingRoleUserId(null)
                                      return
                                    }
                                    setUpdatingRoleUserId(u.id)
                                    try {
                                      await updateUserRole(u.id, newRole)
                                      setEditingRoleUserId(null)
                                    } catch (err) {
                                      console.error(err)
                                    } finally {
                                      setUpdatingRoleUserId(null)
                                    }
                                  }}
                                  onBlur={() => {
                                    if (!updatingRoleUserId) setEditingRoleUserId(null)
                                  }}
                                  autoFocus
                                >
                                  {(user?.role === 'SUPERADMIN' || u.role === 'SUPERADMIN') && (
                                    <option value="SUPERADMIN">{t('admin.dashboard.users.roleSuperAdmin') || 'Super Admin'}</option>
                                  )}
                                  <option value="ADMIN">{t('admin.dashboard.users.roleAdmin') || 'Admin'}</option>
                                  <option value="TEACHER">{t('admin.dashboard.users.roleTeacher') || 'Teacher'}</option>
                                  <option value="STUDENT">{t('admin.dashboard.users.roleStudent') || 'Student'}</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => setEditingRoleUserId(null)}
                                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                  title={t('admin.dashboard.users.cancel') || 'Cancel'}
                                  aria-label="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${
                                  u.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                  u.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                  u.role === 'TEACHER' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {u.role === 'SUPERADMIN' && <Crown className="w-3.5 h-3.5" />}
                                  {u.role === 'ADMIN' && <Shield className="w-3.5 h-3.5" />}
                                  {u.role === 'TEACHER' && <GraduationCap className="w-3.5 h-3.5" />}
                                  {u.role === 'STUDENT' && <Users className="w-3.5 h-3.5" />}
                                  {u.role === 'SUPERADMIN' ? (t('admin.dashboard.users.roleSuperAdmin') || 'Super Admin') :
                                   u.role === 'ADMIN' ? (t('admin.dashboard.users.roleAdmin') || 'Admin') :
                                   u.role === 'TEACHER' ? (t('admin.dashboard.users.roleTeacher') || 'Teacher') :
                                   (t('admin.dashboard.users.roleStudent') || 'Student')}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingRoleUserId(u.id)}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                                  title={t('admin.dashboard.users.editRole') || 'Edit role'}
                                  aria-label={t('admin.dashboard.users.editRole') || 'Edit role'}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {u.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {u.role === 'TEACHER' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setStudentsFilterByCourseId(null)
                                  setStudentsFilterByTeacherId(u.id)
                                  setActiveTab('students')
                                }}
                                className="font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                                title={t('admin.dashboard.users.viewStudentsForTeacher') || 'View students for this teacher'}
                              >
                                {studentCountByTeacherId[u.id] ?? 0}
                              </button>
                            ) : u.role === 'STUDENT' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCoursesFilterByStudentId(u.id)
                                  setActiveTab('courses')
                                }}
                                className="font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                                title={t('admin.dashboard.users.viewCoursesForStudent') || 'View courses for this student'}
                              >
                                {enrolledCoursesCountByStudentId[u.id] ?? 0}
                              </button>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {formatDateTime(u.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {formatDateTime(u.lastLogin ?? undefined)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              (u.status || 'ACTIVE') === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              (u.status || 'ACTIVE') === 'BLOCKED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {(u.status || 'ACTIVE') === 'ACTIVE' ? (t('admin.dashboard.users.statusActive') || 'Active') :
                               (u.status || 'ACTIVE') === 'BLOCKED' ? (t('admin.dashboard.users.statusBlocked') || 'Blocked') :
                               (t('admin.dashboard.users.statusInactive') || 'Inactive')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={u.remarks || ''}>
                            {u.remarks || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setUserToEditInfo({
                                    id: u.id,
                                    name: u.name,
                                    status: (u.status as 'ACTIVE' | 'INACTIVE' | 'BLOCKED') || 'ACTIVE',
                                    remarks: u.remarks || ''
                                  })
                                }}
                                className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                title={t('admin.dashboard.users.editStatusRemarks') || 'Edit status & remarks'}
                              >
                                <Edit className="w-4 h-4" />
                                {t('admin.dashboard.users.updateStatus') || 'Update status'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setUserToChangePassword({ id: u.id, name: u.name })
                                  setChangePasswordNew('')
                                  setChangePasswordConfirm('')
                                  setChangePasswordError('')
                                }}
                                className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                title={t('admin.dashboard.users.changePassword') || 'Change password'}
                              >
                                <Lock className="w-4 h-4" />
                                {t('admin.dashboard.users.changePassword') || 'Change password'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Change password modal */}
            <AnimatePresence>
              {userToChangePassword && (
                <div key={userToChangePassword.id} className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60"
                    onClick={() => { setUserToChangePassword(null); setChangePasswordError('') }}
                  />
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {t('admin.dashboard.users.changePassword') || 'Change password'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {userToChangePassword.name}
                        </p>
                      </div>
                    </div>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault()
                        setChangePasswordError('')
                        if (changePasswordNew.length < 6) {
                          setChangePasswordError(t('admin.dashboard.users.passwordMinLength') || 'Password must be at least 6 characters')
                          return
                        }
                        if (changePasswordNew !== changePasswordConfirm) {
                          setChangePasswordError(t('auth.signup.errors.passwordMismatch') || 'Passwords do not match')
                          return
                        }
                        setIsChangingPassword(true)
                        try {
                          await setUserPassword(userToChangePassword.id, changePasswordNew)
                          setUserToChangePassword(null)
                          setChangePasswordNew('')
                          setChangePasswordConfirm('')
                        } catch (err) {
                          setChangePasswordError(err instanceof Error ? err.message : 'Failed to update password')
                        } finally {
                          setIsChangingPassword(false)
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('admin.dashboard.users.newPassword') || 'New password'}
                        </label>
                        <input
                          type="password"
                          value={changePasswordNew}
                          onChange={(e) => setChangePasswordNew(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('admin.dashboard.users.confirmNewPassword') || 'Confirm new password'}
                        </label>
                        <input
                          type="password"
                          value={changePasswordConfirm}
                          onChange={(e) => setChangePasswordConfirm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                      </div>
                      {changePasswordError && (
                        <p className="text-sm text-red-600 dark:text-red-400">{changePasswordError}</p>
                      )}
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => { setUserToChangePassword(null); setChangePasswordError('') }}
                          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          {t('admin.dashboard.users.cancel') || 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          disabled={isChangingPassword}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isChangingPassword ? (t('admin.dashboard.users.updating') || 'Updating...') : (t('admin.dashboard.users.updatePassword') || 'Update password')}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Edit status & remarks modal */}
            <AnimatePresence>
              {userToEditInfo && (
                <div key={`edit-${userToEditInfo.id}`} className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60"
                    onClick={() => setUserToEditInfo(null)}
                  />
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Edit className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {t('admin.dashboard.users.editStatusRemarks') || 'Edit status & remarks'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{userToEditInfo.name}</p>
                      </div>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        updateUserStatusAndRemarks(userToEditInfo.id, {
                          status: userToEditInfo.status,
                          remarks: userToEditInfo.remarks
                        })
                        setUserToEditInfo(null)
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('admin.dashboard.users.status') || 'Status'}
                        </label>
                        <select
                          value={userToEditInfo.status}
                          onChange={(e) => setUserToEditInfo((prev) => prev ? { ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'BLOCKED' } : null)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="ACTIVE">{t('admin.dashboard.users.statusActive') || 'Active'}</option>
                          <option value="INACTIVE">{t('admin.dashboard.users.statusInactive') || 'Inactive'}</option>
                          <option value="BLOCKED">{t('admin.dashboard.users.statusBlocked') || 'Blocked'}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('admin.dashboard.users.remarks') || 'Remarks'}
                        </label>
                        <textarea
                          value={userToEditInfo.remarks}
                          onChange={(e) => setUserToEditInfo((prev) => prev ? { ...prev, remarks: e.target.value } : null)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder={t('admin.dashboard.users.remarksPlaceholder') || 'Optional notes...'}
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setUserToEditInfo(null)}
                          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          {t('admin.dashboard.users.cancel') || 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          {t('admin.dashboard.users.save') || 'Save'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Create user modal */}
            <AnimatePresence>
              {isCreateUserModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60"
                    onClick={() => setIsCreateUserModalOpen(false)}
                  />
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <UserCog className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {t('admin.dashboard.users.createUserButton') || 'Create user'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('admin.dashboard.users.createUserSubtitle') || 'Add a new user and assign a role'}
                        </p>
                      </div>
                    </div>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault()
                        setCreateUserError('')
                        if (!createUserName.trim()) {
                          setCreateUserError(t('admin.dashboard.users.createAdminUserNameRequired') || 'Name is required')
                          return
                        }
                        if (!createUserEmail.trim()) {
                          setCreateUserError(t('admin.dashboard.users.createAdminUserEmailRequired') || 'Email is required')
                          return
                        }
                        if (createUserPassword.length < 6) {
                          setCreateUserError(t('admin.dashboard.users.passwordMinLength') || 'Password must be at least 6 characters')
                          return
                        }
                        if (createUserPassword !== createUserConfirm) {
                          setCreateUserError(t('auth.signup.errors.passwordMismatch') || 'Passwords do not match')
                          return
                        }
                        setIsCreatingUser(true)
                        try {
                          await createUserAsAdmin({
                            name: createUserName.trim(),
                            email: createUserEmail.trim(),
                            password: createUserPassword,
                            role: createUserRole
                          })
                          setIsCreateUserModalOpen(false)
                          setCreateUserName('')
                          setCreateUserEmail('')
                          setCreateUserPassword('')
                          setCreateUserConfirm('')
                        } catch (err) {
                          setCreateUserError(err instanceof Error ? err.message : 'Failed to create user')
                        } finally {
                          setIsCreatingUser(false)
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('admin.dashboard.users.createUser.name') || 'Name'}
                        </label>
                        <input
                          type="text"
                          value={createUserName}
                          onChange={(e) => setCreateUserName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder={t('admin.dashboard.users.createUser.namePlaceholder') || 'Full name'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('admin.dashboard.users.createUser.email') || 'Email'}
                        </label>
                        <input
                          type="email"
                          value={createUserEmail}
                          onChange={(e) => setCreateUserEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="user@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('admin.dashboard.users.createUser.role') || 'Role'}
                        </label>
                        <select
                          value={createUserRole}
                          onChange={(e) => setCreateUserRole(e.target.value as 'ADMIN' | 'TEACHER' | 'STUDENT')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="STUDENT">{t('admin.dashboard.users.roleStudent') || 'Student'}</option>
                          <option value="TEACHER">{t('admin.dashboard.users.roleTeacher') || 'Teacher'}</option>
                          <option value="ADMIN">{t('admin.dashboard.users.roleAdmin') || 'Admin'}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('admin.dashboard.users.createUser.password') || 'Password'}
                        </label>
                        <input
                          type="password"
                          value={createUserPassword}
                          onChange={(e) => setCreateUserPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('admin.dashboard.users.createUser.confirmPassword') || 'Confirm password'}
                        </label>
                        <input
                          type="password"
                          value={createUserConfirm}
                          onChange={(e) => setCreateUserConfirm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                      </div>
                      {createUserError && (
                        <p className="text-sm text-red-600 dark:text-red-400">{createUserError}</p>
                      )}
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsCreateUserModalOpen(false)}
                          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          {t('admin.dashboard.users.cancel') || 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          disabled={isCreatingUser}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isCreatingUser ? (t('admin.dashboard.users.creating') || 'Creating...') : (t('admin.dashboard.users.createUserButton') || 'Create user')}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
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

        {/* Create Course Modal */}
        <CreateCourseModal
          isOpen={isCreateCourseModalOpen}
          onClose={() => setIsCreateCourseModalOpen(false)}
          onCourseCreated={handleCourseCreated}
        />

        {/* Delete Course Confirmation Modal */}
        <AnimatePresence>
          {courseToDelete && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60"
                onClick={() => setCourseToDelete(null)}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="bg-red-600 dark:bg-red-700 text-white p-4 flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {t('teacher.dashboard.courses.deleteConfirmTitle') || 'Delete course?'}
                    </h2>
                    <p className="text-red-100 text-sm">
                      {t('teacher.dashboard.courses.deleteConfirmSubtitle') || 'This action cannot be undone.'}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                    {t('teacher.dashboard.courses.deleteConfirmMessage') || 'Are you sure you want to delete'}{' '}
                    <strong className="text-gray-900 dark:text-white">&quot;{courseToDelete.title}&quot;</strong>?
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setCourseToDelete(null)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {t('teacher.dashboard.courses.deleteCancel') || 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeleteCourse}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('teacher.dashboard.courses.deleteConfirm') || 'Delete'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Course Details Modal */}
        <AnimatePresence>
          {selectedCourse && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50"
                onClick={closeCourseDetails}
              />
              <div className="flex min-h-screen items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-xl"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {selectedCourse.title}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedCourse.subject} • {selectedCourse.level.charAt(0) + selectedCourse.level.slice(1).toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={closeCourseDetails}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                    {selectedCourse.image && (
                      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                        <img
                          src={selectedCourse.image}
                          alt={selectedCourse.title}
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}
                    {selectedCourse.description && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {t('teacher.createCourse.fields.description') || 'Description'}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {selectedCourse.description}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Students</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCourse.students}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Lessons</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCourse.lessons}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Duration</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedCourse.duration || '—'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Instructor</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedCourse.instructor || '—'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Rating</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedCourse.rating != null ? `${selectedCourse.rating} / 5` : '—'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Price</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(selectedCourse.price ?? 0, selectedCourse.currency)}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Created</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedCourse.createdAt ? new Date(selectedCourse.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Updated</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedCourse.updatedAt ? new Date(selectedCourse.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                        </p>
                      </div>
                    </div>
                    {selectedCourse.category && selectedCourse.category.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tags / Category</h3>
                        <ul className="flex flex-wrap gap-2">
                          {selectedCourse.category.map((tag, i) => (
                            <li key={i} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                              {tag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedCourse.features && selectedCourse.features.length > 0 && !selectedCourse.contents?.length && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Section names</h3>
                        <ul className="flex flex-wrap gap-2">
                          {selectedCourse.features.map((f, i) => (
                            <li key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Course contents: sections and lessons (normalize for persisted data) */}
                    {(() => {
                      const courseContents = Array.isArray(selectedCourse.contents) ? selectedCourse.contents : []
                      const hasContents = courseContents.length > 0
                      return (
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                            <ListOrdered className="w-4 h-4" />
                            Course contents
                          </h3>
                          {hasContents ? (
                            <div className="space-y-4">
                              {courseContents.map((section, sIdx) => {
                                const lessons = Array.isArray(section.lessons) ? section.lessons : []
                                return (
                                  <div key={section.id || sIdx} className="rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                                    <div className="bg-gray-100 dark:bg-gray-700/50 px-4 py-2 font-medium text-gray-900 dark:text-white">
                                      {sIdx + 1}. {section.name}
                                      {lessons.length > 0 && (
                                        <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                                          ({lessons.length} lesson{lessons.length !== 1 ? 's' : ''})
                                        </span>
                                      )}
                                    </div>
                                    {lessons.length > 0 ? (
                                      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {lessons.map((lesson, lIdx) => (
                                          <li key={lesson.id || lIdx} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <PlayCircle className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                              <p className="font-medium text-gray-900 dark:text-white">
                                                {sIdx + 1}.{lIdx + 1} {lesson.name}
                                              </p>
                                              {lesson.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{lesson.description}</p>
                                              )}
                                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                {Number(lesson.durationMinutes) || 0} min
                                                {lesson.videoUrl && <span className="ml-2">• Video</span>}
                                              </p>
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No lessons in this section yet.</p>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              No sections or lessons stored. Create a course via <strong>Create Course</strong> (Step 2: Course Contents) to save the full curriculum here.
                            </p>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </motion.div>
              </div>
            </div>
          )}
          {showPaymentProofModal && paymentProofDataUrl && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPaymentProofModal(false)
                setPaymentProofDataUrl(null)
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('profile.page.viewUploadedProof') || 'View uploaded proof'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentProofModal(false)
                      setPaymentProofDataUrl(null)
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-4 min-h-[300px] flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                  {isProofImage(paymentProofDataUrl) ? (
                    <img
                      src={paymentProofDataUrl}
                      alt="Payment proof"
                      className="max-w-full max-h-[70vh] object-contain"
                    />
                  ) : isProofPdf(paymentProofDataUrl) ? (
                    <iframe
                      src={paymentProofDataUrl}
                      title="Payment proof"
                      className="w-full min-h-[70vh] border-0 rounded"
                    />
                  ) : (
                    <p className="text-gray-500">
                      {t('profile.page.proofViewUnsupported') || 'Preview not available for this file type.'}
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
  return dashboardContent
}
