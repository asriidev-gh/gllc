import { Header } from '@/components/Header'

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              About Global Language Training Center
            </h1>
            <p className="text-xl text-gray-600">
              Empowering learners worldwide to master new languages through innovative technology and cultural immersion.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We believe that language learning should be accessible, engaging, and culturally enriching. 
              Our platform combines cutting-edge AI technology with traditional language learning methods 
              to create a unique and effective learning experience.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">What Makes Us Different</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Learning</h3>
                <p className="text-gray-600">
                  Personalized learning paths and assessments powered by advanced AI technology.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cultural Context</h3>
                <p className="text-gray-600">
                  Learn languages with deep cultural understanding and real-world context.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Community</h3>
                <p className="text-gray-600">
                  Connect with learners from around the world and practice with native speakers.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Learning</h3>
                <p className="text-gray-600">
                  Study at your own pace with 24/7 access to course materials and resources.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 leading-relaxed">
              Founded with a vision to break down language barriers and foster global understanding, 
              Global Language Training Center has grown from a small startup to a comprehensive 
              language learning platform serving thousands of students worldwide.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
