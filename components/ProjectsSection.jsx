'use client'

import { ArrowRight, ExternalLink, Github, Youtube, Container, BookOpen } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const projects = [
  {
    id: 1,
    title: "PROJECT-LIBERTAD",
    descriptionKey: "projectLibertad",
    image: "/projects/project1.png",
    tags: ["python", "docker", "automation", "telegram", "mtproto", "web-scraping", "smtp", "vmess", "telethon", "proxy-scraper", "vless", "runonflux"],
    demoUrl: "https://github.com/SireJeff/interpolationTechniques",
    githubUrl: "https://github.com/SireJeff/interpolationTechniques",
  },
  {
    id: 2,
    title: "interpolationTechniques",
    descriptionKey: "interpolationTechniques",
    image: "/projects/project2.png",
    tags: ["python", "interpolation", "spline", "newtonian"],
    demoUrl: "https://github.com/SireJeff/interpolationTechniques",
    githubUrl: "https://github.com/SireJeff/interpolationTechniques",
  },
  {
    id: 3,
    title: "Restaurant_data_analysis",
    descriptionKey: "restaurantDataAnalysis",
    image: "/projects/project3.jpg",
    tags: ["Python", "Pandas", "Data Analysis"],
    demoUrl: "https://github.com/SireJeff/Restaurant_data_analysis",
    githubUrl: "https://github.com/SireJeff/Restaurant_data_analysis",
  },
  {
    id: 4,
    title: "decentralized containerized ssh vpn on runonflux platform",
    descriptionKey: "sshVpn",
    image: "/projects/project4.jpg",
    tags: ["Python", "Docker", "SSH", "VPN", "RunOnFlux"],
    demoUrl: "https://github.com/SireJeff/fluxssh",
    githubUrl: "https://github.com/SireJeff/fluxssh",
  },
  {
    id: 5,
    title: "NASTA",
    descriptionKey: "nasta",
    image: "/projects/project5.jpg",
    tags: ["Python", "Data Analysis", "NASA"],
    demoUrl: "https://github.com/SireJeff/Nasta",
    githubUrl: "https://github.com/SireJeff/Nasta",
  },
  {
    id: 6,
    title: "TG_reminder",
    descriptionKey: "tgReminder",
    image: "/projects/project6.png",
    tags: ["Python", "Telegram", "Reminders"],
    demoUrl: "https://github.com/SireJeff/TG_reminder",
    githubUrl: "https://github.com/SireJeff/TG_reminder",
  },
  {
    id: 7,
    title: "oscilation_simulation",
    descriptionKey: "oscillationSimulation",
    image: "/projects/project7.png",
    tags: ["computational-physics", "wave-simulation", "mass-spring-systems", "coupled-oscillators", "normal-modes", "python", "numpy", "scipy", "matplotlib"],
    demoUrl: "https://github.com/SireJeff/oscilation_simulation",
    githubUrl: "https://github.com/SireJeff/oscilation_simulation",
  },
  {
    id: 8,
    title: "SKM construction company website",
    descriptionKey: "skmWebsite",
    image: "/projects/project8.png",
    tags: ["web-development", "react", "tailwind-css", "javascript"],
    demoUrl: "https://skm-co.ir",
    githubUrl: "https://github.com/SireJeff/skm-co",
  },
  {
    id: 9,
    title: "UISSF - Universal Interconnected Systems of Smart Faculties",
    descriptionKey: "uissf",
    image: "/projects/project9.png",
    tags: ["distributed-systems", "p2p-storage", "augmented-reality", "indoor-positioning", "smart-campus", "iot", "computer-vision", "research-proposal"],
    demoUrl: "https://github.com/SireJeff/UISSF",
    githubUrl: "https://github.com/SireJeff/UISSF",
  },
];

export const ProjectsSection = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const projectsPerRow = 3; // Display 3 projects in the first row
  const displayedProjects = isExpanded ? projects : projects.slice(0, projectsPerRow);
  
  return (
    <section id="projects" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {t("projects.title")} <span className="text-primary">{t("projects.projects")}</span>
        </h2>

        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          {t("projects.description")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProjects.map((project, key) => (
            <div
              key={key}
              className="group bg-card rounded-lg overflow-hidden shadow-xs card-hover"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, index) => (
                    <span 
                      key={`${project.id}-${index}`}
                      className="px-2 py-1 text-xs font-medium border rounded-full bg-secondary text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="text-xl font-semibold mb-1"> {project.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {t(`projects.projectDescriptions.${project.descriptionKey}`)}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-3">
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      className="text-foreground/80 hover:text-primary transition-colors duration-300"
                    >
                      <ExternalLink size={20} />
                    </a>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      className="text-foreground/80 hover:text-primary transition-colors duration-300"
                    >
                      <Github size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {projects.length > projectsPerRow && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {isExpanded ? t('common.showLess') : t('common.showMore')}
            </button>
          </div>
        )}

        <div className="text-center mt-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              className="cosmic-button w-fit flex items-center gap-2"
              target="_blank"
              href="https://github.com/SireJeff"
            >
              <Github size={16} />
              {t("projects.checkGithub")} <ArrowRight size={16} />
            </a>
            <a
              className="cosmic-button w-fit flex items-center gap-2"
              target="_blank"
              href="https://www.youtube.com/@Chadminus/videos?app=desktop"
            >
              <Youtube size={16} />
              {t("projects.watchVideos")} <ArrowRight size={16} />
            </a>
            <a
              className="cosmic-button w-fit flex items-center gap-2"
              target="_blank"
              href="https://hub.docker.com/u/sandmanshiri"
            >
              <Container size={16} />
              {t("projects.viewDockerImages")} <ArrowRight size={16} />
            </a>
            <a
              className="cosmic-button w-fit flex items-center gap-2"
              target="_blank"
              href="https://virgool.io/@sandmanshiri"
            >
              <BookOpen size={16} />
              {t("projects.readMyArticles")} <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
