'use client'

import { Header } from '@/components/Header'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AboutPage() {
  const { t } = useLanguage()
  
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('about.page.title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('about.page.subtitle')}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('about.page.mission.title')}</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {t('about.page.mission.description')}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('about.page.different.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('about.page.different.ai.title')}</h3>
                <p className="text-gray-600">
                  {t('about.page.different.ai.description')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('about.page.different.cultural.title')}</h3>
                <p className="text-gray-600">
                  {t('about.page.different.cultural.description')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('about.page.different.community.title')}</h3>
                <p className="text-gray-600">
                  {t('about.page.different.community.description')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('about.page.different.flexible.title')}</h3>
                <p className="text-gray-600">
                  {t('about.page.different.flexible.description')}
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('about.page.story.title')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('about.page.story.description')}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
