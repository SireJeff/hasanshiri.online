'use client'

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getSkillsGroupedByCategory } from "@/lib/actions/skills";

export const SkillsSection = () => {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);
  const [skillsData, setSkillsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch skills from database
  useEffect(() => {
    async function loadSkills() {
      setLoading(true);
      try {
        const data = await getSkillsGroupedByCategory();
        setSkillsData(data);
      } catch (error) {
        console.error("Failed to load skills:", error);
        setSkillsData([]);
      } finally {
        setLoading(false);
      }
    }
    loadSkills();
  }, []);

  // Get locale for language selection
  const locale = i18n.language || 'en';

  // Flatten skills for filtering
  const allSkills = skillsData.flatMap(group => group.skills);

  // Get unique categories
  const categories = ["all", ...skillsData.map(g => g.category?.slug || 'uncategorized')];
  const categoryTranslationKeys = {
    "all": "all",
    "data-science": "dataScience",
    "programming": "programming",
    "tools": "tools",
    "research": "research",
    "languages": "languages",
    "uncategorized": "all"
  };

  const filteredSkills = allSkills.filter(
    (skill) => activeCategory === "all" || skill.category?.slug === activeCategory
  );

  const itemsPerRow = 3;
  const displayedSkills = isExpanded ? filteredSkills : filteredSkills.slice(0, itemsPerRow);

  if (loading) {
    return (
      <section id="skills" className="py-24 px-4 relative bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          {t("skills.title")} <span className="text-primary">{t("skills.skills")}</span>
        </h2>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-5 py-2 rounded-full transition-colors duration-300 capitalize",
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/70 text-foreground hover:bg-secondary"
              )}
            >
              {category === 'all'
                ? t('skills.categories.all')
                : skillsData.find(g => g.category?.slug === category)?.category?.[`name_${locale}`] || category
              }
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedSkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-card p-6 rounded-lg shadow-xs card-hover"
            >
              <div className="text-left mb-4">
                <h3 className="font-semibold text-lg">
                  {skill[`name_${locale}`] || skill.name_en}
                </h3>
              </div>
              <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full origin-left animate-[grow_1.5s_ease-out]"
                  style={{ width: `${skill.proficiency_level || 0}%` }}
                />
              </div>

              <div className="text-right mt-1">
                <span className="text-sm text-muted-foreground">
                  {skill.proficiency_level || 0}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredSkills.length > itemsPerRow && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {isExpanded ? t('common.showLess') : t('common.showMore')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
