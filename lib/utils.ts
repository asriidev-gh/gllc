import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}m`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    tagalog: 'lang-tagalog',
    english: 'lang-english',
    korean: 'lang-korean',
    japanese: 'lang-japanese',
    chinese: 'lang-chinese',
    spanish: 'lang-spanish',
    french: 'lang-french',
    german: 'lang-german',
  }
  return colors[language.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

export function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    beginner: 'level-beginner',
    intermediate: 'level-intermediate',
    advanced: 'level-advanced',
  }
  return colors[level.toLowerCase()] || 'bg-gray-100 text-gray-800'
}
