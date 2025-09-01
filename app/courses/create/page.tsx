'use client'

import React, { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, ArrowRight, Save, Plus, Trash2, Image as ImageIcon,
  Star, Tag as TagIcon, BookOpen, Clock, Upload, ChevronUp, ChevronDown
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCoursesStore } from '@/stores'

type CourseLevel = 'beginner' | 'intermediate' | 'advanced'
type CourseStatus = 'draft' | 'active' | 'inactive'

interface LessonForm {
  id: string
  name: string
  description: string
  durationMinutes: number
  videoUrl?: string
  thumbnailUrl?: string
}

interface CategoryForm {
  id: string
  name: string
  lessons: LessonForm[]
}

interface CourseFormState {
  title: string
  description: string
  tags: string[]
  level: CourseLevel
  status: CourseStatus
  stars: number
  thumbnailDataUrl?: string
  totalLessons: number
  totalDurationMinutes: number
  language: string
  instructorName: string
  isWithCertificate: boolean
  isWithFinalAssessment: boolean
  categories: CategoryForm[]
}

const initialState: CourseFormState = {
  title: '',
  description: '',
  tags: [],
  level: 'beginner',
  status: 'draft',
  stars: 0,
  thumbnailDataUrl: undefined,
  totalLessons: 0,
  totalDurationMinutes: 0,
  language: 'English',
  instructorName: '',
  isWithCertificate: false,
  isWithFinalAssessment: false,
  categories: [
    { id: crypto.randomUUID(), name: 'Getting Started', lessons: [] },
    { id: crypto.randomUUID(), name: 'Basic Fundamentals', lessons: [] },
  ],
}

const levels: { value: CourseLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const statuses: { value: CourseStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const teachingLanguages = [
  'English',
  'Spanish',
  'Tagalog',
  'Korean',
  'Japanese',
]

const getFlagForLanguage = (language: string): string => {
  const flagMap: Record<string, string> = {
    'English': '🇺🇸',
    'Spanish': '🇪🇸',
    'Tagalog': '🇵🇭',
    'Korean': '🇰🇷',
    'Japanese': '🇯🇵'
  }
  return flagMap[language] || '🌍'
}

export default function CreateCoursePage(): JSX.Element {
  const { t } = useLanguage()
  const router = useRouter()
  const { addCourse } = useCoursesStore()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<CourseFormState>(initialState)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [tagInput, setTagInput] = useState<string>('')

  const derivedTotals = useMemo(() => {
    const totalLessons = form.categories.reduce((sum, c) => sum + c.lessons.length, 0)
    const totalDurationMinutes = form.categories.reduce(
      (sum, c) => sum + c.lessons.reduce((s, l) => s + (Number(l.durationMinutes) || 0), 0),
      0
    )
    return { totalLessons, totalDurationMinutes }
  }, [form.categories])

  const updateField = <K extends keyof CourseFormState>(key: K, value: CourseFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const addTag = (value: string) => {
    const tag = value.trim()
    if (!tag) return
    if (form.tags.includes(tag)) return
    updateField('tags', [...form.tags, tag])
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    updateField('tags', form.tags.filter(t => t !== tag))
  }

  const onTagKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' || e.key === ',' ) {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && form.tags.length) {
      // remove last tag on backspace when input empty
      removeTag(form.tags[form.tags.length - 1])
    }
  }

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!form.title.trim()) newErrors.title = 'Course title is required'
    if (!form.description.trim()) newErrors.description = 'Course description is required'
    if (!form.language.trim()) newErrors.language = 'Teaching language is required'
    if (!form.instructorName.trim()) newErrors.instructorName = 'Instructor name is required'
    if (form.stars < 0 || form.stars > 5) newErrors.stars = 'Stars must be between 0 and 5'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (form.categories.length === 0) newErrors.categories = 'Add at least one category'
    form.categories.forEach((cat, ci) => {
      if (!cat.name.trim()) newErrors[`cat-${ci}-name`] = 'Category name is required'
      cat.lessons.forEach((lsn, li) => {
        if (!lsn.name.trim()) newErrors[`cat-${ci}-lesson-${li}-name`] = 'Lesson name is required'
        if (!lsn.description.trim()) newErrors[`cat-${ci}-lesson-${li}-description`] = 'Lesson description is required'
        if (lsn.durationMinutes <= 0) newErrors[`cat-${ci}-lesson-${li}-duration`] = 'Duration must be > 0'
      })
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const goNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) void handleSubmit()
  }

  const goBack = () => setStep(prev => (prev === 2 ? 1 : prev))

  const onPickThumbnail = () => fileInputRef.current?.click()
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      updateField('thumbnailDataUrl', String(reader.result))
    }
    reader.readAsDataURL(file)
  }

  const addCategory = () => {
    setForm(prev => ({
      ...prev,
      categories: [...prev.categories, { id: crypto.randomUUID(), name: 'New Category', lessons: [] }],
    }))
  }

  const removeCategory = (id: string) => {
    setForm(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }))
  }

  const moveCategory = (index: number, dir: -1 | 1) => {
    setForm(prev => {
      const list = [...prev.categories]
      const newIndex = index + dir
      if (newIndex < 0 || newIndex >= list.length) return prev
      const [item] = list.splice(index, 1)
      list.splice(newIndex, 0, item)
      return { ...prev, categories: list }
    })
  }

  const updateCategoryName = (id: string, name: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.map(c => (c.id === id ? { ...c, name } : c)),
    }))
  }

  const addLesson = (categoryId: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.map(c =>
        c.id === categoryId
          ? {
              ...c,
              lessons: [
                ...c.lessons,
                { id: crypto.randomUUID(), name: 'New Lesson', description: '', durationMinutes: 5 },
              ],
            }
          : c
      ),
    }))
  }

  const removeLesson = (categoryId: string, lessonId: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.map(c =>
        c.id === categoryId ? { ...c, lessons: c.lessons.filter(l => l.id !== lessonId) } : c
      ),
    }))
  }

  const moveLesson = (categoryId: string, index: number, dir: -1 | 1) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.map(c => {
        if (c.id !== categoryId) return c
        const list = [...c.lessons]
        const newIndex = index + dir
        if (newIndex < 0 || newIndex >= list.length) return c
        const [item] = list.splice(index, 1)
        list.splice(newIndex, 0, item)
        return { ...c, lessons: list }
      }),
    }))
  }

  const updateLesson = (categoryId: string, lessonId: string, patch: Partial<LessonForm>) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.map(c =>
        c.id === categoryId
          ? {
              ...c,
              lessons: c.lessons.map(l => (l.id === lessonId ? { ...l, ...patch } : l)),
            }
          : c
      ),
    }))
  }

  const handleSubmit = async () => {
    // Derive totals for storage/preview
    const { totalLessons, totalDurationMinutes } = derivedTotals
    const payload: CourseFormState = {
      ...form,
      totalLessons,
      totalDurationMinutes,
    }
    // Simulate save
    await new Promise(r => setTimeout(r, 600))
    // Map to CoursesStore.Course shape and persist
    const storeCourse = {
      id: `course_${Date.now()}`,
      title: payload.title,
      description: payload.description,
      language: payload.language,
      level: (payload.level.toUpperCase() as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'),
      duration: `${payload.totalDurationMinutes || totalDurationMinutes} mins`,
      lessons: payload.totalLessons || totalLessons,
      instructor: payload.instructorName,
      price: 0,
      image: payload.thumbnailDataUrl,
      category: payload.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      students: 0,
      rating: payload.stars,
      features: payload.categories.map(cat => cat.name),
      flag: getFlagForLanguage(payload.language)
    }
    addCourse(storeCourse)
    router.push('/courses')
  }

  const Header = (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">Create Course</h1>
        </div>
        <div className="flex items-center space-x-2">
          {step === 2 && (
            <button
              onClick={goBack}
              className="px-3 py-2 inline-flex items-center border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
          )}
          <button
            onClick={goNext}
            className="px-4 py-2 inline-flex items-center bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {step === 1 ? (
              <>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Course
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {Header}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="bg-white rounded-xl shadow-sm border p-6 space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                    <input
                      value={form.title}
                      onChange={e => updateField('title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., English for Beginners"
                    />
                    {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Description</label>
                    <textarea
                      value={form.description}
                      onChange={e => updateField('description', e.target.value)}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe what students will learn"
                    />
                    {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 inline-flex items-center">
                        <TagIcon className="w-4 h-4 mr-1 text-gray-500" /> Course Tags
                      </label>
                      <div className="w-full border border-gray-300 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                        <div className="flex flex-wrap gap-2">
                          {form.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded">
                              <span className="text-xs font-medium">{tag}</span>
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                                aria-label={`Remove ${tag}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          <input
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={onTagKeyDown}
                            onBlur={() => addTag(tagInput)}
                            className="flex-1 min-w-[120px] px-2 py-1 outline-none"
                            placeholder="Type a tag and press Enter"
                          />
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">Press Enter or comma to add tags</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                      <select
                        value={form.level}
                        onChange={e => updateField('level', e.target.value as CourseLevel)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                      >
                        {levels.map(l => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div className="grid grid-cols-3 gap-2">
                        {statuses.map(s => (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => updateField('status', s.value)}
                            className={`px-3 py-2 border rounded-lg text-sm ${
                              form.status === s.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 inline-flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" /> Stars (0-5)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={5}
                        value={form.stars}
                        onChange={e => updateField('stars', Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.stars ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.stars && <p className="text-sm text-red-600 mt-1">{errors.stars}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 inline-flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-500" /> Total Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={form.totalDurationMinutes}
                        onChange={e => updateField('totalDurationMinutes', Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                      />
                      <p className="text-xs text-gray-500 mt-1">You can also leave this and we will derive it from lessons.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Lessons</label>
                      <input
                        type="number"
                        min={0}
                        value={form.totalLessons || derivedTotals.totalLessons}
                        onChange={e => updateField('totalLessons', Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                      />
                      <p className="text-xs text-gray-500 mt-1">Automatically derived from contents: {derivedTotals.totalLessons}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Language</label>
                      <select
                        value={form.language}
                        onChange={e => updateField('language', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.language ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {teachingLanguages.map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      {errors.language && <p className="text-sm text-red-600 mt-1">{errors.language}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Name</label>
                      <input
                        value={form.instructorName}
                        onChange={e => updateField('instructorName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.instructorName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., John Smith"
                      />
                      {errors.instructorName && (
                        <p className="text-sm text-red-600 mt-1">{errors.instructorName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <input
                        id="withCert"
                        type="checkbox"
                        checked={form.isWithCertificate}
                        onChange={e => updateField('isWithCertificate', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <label htmlFor="withCert" className="text-sm text-gray-700">Includes Certificate</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        id="withFinal"
                        type="checkbox"
                        checked={form.isWithFinalAssessment}
                        onChange={e => updateField('isWithFinalAssessment', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <label htmlFor="withFinal" className="text-sm text-gray-700">Includes Final Assessment</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 inline-flex items-center">
                      <ImageIcon className="w-4 h-4 mr-1 text-gray-500" /> Course Thumbnail
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 h-20 bg-gray-100 border rounded-lg flex items-center justify-center overflow-hidden">
                        {form.thumbnailDataUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={form.thumbnailDataUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={onPickThumbnail}
                        className="inline-flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        <Upload className="w-4 h-4 mr-2" /> Upload
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-6"
                >
                  {/* Categories & Lessons Editor */}
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Course Contents</h3>
                      <button
                        type="button"
                        onClick={addCategory}
                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Category
                      </button>
                    </div>

                    {errors.categories && <p className="text-sm text-red-600 mb-3">{errors.categories}</p>}

                    <div className="space-y-4">
                      {form.categories.map((cat, ci) => (
                        <div key={cat.id} className="border rounded-lg">
                          <div className="flex items-center justify-between p-3 bg-gray-50 border-b rounded-t-lg">
                            <div className="flex-1 pr-3">
                              <input
                                value={cat.name}
                                onChange={e => updateCategoryName(cat.id, e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  errors[`cat-${ci}-name`] ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors[`cat-${ci}-name`] && (
                                <p className="text-xs text-red-600 mt-1">{errors[`cat-${ci}-name`]}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => moveCategory(ci, -1)}
                                className="p-2 rounded hover:bg-gray-100"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveCategory(ci, 1)}
                                className="p-2 rounded hover:bg-gray-100"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeCategory(cat.id)}
                                className="p-2 rounded hover:bg-gray-100 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="p-3">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-700">Lessons</span>
                              <button
                                type="button"
                                onClick={() => addLesson(cat.id)}
                                className="inline-flex items-center px-3 py-1.5 border rounded-lg hover:bg-gray-50"
                              >
                                <Plus className="w-4 h-4 mr-1" /> Add Lesson
                              </button>
                            </div>

                            <div className="space-y-3">
                              {cat.lessons.map((lsn, li) => (
                                <div key={lsn.id} className="border rounded-lg p-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Lesson Name</label>
                                      <input
                                        value={lsn.name}
                                        onChange={e => updateLesson(cat.id, lsn.id, { name: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                          errors[`cat-${ci}-lesson-${li}-name`] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                      />
                                      {errors[`cat-${ci}-lesson-${li}-name`] && (
                                        <p className="text-xs text-red-600 mt-1">{errors[`cat-${ci}-lesson-${li}-name`]}</p>
                                      )}
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1 inline-flex items-center">
                                        <Clock className="w-4 h-4 mr-1 text-gray-500" /> Duration (minutes)
                                      </label>
                                      <input
                                        type="number"
                                        min={1}
                                        value={lsn.durationMinutes}
                                        onChange={e => updateLesson(cat.id, lsn.id, { durationMinutes: Number(e.target.value) })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                          errors[`cat-${ci}-lesson-${li}-duration`] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                      />
                                      {errors[`cat-${ci}-lesson-${li}-duration`] && (
                                        <p className="text-xs text-red-600 mt-1">{errors[`cat-${ci}-lesson-${li}-duration`]}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Video URL (optional)</label>
                                      <input
                                        placeholder="https://..."
                                        value={lsn.videoUrl || ''}
                                        onChange={e => updateLesson(cat.id, lsn.id, { videoUrl: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Thumbnail URL (optional)</label>
                                      <input
                                        placeholder="https://..."
                                        value={lsn.thumbnailUrl || ''}
                                        onChange={e => updateLesson(cat.id, lsn.id, { thumbnailUrl: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <label className="block text-xs text-gray-600 mb-1">Lesson Description</label>
                                    <textarea
                                      rows={2}
                                      value={lsn.description}
                                      onChange={e => updateLesson(cat.id, lsn.id, { description: e.target.value })}
                                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors[`cat-${ci}-lesson-${li}-description`] ? 'border-red-500' : 'border-gray-300'
                                      }`}
                                    />
                                    {errors[`cat-${ci}-lesson-${li}-description`] && (
                                      <p className="text-xs text-red-600 mt-1">{errors[`cat-${ci}-lesson-${li}-description`]}</p>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between mt-3">
                                    <div className="text-xs text-gray-500">Lesson #{li + 1}</div>
                                    <div className="flex items-center space-x-1">
                                      <button
                                        type="button"
                                        onClick={() => moveLesson(cat.id, li, -1)}
                                        className="p-2 rounded hover:bg-gray-100"
                                      >
                                        <ChevronUp className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => moveLesson(cat.id, li, 1)}
                                        className="p-2 rounded hover:bg-gray-100"
                                      >
                                        <ChevronDown className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeLesson(cat.id, lsn.id)}
                                        className="p-2 rounded hover:bg-gray-100 text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Live preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Preview</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="w-full h-36 bg-gray-100 flex items-center justify-center">
                  {form.thumbnailDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.thumbnailDataUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <div className="text-gray-900 font-medium truncate">{form.title || 'Untitled Course'}</div>
                  <div className="text-xs text-gray-600 line-clamp-2">{form.description || 'Course description...'}</div>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                    <span className="inline-flex items-center"><Clock className="w-3 h-3 mr-1" /> {derivedTotals.totalDurationMinutes || form.totalDurationMinutes} mins</span>
                    <span>{(form.level || 'beginner').toString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Meta</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div>Language: <span className="text-gray-600">{form.language || '-'}</span></div>
                <div>Instructor: <span className="text-gray-600">{form.instructorName || '-'}</span></div>
                <div>Tags: <span className="text-gray-600">{form.tags.length ? form.tags.join(', ') : '-'}</span></div>
                <div>Status: <span className="text-gray-600">{form.status}</span></div>
                <div>Stars: <span className="text-gray-600">{form.stars}</span></div>
                <div>Lessons: <span className="text-gray-600">{derivedTotals.totalLessons || form.totalLessons}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


