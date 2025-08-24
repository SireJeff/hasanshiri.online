import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export const SEOHead = ({ 
  ogImage = "/your-photo.jpg",
  url = "https://hasanshiri.online"
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const siteTitle = t('seo.siteTitle');
  const metaDescription = t('seo.siteDescription');
  const defaultKeywords = t('seo.keywords');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={defaultKeywords} />
      <meta name="author" content="Mohammad Hassan Shiri" />
      <meta name="language" content={currentLang} />
      <html lang={currentLang} dir={currentLang === 'fa' ? 'rtl' : 'ltr'} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content={currentLang === 'fa' ? 'fa_IR' : 'en_US'} />
      {currentLang === 'fa' && <meta property="og:locale:alternate" content="en_US" />}
      {currentLang === 'en' && <meta property="og:locale:alternate" content="fa_IR" />}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content="@jeffthedeafreff" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={url} />
      
      {/* Multilingual Tags */}
      <link rel="alternate" hrefLang="fa" href={`${url}?lang=fa`} />
      <link rel="alternate" hrefLang="en" href={`${url}?lang=en`} />
      <link rel="alternate" hrefLang="x-default" href={url} />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Mohammad Hassan Shiri",
          "alternateName": ["محمدحسن شیری", "Hasan Shiri", "MHS", "حسن شیری", "Mohamad Hasan Shiri", "Muhamed Hasan Shiri", "محمد حسن شیری"],
          "url": url,
          "image": ogImage,
          "sameAs": [
            "https://www.linkedin.com/in/mohammad-hasan-shiri-35b21119a",
            "https://github.com/SireJeff",
            "https://x.com/jeffthedeafreff",
            "https://www.instagram.com/sire_jeff_/",
            "https://t.me/sire_jeff"
          ],
          "jobTitle": currentLang === 'fa' ? "محقق و دیتا ساینتیست" : "Researcher and Data Scientist",
          "worksFor": {
            "@type": "Organization",
            "name": currentLang === 'fa' ? "دانشگاه صنعتی شریف" : "Sharif University of Technology"
          },
          "alumniOf": [
            {
              "@type": "Organization",
              "name": currentLang === 'fa' ? "دانشگاه اصفهان" : "University of Isfahan"
            },
            {
              "@type": "Organization", 
              "name": currentLang === 'fa' ? "دانشگاه صنعتی شریف" : "Sharif University of Technology"
            }
          ],
          "knowsAbout": [
            "Data Science",
            "Physics",
            "Complex Systems",
            "Machine Learning",
            "Python Programming",
            "Business Analysis"
          ],
          "nationality": "Iran",
          "email": "sandmanshiri@gmail.com",
          "telephone": "+98-913-087-6341"
        })}
      </script>
    </Helmet>
  );
};
