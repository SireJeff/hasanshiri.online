import { Navbar } from "../components/Navbar";
import { StarBackground } from "@/components/StarBackground";
import { HeroSection } from "../components/HeroSection";
import { AboutSection } from "../components/AboutSection";
import { SkillsSection } from "../components/SkillsSection";
import { ProjectsSection } from "../components/ProjectsSection";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";
import { SEOHead } from "../components/SEOHead";

export const Home = () => {
  return (
    <div className="relative min-h-screen text-foreground overflow-x-hidden">
      <SEOHead />
      
      <StarBackground />
      
      {/* Content */}
      <div className="relative z-[1]">
        {/* Navbar */}
        <Navbar />
        
        {/* Photo Frame - Circular frame at top center */}
        <div className="container mx-auto px-4">
          <div className="flex justify-center pt-32 -mb-16">
            <div className="w-64 h-64 rounded-full border-4 border-primary bg-card shadow-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/your-photo.jpg" 
                alt="Mohammad Hassan Shiri" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="text-lg text-muted-foreground text-center" style={{display: 'none'}}>
                Your Photo
                <br />
                Here
              </div>
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
  );
};
