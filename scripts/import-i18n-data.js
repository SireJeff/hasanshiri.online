/**
 * Import/Onboard Existing i18n Data to CMS
 *
 * This script imports your existing project descriptions and skill categories
 * from the i18n locale files into the Supabase database.
 *
 * Usage:
 *   node scripts/import-i18n-data.js
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables - explicitly load .env.local
dotenv.config({ path: '.env.local' })

// Load JSON files manually
const enLocale = JSON.parse(readFileSync(join(__dirname, '../lib/locales/en.json'), 'utf-8'))
const faLocale = JSON.parse(readFileSync(join(__dirname, '../lib/locales/fa.json'), 'utf-8'))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================
// SKILL CATEGORIES IMPORT
// ============================================

const skillCategoriesData = [
  {
    slug: 'data-science',
    name_en: enLocale.about.dataScience.title,
    name_fa: faLocale.about.dataScience.title,
    description_en: enLocale.about.dataScience.description,
    description_fa: faLocale.about.dataScience.description,
    color: '#3b82f6',
    sort_order: 1
  },
  {
    slug: 'programming',
    name_en: enLocale.about.toolsDevOps.title.replace('Tools & DevOps and ', ''),
    name_fa: faLocale.about.toolsDevOps.title.replace('ابزارها و DevOps و ', ''),
    description_en: enLocale.about.toolsDevOps.description,
    description_fa: faLocale.about.toolsDevOps.description,
    color: '#10b981',
    sort_order: 2
  },
  {
    slug: 'research',
    name_en: enLocale.about.domainKnowledge.title,
    name_fa: faLocale.about.domainKnowledge.title,
    description_en: enLocale.about.domainKnowledge.description,
    description_fa: faLocale.about.domainKnowledge.description,
    color: '#8b5cf6',
    sort_order: 3
  }
]

// ============================================
// SKILLS IMPORT
// ============================================

const skillsData = [
  // Data Science Skills
  {
    slug: 'python',
    name_en: 'Python',
    name_fa: 'پایتون',
    category_slug: 'data-science',
    proficiency_level: 85
  },
  {
    slug: 'pandas',
    name_en: 'Pandas',
    name_fa: 'پانداس',
    category_slug: 'data-science',
    proficiency_level: 80
  },
  {
    slug: 'numpy',
    name_en: 'NumPy',
    name_fa: 'نام‌پای',
    category_slug: 'data-science',
    proficiency_level: 75
  },
  {
    slug: 'matplotlib',
    name_en: 'Matplotlib',
    name_fa: 'مت‌پلات‌لیب',
    category_slug: 'data-science',
    proficiency_level: 75
  },
  {
    slug: 'scikit-learn',
    name_en: 'Scikit-learn',
    name_fa: 'سای‌کیت‌لرن',
    category_slug: 'data-science',
    proficiency_level: 75
  },
  {
    slug: 'power-bi',
    name_en: 'Power BI',
    name_fa: 'پاور بی‌آی',
    category_slug: 'data-science',
    proficiency_level: 70
  },

  // Programming Skills
  {
    slug: 'javascript',
    name_en: 'JavaScript',
    name_fa: 'جاوا‌اسکریپت',
    category_slug: 'programming',
    proficiency_level: 75
  },
  {
    slug: 'docker',
    name_en: 'Docker',
    name_fa: 'داکر',
    category_slug: 'programming',
    proficiency_level: 70
  },
  {
    slug: 'kubernetes',
    name_en: 'Kubernetes',
    name_fa: 'کوبرنتیز',
    category_slug: 'programming',
    proficiency_level: 65
  },

  // Domain Knowledge
  {
    slug: 'market-research',
    name_en: 'Market Research',
    name_fa: 'تحقیقات بازار',
    category_slug: 'research',
    proficiency_level: 80
  },
  {
    slug: 'international-trade',
    name_en: 'International Trade',
    name_fa: 'تجارت بین‌الملل',
    category_slug: 'research',
    proficiency_level: 75
  }
]

// ============================================
// PROJECTS IMPORT
// ============================================

const projectsData = [
  {
    slug: 'libertad',
    title_en: 'Project Libertad',
    title_fa: 'پروژه لیبرتاد',
    description_en: enLocale.projects.projectDescriptions.projectLibertad,
    description_fa: faLocale.projects.projectDescriptions.projectLibertad,
    long_description_en: `A dual-purpose Python project featuring:\n\n- **Dockerized Telegram proxy scraper** with email/group notifications\n- **Secure SSH credentials distribution** script for group members\n\nKey features:\n- Automated scraping with notifications\n- Secure credential management\n- Containerized deployment`,
    long_description_fa: `پروژه چندمنظوره پایتون شامل:\n\n- **اسکرپر پروکسی تلگرام داکرایز شده** با قابلیت اطلاع‌رسانی ایمیل و گروهی\n- **اسکریپت امن توزیع کلیدهای SSH** برای اعضای گروه\n\nویژگی‌های کلیدی:\n- اسکرپ خودکار با اطلاع‌رسانی\n- مدیریت امن اعتبار\n- استقرار کانتینری`,
    github_url: 'https://github.com/SireJeff',
    status: 'active',
    is_featured: true,
    sort_order: 1
  },
  {
    slug: 'interpolation-techniques',
    title_en: 'Interpolation Techniques',
    title_fa: 'تکنیک‌های درون‌یابی',
    description_en: enLocale.projects.projectDescriptions.interpolationTechniques,
    description_fa: faLocale.projects.projectDescriptions.interpolationTechniques,
    long_description_en: `A basic representation of spline and Newtonian interpolation with performance test using Transcendental functions.\n\n**Techniques Implemented:**\n- Spline Interpolation\n- Newtonian Interpolation\n- Performance testing on transcendental functions\n- Built with Python`,
    long_description_fa: `پیاده‌سازی و مقایسه تکنیک‌های درون‌یابی اسپلاین و نیوتنی.\n\n**تکنیک‌های پیاده‌سازی شده:**\n- درون‌یابی اسپلاین\n- درون‌یابی نیوتنی\n- ارزیابی عملکرد روی توابع متعالی\n- پیاده‌سازی شده با پایتون`,
    github_url: 'https://github.com/SireJeff',
    status: 'active',
    is_featured: false,
    sort_order: 2
  },
  {
    slug: 'restaurant-data-analysis',
    title_en: 'Restaurant Data Analysis',
    title_fa: 'تحلیل داده رستوران',
    description_en: enLocale.projects.projectDescriptions.restaurantDataAnalysis,
    description_fa: faLocale.projects.projectDescriptions.restaurantDataAnalysis,
    long_description_en: `A comprehensive data analysis project focused on restaurant performance metrics.\n\n**Features:**\n- Sales performance analysis\n- Customer behavior insights\n- Menu optimization recommendations\n- Built with Python and data visualization libraries`,
    long_description_fa: `پروژه تحلیل داده جامع با تمرکز بر ارزیابی معیارهای عملکرد رستوران.\n\n**ویژگی‌ها:**\n- تحلیل عملکرد فروش\n- بینش‌های رفتار مشتری\n- توصیه‌های بهینه‌سازی منو\n- ساخته شده با پایتون و کتابخانه‌های visualization`,
    github_url: 'https://github.com/SireJeff',
    status: 'active',
    is_featured: false,
    sort_order: 3
  },
  {
    slug: 'ssh-vpn',
    title_en: 'SSH VPN Solution',
    title_fa: 'راه‌حل VPN SSH',
    description_en: enLocale.projects.projectDescriptions.sshVpn,
    description_fa: faLocale.projects.projectDescriptions.sshVpn,
    long_description_en: `A decentralized and containerized SSH VPN solution built on the RunOnFlux platform.\n\n**Features:**\n- Decentralized architecture\n- Container-based deployment\n- RunOnFlux platform integration\n- Secure SSH tunneling`,
    long_description_fa: `راه‌حل VPN SSH غیرمتمرکز و کانتینری توسعه یافته بر پلتفرم RunOnFlux.\n\n**ویژگی‌ها:**\n- معماری غیرمتمرکز\n- استقرار مبتنی بر کانتینر\n- یکپارچگی با پلتفرم RunOnFlux\n- تونلینگ امن SSH`,
    github_url: 'https://github.com/SireJeff',
    status: 'active',
    is_featured: false,
    sort_order: 4
  },
  {
    slug: 'nasta',
    title_en: 'NASA Data Analysis Tools',
    title_fa: 'ابزارهای تحلیل داده ناسا',
    description_en: enLocale.projects.projectDescriptions.nasta,
    description_fa: faLocale.projects.projectDescriptions.nasta,
    long_description_en: `A multi-purpose script pack and modules used for data analysis on NASA API outputs.\n\n**Features:**\n- NASA API integration\n- Data processing modules\n- Scientific data analysis\n- Reusable script collection`,
    long_description_fa: `بسته ابزارهای چندمنظوره برای پردازش و تحلیل داده‌های API ناسا.\n\n**ویژگی‌ها:**\n- یکپارچگی با API ناسا\n- ماژول‌های پردازش داده\n- تحلیل داده علمی\n- مجموعه اسکریپت‌های قابل استفاده مجدد`,
    github_url: 'https://github.com/SireJeff',
    status: 'active',
    is_featured: false,
    sort_order: 5
  },
  {
    slug: 'tg-reminder',
    title_en: 'Telegram Reminder Bot',
    title_fa: 'ربات یادآوری تلگرام',
    description_en: enLocale.projects.projectDescriptions.tgReminder,
    description_fa: faLocale.projects.projectDescriptions.tgReminder,
    long_description_en: `A personalized telegram reminder bot using telebot with English/Persian support.\n\n**Features:**\n- Bilingual support (English/Persian)\n- Personalized reminders\n- Telegram Bot API integration\n- User-friendly commands`,
    long_description_fa: `ربات یادآوری شخصی تلگرام با پشتیبانی دوزبانه.\n\n**ویژگی‌ها:**\n- پشتیبانی دوزبانه (انگلیسی و فارسی)\n- یادآوری‌های شخصی‌سازی شده\n- یکپارچگی با API بات تلگرام\n- دستورات کاربرپسند`,
    github_url: 'https://github.com/SireJeff',
    status: 'active',
    is_featured: true,
    sort_order: 6
  },
  {
    slug: 'oscillation-simulation',
    title_en: 'Oscillation Simulation',
    title_fa: 'شبیه‌سازی نوسان',
    description_en: enLocale.projects.projectDescriptions.oscillationSimulation,
    description_fa: faLocale.projects.projectDescriptions.oscillationSimulation,
    long_description_en: `A comprehensive computational physics project that simulates wave dynamics through coupled oscillator systems.\n\n**Features:**\n- Wave dynamics simulation\n- Normal modes exploration\n- Symmetry effects analysis\n- Wave propagation phenomena study`,
    long_description_fa: `پروژه فیزیک محاسباتی جامع برای شبیه‌سازی دینامیک موج.\n\n**ویژگی‌ها:**\n- شبیه‌سازی دینامیک موج\n- بررسی حالت‌های عادی\n- تحلیل اثرات تقارن\n- مطالعه پدیده‌های انتشار موج`,
    github_url: 'https://github.com/SireJeff',
    status: 'active',
    is_featured: true,
    sort_order: 7
  },
  {
    slug: 'skm-website',
    title_en: 'SKM Company Website',
    title_fa: 'وب‌سایت شرکت SKM',
    description_en: enLocale.projects.projectDescriptions.skmWebsite,
    description_fa: faLocale.projects.projectDescriptions.skmWebsite,
    long_description_en: `A comprehensive website project for SKM construction company.\n\n**Features:**\n- Services showcase\n- Projects portfolio\n- Client testimonials\n- Responsive design\n- Modern UI/UX`,
    long_description_fa: `توسعه وب‌سایت جامع برای شرکت ساختمانی SKM.\n\n**ویژگی‌ها:**\n- نمایش خدمات\n- پورتفولیو پروژه‌ها\n- شهادت‌های مشتریان\n- طراحی ریسپانسیو\n- UI/UX مدرن`,
    github_url: 'https://github.com/SireJeff',
    demo_url: 'https://skm-co.com',
    status: 'active',
    is_featured: true,
    sort_order: 8
  },
  {
    slug: 'uissf',
    title_en: 'UISSF - Smart Campuses Network',
    title_fa: 'UISF - شبکه پردیس‌های هوشمند',
    description_en: enLocale.projects.projectDescriptions.uissf,
    description_fa: faLocale.projects.projectDescriptions.uissf,
    long_description_en: `Research proposal for a global distributed network of smart campuses for University of Isfahan engineering faculties.\n\n**Technologies:**\n- P2P file storage\n- Indoor positioning systems\n- Immersive technologies (AR/VR/MR)\n- AI and IoT infrastructure`,
    long_description_fa: `پیشنهاد تحقیقاتی برای شبکه توزیع‌شده جهانی پردیس‌های هوشمند.\n\n**فناوری‌ها:**\n- ذخیره‌سازی فایل P2P\n- سیستم‌های موقعیت‌یابی داخلی\n- تکنولوژی‌های غوطه‌ور (AR/VR/MR)\n- زیرساخت AI و IoT`,
    github_url: 'https://github.com/SireJeff',
    status: 'active',
    is_featured: true,
    sort_order: 9
  }
]

// ============================================
// IMPORT FUNCTIONS
// ============================================

async function importSkillCategories() {
  console.log('\n📁 Importing Skill Categories...')

  for (const category of skillCategoriesData) {
    const { error } = await supabase
      .from('skill_categories')
      .upsert(category, { onConflict: 'slug' })

    if (error) {
      console.error(`❌ Error importing category ${category.slug}:`, error.message)
    } else {
      console.log(`✅ Imported: ${category.name_en}`)
    }
  }

  // Get category IDs for skills
  const { data: categories } = await supabase
    .from('skill_categories')
    .select('id, slug')

  return Object.fromEntries(categories.map(c => [c.slug, c.id]))
}

async function importSkills(categoryIdMap) {
  console.log('\n📊 Importing Skills...')

  for (const skill of skillsData) {
    const category_id = categoryIdMap[skill.category_slug]

    const { error } = await supabase
      .from('skills')
      .upsert({
        slug: skill.slug,
        name_en: skill.name_en,
        name_fa: skill.name_fa,
        category_id,
        proficiency_level: skill.proficiency_level,
      }, { onConflict: 'slug' })

    if (error) {
      console.error(`❌ Error importing skill ${skill.slug}:`, error.message)
    } else {
      console.log(`✅ Imported: ${skill.name_en}`)
    }
  }
}

async function importProjects() {
  console.log('\n🚀 Importing Projects...')

  for (const project of projectsData) {
    const { error } = await supabase
      .from('projects')
      .upsert(project, { onConflict: 'slug' })

    if (error) {
      console.error(`❌ Error importing project ${project.slug}:`, error.message)
    } else {
      console.log(`✅ Imported: ${project.title_en}`)
    }
  }
}

// ============================================
// MAIN IMPORT
// ============================================

async function main() {
  console.log('🎯 Starting i18n Data Import to CMS')
  console.log('====================================')

  try {
    // Import skill categories first (needed for skills)
    const categoryIdMap = await importSkillCategories()

    // Import skills
    await importSkills(categoryIdMap)

    // Import projects
    await importProjects()

    console.log('\n✨ Import completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Visit /admin/skills to manage your skills')
    console.log('2. Visit /admin/projects to manage your projects')
    console.log('3. Add project images and tags as needed')

  } catch (error) {
    console.error('\n❌ Import failed:', error)
    process.exit(1)
  }
}

main()
