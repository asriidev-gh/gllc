// Shared utility for recording learning activities across the application

export interface LearningActivity {
  action: string
  details: string
  timestamp: string
}

export interface DayActivity {
  date: string
  actions: LearningActivity[]
}

export interface UserLearningActivity {
  [email: string]: DayActivity[]
}

// Record a learning activity for a user
export const recordLearningActivity = (userEmail: string, action: string, details: string): void => {
  if (!userEmail) return
  
  const today = new Date().toISOString().split('T')[0]
  
  // Check session storage to prevent duplicates within the same browser session
  const sessionKey = `${userEmail}_${action}_${details}`
  if (sessionStorage.getItem(sessionKey)) {
    console.log('Activity already recorded this session, skipping:', { action, details, date: today, user: userEmail })
    return
  }
  
  const learningActivity: UserLearningActivity = JSON.parse(localStorage.getItem('learningActivity') || '{}')
  const userActivity = learningActivity[userEmail] || []
  
  // Check if we already have activity for today
  const todayActivity = userActivity.find((activity: DayActivity) => activity.date === today)
  
  // Check if this exact action and details was already recorded today
  const alreadyRecorded = todayActivity?.actions?.some((act: LearningActivity) => 
    act.action === action && act.details === details
  )
  
  if (alreadyRecorded) {
    console.log('Activity already recorded today, skipping:', { action, details, date: today, user: userEmail })
    return
  }
  
  if (todayActivity) {
    // Update existing activity
    todayActivity.actions = [...(todayActivity.actions || []), { action, details, timestamp: new Date().toISOString() }]
  } else {
    // Create new activity for today
    userActivity.push({
      date: today,
      actions: [{ action, details, timestamp: new Date().toISOString() }]
    })
  }
  
  // Save back to localStorage
  learningActivity[userEmail] = userActivity
  localStorage.setItem('learningActivity', JSON.stringify(learningActivity))
  
  // Mark as recorded in session storage to prevent duplicates within this session
  sessionStorage.setItem(sessionKey, 'true')
  
  console.log('Learning activity recorded:', { action, details, date: today, user: userEmail })
}

// Record course browsing activity (prevents duplicates)
export const recordCourseBrowsing = (userEmail: string): void => {
  if (!userEmail) return
  
  // Use the main recordLearningActivity function which now has built-in duplicate prevention
  recordLearningActivity(userEmail, 'course_browsing', 'Browsed available courses')
}

// Get user's learning activities
export const getUserLearningActivities = (userEmail: string): DayActivity[] => {
  if (!userEmail) return []
  
  try {
    const learningActivity: UserLearningActivity = JSON.parse(localStorage.getItem('learningActivity') || '{}')
    return learningActivity[userEmail] || []
  } catch (error) {
    console.error('Error loading learning activities:', error)
    return []
  }
}

// Format relative time (e.g., "2 minutes ago", "3 hours ago")
const formatRelativeTime = (timestamp: string): string => {
  const now = new Date()
  const activityTime = new Date(timestamp)
  const diffInMs = now.getTime() - activityTime.getTime()
  
  const seconds = Math.floor(diffInMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) {
    return 'Just now'
  } else if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  } else if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  } else if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`
  } else {
    // For older activities, show the date
    return activityTime.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: activityTime.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

// Get recent activities for a user with date filtering
export const getRecentActivities = (
  userEmail: string, 
  daysToCheck: number = 7, 
  showAll: boolean = false
): Array<LearningActivity & { date: string; displayDate: string }> => {
  if (!userEmail) return []
  
  try {
    const userActivity = getUserLearningActivities(userEmail)
    const recentActivities: Array<LearningActivity & { date: string; displayDate: string }> = []
    const today = new Date()
    
    for (let i = 0; i < daysToCheck; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayActivity = userActivity.find((activity: DayActivity) => activity.date === dateStr)
      if (dayActivity && dayActivity.actions) {
        dayActivity.actions.forEach((action: LearningActivity) => {
          recentActivities.push({
            ...action,
            date: dateStr,
            displayDate: formatRelativeTime(action.timestamp)
          })
        })
      }
    }
    
    // Sort by timestamp (most recent first)
    const sortedActivities = recentActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    // Apply limit based on showAll state
    return showAll ? sortedActivities : sortedActivities.slice(0, 5)
  } catch (error) {
    console.error('Error getting recent activities:', error)
    return []
  }
}

// Clear session storage for a user (useful when logging out)
export const clearUserSession = (userEmail: string): void => {
  if (!userEmail) return
  
  // Clear all session storage keys for this user
  const keysToRemove: string[] = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key && key.startsWith(userEmail + '_')) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => sessionStorage.removeItem(key))
  console.log('Session storage cleared for user:', userEmail)
}
