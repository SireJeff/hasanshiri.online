'use client'

import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { ThemeColorToggle } from "./ThemeColorToggle";

export const Navbar = ({ locale = 'en' }) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Determine if we're on the homepage
  const isHomePage = pathname === `/${locale}` || pathname === '/';

  const navItems = [
    { name: t("nav.home"), href: isHomePage ? "#hero" : `/${locale}`, isExternal: !isHomePage },
    { name: t("nav.about"), href: isHomePage ? "#about" : `/${locale}#about`, isExternal: !isHomePage },
    { name: t("nav.skills"), href: isHomePage ? "#skills" : `/${locale}#skills`, isExternal: !isHomePage },
    { name: t("nav.projects"), href: isHomePage ? "#projects" : `/${locale}#projects`, isExternal: !isHomePage },
    { name: t("nav.blog"), href: `/${locale}/blog`, isExternal: true },
    { name: t("nav.contact"), href: isHomePage ? "#contact" : `/${locale}#contact`, isExternal: !isHomePage },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <nav
      className={cn(
        "fixed w-full z-40 transition-all duration-300",
        isScrolled ? "py-3 bg-background/80 backdrop-blur-md shadow-xs" : "py-5"
      )}
    >
      <div className="container flex items-center justify-between rtl:flex-row-reverse">
        <a
          className="text-xl font-bold text-primary flex items-center"
          href="#hero"
        >
          <span className="relative z-10">
            <span className="text-glow text-foreground">{t("hero.firstName")}</span>{" "}
            {t("hero.lastName")}
          </span>
        </a>

        {/* desktop nav */}
        <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
          <div className="flex space-x-8 rtl:space-x-reverse">
            {navItems.map((item, key) => (
              item.isExternal ? (
                <Link
                  key={key}
                  href={item.href}
                  className="text-foreground/80 hover:text-primary transition-colors duration-300"
                >
                  {item.name}
                </Link>
              ) : (
                <a
                  key={key}
                  href={item.href}
                  className="text-foreground/80 hover:text-primary transition-colors duration-300"
                >
                  {item.name}
                </a>
              )
            ))}
          </div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <LanguageToggle />
            <ThemeColorToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* mobile nav */}
        <div className="md:hidden flex items-center space-x-3 rtl:space-x-reverse">
          <LanguageToggle />
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="p-2 text-foreground z-50"
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}{" "}
          </button>
        </div>

        <div
          className={cn(
            "fixed inset-0 bg-background/95 backdrop-blur-md z-40 flex flex-col items-center justify-center",
            "transition-all duration-300 md:hidden",
            isMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          )}
        >
          <div className="flex flex-col space-y-8 text-xl">
            {navItems.map((item, key) => (
              item.isExternal ? (
                <Link
                  key={key}
                  href={item.href}
                  className="text-foreground/80 hover:text-primary transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ) : (
                <a
                  key={key}
                  href={item.href}
                  className="text-foreground/80 hover:text-primary transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              )
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
