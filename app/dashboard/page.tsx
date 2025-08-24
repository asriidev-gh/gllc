'use client'

import { Dashboard } from '@/components/Dashboard'
import { Header } from '@/components/Header'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Dashboard />
    </div>
  )
}
