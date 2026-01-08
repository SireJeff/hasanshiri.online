'use client'

import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fa' : 'en';
    i18n.changeLanguage(newLang);
    
    // Update document direction for Persian (RTL)
    document.dir = newLang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-300",
        "bg-secondary/70 hover:bg-secondary text-foreground",
        "border border-border hover:border-primary/50"
      )}
      title={i18n.language === 'en' ? 'Switch to Persian' : 'Switch to English'}
    >
      <Globe size={18} />
      <span className="text-sm font-medium">
        {i18n.language === 'en' ? 'فا' : 'EN'}
      </span>
    </button>
  );
};
