import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const skills = [
  // Data Science
  { name: "Python", level: 95, category: "data-science" },
  { name: "pandas", level: 60, category: "data-science" },
  { name: "NumPy", level: 60, category: "data-science" },
  { name: "Matplotlib", level: 60, category: "data-science" },
  { name: "Scikit-learn", level: 60, category: "data-science" },
  { name: "Power BI", level: 70, category: "data-science" },
  { name: "Advanced Excel", level: 85, category: "data-science" },

  // Programming
  { name: "C/C++", level: 65, category: "programming" },
  { name: "Java", level: 80, category: "programming" },
  { name: "FastAPI", level: 75, category: "programming" },
  { name: "Django", level: 40, category: "programming" },
  { name: "Web Scraping", level: 80, category: "programming" },

  // Tools & DevOps
  { name: "Git/GitHub", level: 90, category: "tools" },
  { name: "Docker", level: 65, category: "tools" },
  { name: "Postman", level: 80, category: "tools" },
  { name: "Linux/Bash", level: 55, category: "tools" },

  // Domain Knowledge
  { name: "Complex Systems Modeling", level: 60, category: "research" },
  { name: "Econophysics", level: 55, category: "research" },
  { name: "Machine Learning", level: 70, category: "research" },
  { name: "Business Process Modeling", level: 85, category: "research" },
  { name: "Market Research", level: 85, category: "research" },

  // Languages
  { name: "Persian", level: 100, category: "languages" },
  { name: "English", level: 100, category: "languages" },
  { name: "French", level: 85, category: "languages" },
  { name: "Spanish", level: 75, category: "languages" },
  { name: "Russian", level: 40, category: "languages" },
];

export const SkillsSection = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = ["all", "data-science", "programming", "tools", "research", "languages"];
  const categoryTranslationKeys = {
    "all": "all",
    "data-science": "dataScience",
    "programming": "programming",
    "tools": "tools",
    "research": "research",
    "languages": "languages"
  };

  const filteredSkills = skills.filter(
    (skill) => activeCategory === "all" || skill.category === activeCategory
  );
  
  const itemsPerRow = 3; // Number of items in one row
  const displayedSkills = isExpanded ? filteredSkills : filteredSkills.slice(0, itemsPerRow);
  return (
    <section id="skills" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          {t("skills.title")} <span className="text-primary">{t("skills.skills")}</span>
        </h2>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category, key) => (
            <button
              key={key}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-5 py-2 rounded-full transition-colors duration-300 capitalize",
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/70 text-forefround hover:bd-secondary"
              )}
            >
              {t(`skills.categories.${categoryTranslationKeys[category]}`)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedSkills.map((skill, key) => (
            <div
              key={key}
              className="bg-card p-6 rounded-lg shadow-xs card-hover"
            >
              <div className="text-left mb-4">
                <h3 className="font-semibold text-lg"> {skill.name}</h3>
              </div>
              <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full origin-left animate-[grow_1.5s_ease-out]"
                  style={{ width: skill.level + "%" }}
                />
              </div>

              <div className="text-right mt-1">
                <span className="text-sm text-muted-foreground">
                  {skill.level}%
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
