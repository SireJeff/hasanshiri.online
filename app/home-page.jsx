'use client'

import { Navbar } from '@/components/Navbar'
import { StarBackground } from '@/components/StarBackground'
import { HeroSection } from '@/components/HeroSection'
import { AboutSection } from '@/components/AboutSection'
import { SkillsSection } from '@/components/SkillsSection'
import { ProjectsSection } from '@/components/ProjectsSection'
import { ContactSection } from '@/components/ContactSection'
import { Footer } from '@/components/Footer'
import Image from 'next/image'

export function HomePage() {
  return (
    <div className="relative min-h-screen text-foreground overflow-x-hidden">
      <StarBackground />

      {/* Content */}
      <div className="relative z-[1]">
        {/* Navbar */}
        <Navbar />

        {/* Photo Frame - Circular frame at top center */}
        <div className="container mx-auto px-4">
          <div className="flex justify-center pt-32 -mb-16">
            <div className="w-64 h-64 rounded-full border-4 border-primary bg-card shadow-lg flex items-center justify-center overflow-hidden">
              <Image
                src="/your-photo.jpg"
                alt="Mohammad Hassan Shiri"
                width={256}
                height={256}
                className="w-full h-full object-cover rounded-full"
                priority
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main>
          <HeroSection />
          <AboutSection />
          <SkillsSection />
          <ProjectsSection />
          <ContactSection />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
