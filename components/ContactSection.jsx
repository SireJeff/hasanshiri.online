'use client'

import {
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
  Twitter,
  Youtube,
} from "lucide-react";
import { TelegramIcon } from "./icons/TelegramIcon";
import { WhatsappIcon } from "./icons/WhatsappIcon";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import emailjs from '@emailjs/browser';

export const ContactSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // EmailJS configuration from environment variables
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS configuration missing. Please check your environment variables.');
      }

      const result = await emailjs.sendForm(
        serviceId,
        templateId,
        e.target,
        publicKey
      );

      toast({
        title: t("contact.toast.success"),
        description: t("contact.toast.successDescription"),
      });
      
      // Reset form
      e.target.reset();
      
    } catch (error) {
      console.error('EmailJS error:', error);
      toast({
        title: t("contact.toast.error"),
        description: t("contact.toast.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section id="contact" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {t("contact.title")} <span className="text-primary">{t("contact.touch")}</span>
        </h2>

        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          {t("contact.description")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h3 className="text-2xl font-semibold mb-6">
              {t("contact.contactInformation")}
            </h3>

            <div className="space-y-6 justify-center">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />{" "}
                </div>
                <div>
                  <h4 className="font-medium">{t("contact.email")}</h4>
                  <a
                    href="mailto:sandmanshiri@gmail.com"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    sandmanshiri@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />{" "}
                </div>
                <div>
                  <h4 className="font-medium">{t("contact.phone")}</h4>
                  <a
                    href="tel:+989130876341"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    +98 913 087 6341
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />{" "}
                </div>
                <div>
                  <h4 className="font-medium">{t("contact.location")}</h4>
                  <a className="text-muted-foreground hover:text-primary transition-colors">
                    {t("contact.locationValue")}
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <h4 className="font-medium mb-4">{t("contact.connectWithMe")}</h4>
              <div className="flex space-x-4 justify-center">
                <a href="https://www.linkedin.com/in/mohammad-hasan-shiri-35b21119a" target="_blank">
                  <Linkedin />
                </a>
                <a href="https://x.com/jeffthedeafreff" target="_blank">
                  <Twitter />
                </a>
                <a href="https://www.instagram.com/mhasanshiri/" target="_blank">
                  <Instagram />
                </a>
                <a href="https://t.me/sire_jeff" target="_blank">
                  <TelegramIcon />
                </a>
                <a href="https://wa.me/989209954805" target="_blank">
                  <WhatsappIcon />
                </a>
                <a href="https://www.youtube.com/@Chadminus/videos?app=desktop" target="_blank">
                  <Youtube className="text-foreground hover:text-primary transition-colors" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-card p-8 rounded-lg shadow-xs">
            <h3 className="text-2xl font-semibold mb-6">{t("contact.sendMessage")}</h3>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                >
                  {t("contact.form.name")}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-hidden foucs:ring-2 focus:ring-primary"
                  placeholder={t("contact.form.namePlaceholder")}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  {t("contact.form.email")}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-hidden foucs:ring-2 focus:ring-primary"
                  placeholder={t("contact.form.emailPlaceholder")}
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2"
                >
                  {t("contact.form.message")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-hidden foucs:ring-2 focus:ring-primary resize-none"
                  placeholder={t("contact.form.messagePlaceholder")}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "cosmic-button w-full flex items-center justify-center gap-2"
                )}
              >
                {isSubmitting ? t("contact.form.sending") : t("contact.form.sendMessage")}
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
