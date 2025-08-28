'use client'

import React from 'react'
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  Bookmark,
  Play
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { VideoLesson, CourseTopic } from '@/types/course'

interface CourseSidebarProps {
  topics: CourseTopic[]
  currentLesson: VideoLesson | null
  showSidebar: boolean
  onToggleSidebar: () => void
  onSelectLesson: (lesson: VideoLesson) => void
  onMarkLessonAsWatched: (lessonId: string) => void
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
  topics,
  currentLesson,
  showSidebar,
  onToggleSidebar,
  onSelectLesson,
  onMarkLessonAsWatched
}) => {
  const [expandedTopics, setExpandedTopics] = React.useState<Set<string>>(new Set(['topic_1']))
  const [bookmarkedLessons, setBookmarkedLessons] = React.useState<Set<string>>(new Set())

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId)
    } else {
      newExpanded.add(topicId)
    }
    setExpandedTopics(newExpanded)
  }

  const toggleBookmark = (lessonId: string) => {
    const newBookmarked = new Set(bookmarkedLessons)
    if (newBookmarked.has(lessonId)) {
      newBookmarked.delete(lessonId)
    } else {
      newBookmarked.add(lessonId)
    }
    setBookmarkedLessons(newBookmarked)
  }

  if (!showSidebar) {
    return null
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Course Content</h2>
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-4">
          {topics.map((topic) => (
            <div key={topic.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleTopic(topic.id)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{topic.title}</h3>
                  <p className="text-sm text-gray-600">{topic.description}</p>
                </div>
                {expandedTopics.has(topic.id) ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedTopics.has(topic.id) && (
                <div className="border-t border-gray-200 p-4">
                  <div className="space-y-3">
                    {topic.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3 flex-1">
                          {lesson.isWatched ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{lesson.title}</p>
                            <p className="text-sm text-gray-500">{lesson.duration}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => onSelectLesson(lesson)}
                            size="sm"
                            variant="outline"
                            className={currentLesson?.id === lesson.id ? 'bg-primary-50 border-primary-200 text-primary-700' : ''}
                          >
                            {currentLesson?.id === lesson.id ? 'Current' : 'Select'}
                          </Button>
                          
                          <Button
                            onClick={() => toggleBookmark(lesson.id)}
                            size="sm"
                            variant="ghost"
                            className={bookmarkedLessons.has(lesson.id) ? 'text-yellow-600' : 'text-gray-400'}
                          >
                            <Bookmark className={`w-4 h-4 ${bookmarkedLessons.has(lesson.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

