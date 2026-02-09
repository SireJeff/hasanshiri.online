'use client'

import { ArrowRight, ExternalLink, Github, Youtube, Container, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getProjects } from "@/lib/actions/projects";
import { getSiteSettings, getExternalLinks } from "@/lib/actions/settings";
import Link from "next/link";

export const ProjectsSection = () => {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [projects, setProjects] = useState([]);
  const [externalLinks, setExternalLinks] = useState(null);
  const [loading, setLoading] = useState(true);

  const locale = i18n.language || 'en';

  // Fetch projects and settings
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [projectsData, settingsData] = await Promise.all([
          getProjects(),
          getSiteSettings()
        ]);

        // Get external links from settings
        const links = await getExternalLinks();
        setExternalLinks(links);

        setProjects(projectsData);
      } catch (error) {
        console.error("Failed to load projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const projectsPerRow = 3;
  const displayedProjects = isExpanded ? projects : projects.slice(0, projectsPerRow);

  if (loading) {
    return (
      <section id="projects" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

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
          {displayedProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-card rounded-lg overflow-hidden shadow-xs card-hover"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={project.featured_image || '/placeholder-project.jpg'}
                  alt={project.title_en}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {(project.tags || []).slice(0, 4).map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 text-xs font-medium border rounded-full bg-secondary text-secondary-foreground"
                    >
                      {tag[`name_${locale}`] || tag.name_en}
                    </span>
                  ))}
                  {(project.tags || []).length > 4 && (
                    <span className="px-2 py-1 text-xs font-medium border rounded-full bg-secondary text-secondary-foreground">
                      +{project.tags.length - 4}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-semibold mb-1">
                  {project[`title_${locale}`] || project.title_en}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {project[`description_${locale}`] || project.description_en}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-3">
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground/80 hover:text-primary transition-colors duration-300"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground/80 hover:text-primary transition-colors duration-300"
                      >
                        <Github size={20} />
                      </a>
                    )}
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

        {/* External Links Section - now from database */}
        <div className="text-center mt-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {externalLinks?.link1?.url && (
              <a
                className="cosmic-button w-fit flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
                href={externalLinks.link1.url}
              >
                {externalLinks.link1.icon === 'github' && <Github size={16} />}
                {externalLinks.link1.icon === 'youtube' && <Youtube size={16} />}
                {externalLinks.link1.icon === 'container' && <Container size={16} />}
                {externalLinks.link1.icon === 'book' && <BookOpen size={16} />}
                {externalLinks.link1[`name_${locale}`] || externalLinks.link1.name_en}
                <ArrowRight size={16} />
              </a>
            )}
            {externalLinks?.link2?.url && (
              <a
                className="cosmic-button w-fit flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
                href={externalLinks.link2.url}
              >
                {externalLinks.link2.icon === 'github' && <Github size={16} />}
                {externalLinks.link2.icon === 'youtube' && <Youtube size={16} />}
                {externalLinks.link2.icon === 'container' && <Container size={16} />}
                {externalLinks.link2.icon === 'book' && <BookOpen size={16} />}
                {externalLinks.link2[`name_${locale}`] || externalLinks.link2.name_en}
                <ArrowRight size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
