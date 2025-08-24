'use client'

import { motion } from 'framer-motion'
import { Trophy, Star, Target, BookOpen, Clock, Award, Medal, Crown, Globe, MessageCircle, Headphones } from 'lucide-react'
import { Header } from '@/components/Header'
import { useAuthStore } from '@/stores'

export default function AchievementsPage() {
  const { user } = useAuthStore()

  // Mock achievements data - in a real app, this would come from the store
  const achievements = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: Star,
      color: 'bg-yellow-100 text-yellow-800',
      unlocked: true,
      unlockedAt: '2024-01-15',
      progress: 100
    },
    {
      id: 2,
      title: 'Language Explorer',
      description: 'Enroll in 3 different language courses',
      icon: Globe,
      color: 'bg-blue-100 text-blue-800',
      unlocked: true,
      unlockedAt: '2024-01-20',
      progress: 100
    },
    {
      id: 3,
      title: 'Dedicated Learner',
      description: 'Complete 10 lessons in a week',
      icon: Clock,
      color: 'bg-green-100 text-green-800',
      unlocked: true,
      unlockedAt: '2024-01-25',
      progress: 100
    },
    {
      id: 4,
      title: 'Grammar Master',
      description: 'Score 90%+ on 5 grammar assessments',
      icon: BookOpen,
      color: 'bg-purple-100 text-purple-800',
      unlocked: false,
      progress: 60
    },
    {
      id: 5,
      title: 'Conversation Starter',
      description: 'Complete 20 speaking exercises',
      icon: MessageCircle,
      color: 'bg-pink-100 text-pink-800',
      unlocked: false,
      progress: 35
    },
    {
      id: 6,
      title: 'Polyglot',
      description: 'Achieve intermediate level in 3 languages',
      icon: Crown,
      color: 'bg-red-100 text-red-800',
      unlocked: false,
      progress: 25
    }
  ]

  const badges = [
    { id: 1, name: 'Early Bird', icon: Star, color: 'bg-yellow-500', unlocked: true },
    { id: 2, name: 'Weekend Warrior', icon: Clock, color: 'bg-blue-500', unlocked: true },
    { id: 3, name: 'Grammar Guru', icon: BookOpen, color: 'bg-purple-500', unlocked: false },
    { id: 4, name: 'Speaking Star', icon: MessageCircle, color: 'bg-pink-500', unlocked: false },
    { id: 5, name: 'Listening Pro', icon: Headphones, color: 'bg-green-500', unlocked: true },
    { id: 6, name: 'Vocabulary Builder', icon: Target, color: 'bg-indigo-500', unlocked: false }
  ]

  const stats = [
    { label: 'Total Lessons', value: '0', icon: BookOpen, color: 'text-blue-600' },
    { label: 'Study Streak', value: '0 days', icon: Clock, color: 'text-green-600' },
    { label: 'Languages', value: '0', icon: Globe, color: 'text-purple-600' },
    { label: 'Achievement Rate', value: '0%', icon: Trophy, color: 'text-yellow-600' }
  ]

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Please sign in to view your achievements</h1>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Achievements</h1>
            <p className="text-xl text-gray-600">Track your progress and celebrate your language learning milestones</p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-sm border p-6 text-center"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
                  <span className="text-sm text-gray-600">
                    {achievements.filter(a => a.unlocked).length} of {achievements.length} unlocked
                  </span>
                </div>

                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      className={`p-4 rounded-lg border transition-all ${
                        achievement.unlocked 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${achievement.color}`}>
                          <achievement.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`font-semibold ${
                              achievement.unlocked ? 'text-green-800' : 'text-gray-700'
                            }`}>
                              {achievement.title}
                            </h3>
                            {achievement.unlocked && (
                              <span className="text-xs text-green-600 font-medium">
                                Unlocked {achievement.unlockedAt}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                          
                          {!achievement.unlocked && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${achievement.progress}%` }}
                              />
                            </div>
                          )}
                          
                          {!achievement.unlocked && (
                            <p className="text-xs text-gray-500 mt-1">
                              {achievement.progress}% complete
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Badges</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  {badges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      className={`text-center p-4 rounded-lg transition-all ${
                        badge.unlocked 
                          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200' 
                          : 'bg-gray-50 border-2 border-gray-200'
                      }`}
                    >
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                        badge.unlocked ? badge.color : 'bg-gray-300'
                      }`}>
                        <badge.icon className={`w-6 h-6 ${
                          badge.unlocked ? 'text-white' : 'text-gray-500'
                        }`} />
                      </div>
                      <h3 className={`text-sm font-medium ${
                        badge.unlocked ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {badge.name}
                      </h3>
                      {badge.unlocked && (
                        <span className="text-xs text-green-600 font-medium">Unlocked!</span>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Unlocked "First Steps" achievement</span>
                      <span className="text-gray-400">2 days ago</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">Completed 5 lessons in Spanish</span>
                      <span className="text-gray-400">1 week ago</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600">Achieved 7-day study streak</span>
                      <span className="text-gray-400">2 weeks ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Motivation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white"
          >
            <Award className="w-16 h-16 mx-auto mb-4 text-blue-200" />
            <h2 className="text-2xl font-bold mb-4">Keep Up the Great Work!</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              You're making excellent progress in your language learning journey. 
              Every lesson completed brings you closer to fluency!
            </p>
            <div className="flex justify-center space-x-4">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Continue Learning
              </button>
              <button className="px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
                Set New Goals
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
