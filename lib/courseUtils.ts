import { VideoLesson, CourseTopic, CourseProgress } from '@/types/course'

export const loadExistingProgress = () => {
  try {
    console.log('Loading existing progress for course')
    
    // Load lesson progress
    const lessonProgress = loadLessonProgress()
    console.log('Loaded lesson progress:', lessonProgress)
    
    // Load user course progress
    const userProgressKey = `user_course_progress_anonymous`
    const userProgress = localStorage.getItem(userProgressKey)
    if (userProgress) {
      const userProgressData = JSON.parse(userProgress)
      console.log('Loaded user progress:', userProgressData)
    }
    
    // Load course progress
    const courseProgressKey = `course_progress_course_1`
    const courseProgress = localStorage.getItem(courseProgressKey)
    if (courseProgress) {
      const courseProgressData = JSON.parse(courseProgress)
      console.log('Loaded course progress:', courseProgressData)
    }
    
    return { lessonProgress, userProgress, courseProgress }
  } catch (error) {
    console.error('Error loading existing progress:', error)
    return {}
  }
}

export const loadLessonProgress = (courseId: string = 'course_1') => {
  try {
    const savedProgress = localStorage.getItem(`course_progress_${courseId}`)
    if (savedProgress) {
      return JSON.parse(savedProgress)
    }
  } catch (error) {
    console.error('Error loading lesson progress:', error)
  }
  return {}
}

export const saveLessonProgress = (courseId: string, lessonId: string, progress: { isWatched: boolean, completedAt: string }) => {
  try {
    const existingProgress = loadLessonProgress(courseId)
    existingProgress[lessonId] = progress
    localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(existingProgress))
    console.log('Progress saved for lesson:', lessonId)
  } catch (error) {
    console.error('Error saving lesson progress:', error)
  }
}

export const updateCourseProgressForDashboard = (courseId: string, totalLessons: number, completedLessons: number, isCompleted: boolean) => {
  try {
    const dashboardProgress = {
      courseId,
      totalLessons,
      completedLessons,
      isCompleted,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem(`dashboard_progress_${courseId}`, JSON.stringify(dashboardProgress))
    console.log('Dashboard progress updated for course:', courseId)
  } catch (error) {
    console.error('Error updating dashboard progress:', error)
  }
}

export const generateMockTopics = (courseData: any) => {
  console.log('Generating mock topics for course')
  
  // Load existing progress instead of clearing it
  const existingProgress = loadExistingProgress()
  console.log('Existing progress loaded:', existingProgress)
  
  // Use existing progress or default to unwatched
  const savedProgress = existingProgress.lessonProgress || {}
  
  const mockTopics: CourseTopic[] = [
    {
      id: 'topic_1',
      title: 'Getting Started',
      description: 'Introduction to the course and basic concepts',
      order: 1,
      lessons: [
        {
          id: 'lesson_1_1',
          title: 'Welcome to the Course',
          summary: 'Course overview and what you\'ll learn',
          duration: '5:30',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnail: '/api/placeholder/300/200',
          isWatched: savedProgress['lesson_1_1']?.isWatched || false,
          order: 1,
          resources: [
            { id: 'res_1', name: 'Course Syllabus', type: 'pdf', url: '#', size: '2.1 MB' },
            { id: 'res_2', name: 'Lesson Transcript', type: 'document', url: '#', size: '15 KB' }
          ],
          comments: [
            {
              id: 'com_1',
              user: 'Maria Santos',
              avatar: '👩',
              content: 'Great introduction! I\'m excited to start learning.',
              timestamp: '2 hours ago',
              likes: 3,
              replies: []
            }
          ]
        },
        {
          id: 'lesson_1_2',
          title: 'Setting Up Your Learning Environment',
          summary: 'Tools and resources you\'ll need',
          duration: '8:15',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          thumbnail: '/api/placeholder/300/200',
          isWatched: savedProgress['lesson_1_2']?.isWatched || false,
          order: 2,
          resources: [
            { id: 'res_3', name: 'Setup Checklist', type: 'pdf', url: '#', size: '1.8 MB' }
          ],
          comments: []
        }
      ]
    },
    {
      id: 'topic_2',
      title: 'Basic Fundamentals',
      description: 'Core concepts and essential knowledge',
      order: 2,
      lessons: [
        {
          id: 'lesson_2_1',
          title: 'Understanding the Basics',
          summary: 'Fundamental concepts and principles',
          duration: '12:45',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          thumbnail: '/api/placeholder/300/200',
          isWatched: savedProgress['lesson_2_1']?.isWatched || false,
          order: 3,
          resources: [],
          comments: []
        },
        {
          id: 'lesson_2_2',
          title: 'Practice Exercises',
          summary: 'Hands-on practice with basic concepts',
          duration: '15:20',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          thumbnail: '/api/placeholder/300/200',
          isWatched: savedProgress['lesson_2_2']?.isWatched || false,
          order: 4,
          resources: [
            { id: 'res_4', name: 'Exercise Workbook', type: 'pdf', url: '#', size: '3.2 MB' }
          ],
          comments: []
        }
      ]
    }
  ]
  
  return mockTopics
}

export const findNextLesson = (currentLessonId: string, topics: CourseTopic[]): VideoLesson | null => {
  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i]
    for (let j = 0; j < topic.lessons.length; j++) {
      if (topic.lessons[j].id === currentLessonId) {
        // Check if there's a next lesson in the same topic
        if (j + 1 < topic.lessons.length) {
          return topic.lessons[j + 1]
        }
        // Check if there's a next topic with lessons
        if (i + 1 < topics.length && topics[i + 1].lessons.length > 0) {
          return topics[i + 1].lessons[0]
        }
        // No more lessons
        return null
      }
    }
  }
  return null
}

export const calculateCourseProgress = (topics: CourseTopic[]): CourseProgress => {
  const totalLessons = topics.reduce((sum, topic) => sum + topic.lessons.length, 0)
  const completedLessons = topics.reduce((sum, topic) => 
    sum + topic.lessons.filter(lesson => lesson.isWatched).length, 0
  )
  
  // Calculate total duration (mock data)
  const totalDuration = `${Math.ceil(totalLessons * 0.8)}h ${Math.ceil(totalLessons * 0.3)}m`
  const watchedDuration = `${Math.ceil(completedLessons * 0.8)}h ${Math.ceil(completedLessons * 0.3)}m`
  
  const isCompleted = completedLessons === totalLessons && totalLessons > 0
  
  return {
    totalLessons,
    completedLessons,
    totalDuration,
    watchedDuration,
    isCompleted,
    completionDate: isCompleted ? new Date().toISOString() : undefined,
    certificateEarned: isCompleted,
    badgeEarned: isCompleted,
    finalScore: isCompleted ? 95 : undefined,
    assessmentCompleted: isCompleted,
    assessmentDate: isCompleted ? new Date().toISOString() : undefined
  }
}

