export interface VideoLesson {
  id: string
  title: string
  summary: string
  duration: string
  videoUrl: string
  thumbnail: string
  isWatched: boolean
  order: number
  resources?: CourseResource[]
  comments?: LessonComment[]
}

export interface CourseTopic {
  id: string
  title: string
  description: string
  lessons: VideoLesson[]
  order: number
}

export interface CourseResource {
  id: string
  name: string
  type: 'pdf' | 'video' | 'audio' | 'document'
  url: string
  size: string
}

export interface LessonComment {
  id: string
  user: string
  avatar: string
  content: string
  timestamp: string
  likes: number
  replies: CommentReply[]
}

export interface CommentReply {
  id: string
  user: string
  avatar: string
  content: string
  timestamp: string
  likes: number
}

export interface CourseNote {
  id: string
  lessonId: string
  content: string
  timestamp: string
  tags: string[]
}

export interface CourseProgress {
  totalLessons: number
  completedLessons: number
  totalDuration: string
  watchedDuration: string
  isCompleted: boolean
  completionDate?: string
  certificateEarned?: boolean
  badgeEarned?: boolean
  finalScore?: number
  assessmentCompleted?: boolean
  assessmentDate?: string
}

export interface CourseCertificate {
  id: string
  courseName: string
  userName: string
  completionDate: string
  finalScore: number
  certificateUrl: string
  shareableLink: string
}

export interface CourseBadge {
  id: string
  name: string
  description: string
  icon: string
  category: string
  unlockedAt: string
}

export interface AssessmentQuestion {
  question: string
  options: string[]
  correctAnswer: number
}
