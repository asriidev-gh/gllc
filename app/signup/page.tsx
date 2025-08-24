import SignupForm from '@/components/SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="text-gray-600 mt-2">Join our global language learning community</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
