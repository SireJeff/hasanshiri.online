'use client'

import { Navbar } from '@/components/Navbar'
import { StarBackground } from '@/components/StarBackground'
import { HeroSection } from '@/components/HeroSection'
import { AboutSection } from '@/components/AboutSection'
import { SkillsSection } from '@/components/SkillsSection'
import { ProjectsSection } from '@/components/ProjectsSection'
import { ContactSection } from '@/components/ContactSection'
import { Footer } from '@/components/Footer'
import { PersonJsonLd, WebSiteJsonLd, OrganizationJsonLd } from '@/components/seo/JsonLd'
import Image from 'next/image'

export function HomePage({ locale = 'en' }) {
  const isRtl = locale === 'fa'

  return (
    <div className="relative min-h-screen text-foreground overflow-x-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* JSON-LD Structured Data */}
      <PersonJsonLd locale={locale} />
      <WebSiteJsonLd locale={locale} />
      <OrganizationJsonLd />

      <StarBackground />

      {/* Content */}
      <div className="relative z-[1]">
        {/* Navbar */}
        <Navbar locale={locale} />

        {/* Photo Frame - Circular frame at top center */}
        <div className="container mx-auto px-4">
          <div className="flex justify-center pt-32 -mb-16">
            <div className="w-64 h-64 rounded-full border-4 border-primary bg-card shadow-lg flex items-center justify-center overflow-hidden">
              <Image
                src="/your-photo.jpg"
                alt={isRtl ? 'محمد حسن شیری' : 'Mohammad Hassan Shiri'}
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
          <HeroSection locale={locale} />
          <AboutSection locale={locale} />
          <SkillsSection locale={locale} />
          <ProjectsSection locale={locale} />
          <ContactSection locale={locale} />
        </main>

        {/* Footer */}
        <Footer locale={locale} />
      </div>
    </div>
  )
}
