'use client'

import React from 'react'
import { useAuthStore } from '@/stores/authStore'

interface RoleBasedAccessProps {
  children: React.ReactNode
  allowedRoles?: Array<'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPERADMIN'>
  requiredPermissions?: string[]
  resource?: string
  action?: string
  fallback?: React.ReactNode
  showFallback?: boolean
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  children,
  allowedRoles,
  requiredPermissions,
  resource,
  action,
  fallback = null,
  showFallback = false
}) => {
  const { user, hasPermission, hasRole, canAccess } = useAuthStore()

  // Check if user is authenticated
  if (!user) {
    return showFallback ? fallback : null
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return showFallback ? fallback : null
  }

  // Check permission-based access
  if (requiredPermissions && !requiredPermissions.every(permission => hasPermission(permission))) {
    return showFallback ? fallback : null
  }

  // Check resource-based access
  if (resource && action && !canAccess(resource, action)) {
    return showFallback ? fallback : null
  }

  return <>{children}</>
}

// Convenience components for common role checks
export const StudentOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedAccess allowedRoles={['STUDENT']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
)

export const TeacherOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedAccess allowedRoles={['TEACHER']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
)

export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedAccess allowedRoles={['ADMIN', 'SUPERADMIN']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
)

export const SuperAdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedAccess allowedRoles={['SUPERADMIN']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
)

export const StudentAndTeacher: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedAccess allowedRoles={['STUDENT', 'TEACHER']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
)

export const TeacherAndAdmin: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedAccess allowedRoles={['TEACHER', 'ADMIN', 'SUPERADMIN']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
)

