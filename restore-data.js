// Script to restore essential localStorage data
// Run this in your browser console to restore the application data

console.log('🔄 Restoring application data...')

// 1. Restore enrolled courses
const enrolledCourses = [
  {
    id: 'tagalog-basic',
    name: 'Tagalog Basics',
    title: 'Tagalog Basics',
    language: 'Tagalog',
    flag: '🇵🇭',
    level: 'BEGINNER',
    duration: '3-6 months',
    totalLessons: 4,
    completedLessons: 0,
    currentLesson: 1,
    rating: 4.8,
    lastAccessed: 'Just now',
    timeSpent: '0h 0m',
    certificate: false,
    progress: 0,
    instructor: 'Maria Santos',
    price: 'Free',
    originalPrice: null,
    students: 2500,
    features: ['Cultural Context', 'Modern Usage', 'Regional Variations', 'Formal vs Informal'],
    category: ['Language', 'Beginner'],
    enrolledAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'english-basic',
    name: 'English Basics',
    title: 'English Basics',
    language: 'English',
    flag: '🇺🇸',
    level: 'BEGINNER',
    duration: '6-12 months',
    totalLessons: 4,
    completedLessons: 0,
    currentLesson: 1,
    rating: 4.7,
    lastAccessed: 'Just now',
    timeSpent: '0h 0m',
    certificate: false,
    progress: 0,
    instructor: 'Sarah Johnson',
    price: '$39.99',
    originalPrice: '$69.99',
    students: 3200,
    features: ['Business Communication', 'Professional Writing', 'Presentations', 'Negotiations'],
    category: ['Language', 'Business'],
    enrolledAt: new Date().toISOString(),
    status: 'ACTIVE'
  }
]

localStorage.setItem('enrolled_courses', JSON.stringify(enrolledCourses))
console.log('✅ Enrolled courses restored')

// 2. Restore user course progress (for demo user)
const userProgress = {
  'tagalog-basic': {
    totalLessons: 4,
    completedLessons: 0,
    currentLesson: 1,
    isCompleted: false,
    completionDate: null,
    assessmentCompleted: false,
    assessmentScore: null,
    assessmentDate: null,
    finalScore: null,
    lastAccessed: new Date().toISOString()
  },
  'english-basic': {
    totalLessons: 4,
    completedLessons: 0,
    currentLesson: 1,
    isCompleted: false,
    completionDate: null,
    assessmentCompleted: false,
    assessmentScore: null,
    assessmentDate: null,
    finalScore: null,
    lastAccessed: new Date().toISOString()
  }
}

localStorage.setItem('user_course_progress_student@example.com', JSON.stringify(userProgress))
console.log('✅ User course progress restored')

// 3. Restore learning activity
const learningActivity = {
  'student@example.com': [
    {
      date: new Date().toISOString().split('T')[0],
      activities: [
        {
          id: 'activity_1',
          type: 'course_enrolled',
          description: 'Enrolled in Tagalog Basics course',
          timestamp: new Date().toISOString(),
          courseId: 'tagalog-basic',
          courseName: 'Tagalog Basics'
        },
        {
          id: 'activity_2',
          type: 'course_enrolled',
          description: 'Enrolled in English Basics course',
          timestamp: new Date().toISOString(),
          courseId: 'english-basic',
          courseName: 'English Basics'
        }
      ]
    }
  ]
}

localStorage.setItem('learningActivity', JSON.stringify(learningActivity))
console.log('✅ Learning activity restored')

// 4. Restore assessment results
const assessmentResults = []
localStorage.setItem('assessment_results', JSON.stringify(assessmentResults))
console.log('✅ Assessment results restored')

// 5. Restore user settings
const appearanceSettings = {
  theme: 'light',
  fontSize: 'medium',
  colorScheme: 'default'
}
localStorage.setItem('appearance-settings', JSON.stringify(appearanceSettings))

const notificationSettings = {
  email: true,
  push: true,
  reminders: true
}
localStorage.setItem('notification-settings', JSON.stringify(notificationSettings))

const languageRegionSettings = {
  language: 'en',
  region: 'US',
  timezone: 'UTC',
  currency: 'USD'
}
localStorage.setItem('language-region-settings', JSON.stringify(languageRegionSettings))
console.log('✅ User settings restored')

// 6. Restore welcome message flag
localStorage.setItem('show_welcome_message', 'true')
console.log('✅ Welcome message flag restored')

console.log('🎉 All application data has been restored!')
console.log('📚 You now have 2 enrolled courses: Tagalog Basics and English Basics')
console.log('🔄 Refresh the page to see the restored data')

// Show what was restored
console.log('\n📋 Restored Data Summary:')
console.log('- Enrolled Courses:', enrolledCourses.length)
console.log('- Course Progress:', Object.keys(userProgress).length, 'courses')
console.log('- Learning Activities:', learningActivity['student@example.com'][0].activities.length, 'activities')
console.log('- Assessment Results:', assessmentResults.length, 'results')
console.log('- User Settings:', '3 categories')
