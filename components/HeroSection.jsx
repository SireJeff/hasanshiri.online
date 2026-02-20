'use client'

import { useTranslation } from "react-i18next";

export const HeroSection = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';

  return (
    <section
      id="hero"
      className="relative py-24 md:py-32 flex flex-col items-center justify-center px-4"
    >
      <div className="container max-w-4xl mx-auto text-center z-10">
        <div className="space-y-8">
          {/* Visually hidden H1 for SEO and accessibility */}
          <h1 className="sr-only">
            {t("about.heroSubtitle")} - {t("about.heroDescription")}
          </h1>

          {/* Quote Part 1 - visible main heading */}
          <p
            className="text-xl md:text-2xl lg:text-3xl font-medium text-foreground leading-relaxed opacity-0 animate-fade-in"
            dir={isRtl ? 'rtl' : 'ltr'}
            aria-hidden="true"
          >
            {t("hero.quotePart1")}
          </p>

          {/* Quote Part 2 */}
          <p
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground italic leading-relaxed opacity-0 animate-fade-in-delay-1"
            dir={isRtl ? 'rtl' : 'ltr'}
            aria-hidden="true"
          >
            {t("hero.quotePart2")}
          </p>

          {/* Author Attribution */}
          <p
            className="text-sm md:text-base text-muted-foreground/70 opacity-0 animate-fade-in-delay-2"
            dir={isRtl ? 'rtl' : 'ltr'}
            aria-hidden="true"
          >
            {t("hero.author")}
          </p>
        </div>
      </div>
    </section>
  );
};
