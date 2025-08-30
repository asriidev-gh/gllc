'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { 
  Video, 
  Brain, 
  Users, 
  Trophy, 
  BookOpen, 
  Target,
  Smartphone,
  BarChart3
} from 'lucide-react'

export function FeaturesSection() {
  const { t } = useLanguage()

  const features = [
    {
      icon: Video,
      title: t('features.video.title'),
      description: t('features.video.description'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Brain,
      title: t('features.ai.title'),
      description: t('features.ai.description'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Users,
      title: t('features.groups.title'),
      description: t('features.groups.description'),
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Trophy,
      title: t('features.achievements.title'),
      description: t('features.achievements.description'),
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: BookOpen,
      title: t('features.personalized.title'),
      description: t('features.personalized.description'),
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Target,
      title: t('features.progress.title'),
      description: t('features.progress.description'),
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: Smartphone,
      title: t('features.mobile.title'),
      description: t('features.mobile.description'),
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: BarChart3,
      title: t('features.analytics.title'),
      description: t('features.analytics.description'),
      color: 'from-orange-500 to-orange-600'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('features.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Icon Background */}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('features.global.title')}
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              {t('features.global.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="badge badge-primary">{t('features.badges.age')}</span>
              <span className="badge badge-secondary">{t('features.badges.cultural')}</span>
              <span className="badge badge-success">{t('features.badges.local')}</span>
              <span className="badge badge-warning">{t('features.badges.values')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
