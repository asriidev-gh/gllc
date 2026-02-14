import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { HeroSection } from '@/components/sections/HeroSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { CoursesSection } from '@/components/sections/CoursesSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { CTASection } from '@/components/sections/CTASection'
import { Header } from '@/components/Header'

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        <FeaturesSection />
        <CoursesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
    </>
  )
}
