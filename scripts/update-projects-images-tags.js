/**
 * Update Projects with Images and Tags
 *
 * This script adds featured images and project tags to the imported projects.
 *
 * Usage:
 *   node scripts/update-projects-images-tags.js
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================
// PROJECT TAGS TO CREATE
// ============================================

const projectTags = [
  { slug: 'python', name_en: 'Python', name_fa: 'پایتون' },
  { slug: 'javascript', name_en: 'JavaScript', name_fa: 'جاوا‌اسکریپت' },
  { slug: 'react', name_en: 'React', name_fa: 'ری‌اکت' },
  { slug: 'nextjs', name_en: 'Next.js', name_fa: 'نکست‌جی‌اس' },
  { slug: 'telegram', name_en: 'Telegram', name_fa: 'تلگرام' },
  { slug: 'docker', name_en: 'Docker', name_fa: 'داکر' },
  { slug: 'kubernetes', name_en: 'Kubernetes', name_fa: 'کوبرنتیز' },
  { slug: 'physics', name_en: 'Physics', name_fa: 'فیزیک' },
  { slug: 'data-science', name_en: 'Data Science', name_fa: 'علم داده' },
  { slug: 'api', name_en: 'API', name_fa 'API' },
  { slug: 'nasa', name_en: 'NASA', name_fa: 'ناسا' },
  { slug: 'web-development', name_en: 'Web Development', name_fa: 'توسعه وب' },
  { slug: 'automation', name_en: 'Automation', name_fa: 'اتوماسیون' },
]

// ============================================
// PROJECT IMAGES & TAGS MAPPING
// ============================================

const projectsUpdates = [
  {
    slug: 'libertad',
    featured_image: '/images/projects/libertad.png',
    tags: ['python', 'telegram', 'docker', 'automation']
  },
  {
    slug: 'interpolation-techniques',
    featured_image: '/images/projects/interpolation.png',
    tags: ['python', 'physics', 'data-science']
  },
  {
    slug: 'restaurant-data-analysis',
    featured_image: '/images/projects/restaurant-analysis.png',
    tags: ['python', 'data-science']
  },
  {
    slug: 'ssh-vpn',
    featured_image: '/images/projects/ssh-vpn.png',
    tags: ['docker', 'kubernetes']
  },
  {
    slug: 'nasta',
    featured_image: '/images/projects/nasta.png',
    tags: ['python', 'api', 'nasa', 'data-science']
  },
  {
    slug: 'tg-reminder',
    featured_image: '/images/projects/tg-reminder.png',
    tags: ['python', 'telegram', 'automation']
  },
  {
    slug: 'oscillation-simulation',
    featured_image: '/images/projects/oscillation.png',
    tags: ['python', 'physics', 'data-science']
  },
  {
    slug: 'skm-website',
    featured_image: '/images/projects/skm-website.png',
    tags: ['web-development', 'react', 'nextjs']
  },
  {
    slug: 'uissf',
    featured_image: '/images/projects/uissf.png',
    tags: ['research', 'api', 'web-development']
  }
]

// ============================================
// FUNCTIONS
// ============================================

async function createProjectTags() {
  console.log('\n🏷️  Creating Project Tags...')

  for (const tag of projectTags) {
    const { data, error } = await supabase
      .from('project_tags')
      .upsert(tag, { onConflict: 'slug' })

    if (error) {
      console.error(`❌ Error creating tag ${tag.slug}:`, error.message)
    } else {
      console.log(`✅ Created: ${tag.name_en}`)
    }
  }
}

async function updateProjectsWithImagesAndTags() {
  console.log('\n🖼️  Updating Projects with Images and Tags...')

  for (const projectUpdate of projectsUpdates) {
    // Get project by slug
    const { data: project } = await supabase
      .from('projects')
      .select('id, slug')
      .eq('slug', projectUpdate.slug)
      .single()

    if (!project) {
      console.error(`❌ Project not found: ${projectUpdate.slug}`)
      continue
    }

    // Get tag IDs for this project
    const tagIds = []
    for (const tagSlug of projectUpdate.tags) {
      const { data: tag } = await supabase
        .from('project_tags')
        .select('id')
        .eq('slug', tagSlug)
        .single()

      if (tag) {
        tagIds.push(tag.id)
      }
    }

    // Update project with image and get current tags
    const { data: currentProject } = await supabase
      .from('projects')
      .select('tag_ids')
      .eq('id', project.id)
      .single()

    // Merge new tags with existing tags (avoid duplicates)
    const existingTagIds = currentProject?.tag_ids || []
    const allTagIds = [...new Set([...existingTagIds, ...tagIds])]

    // Update project
    const { data, error } = await supabase
      .from('projects')
      .update({
        featured_image: projectUpdate.featured_image,
        tag_ids: allTagIds
      })
      .eq('id', project.id)
      .select()

    if (error) {
      console.error(`❌ Error updating project ${projectUpdate.slug}:`, error.message)
    } else {
      console.log(`✅ Updated: ${projectUpdate.slug}`)
      console.log(`   Image: ${projectUpdate.featured_image}`)
      console.log(`   Tags: ${projectUpdate.tags.join(', ')}`)
    }
  }
}

async function main() {
  console.log('🎯 Updating Projects with Images and Tags')
  console.log('======================================')

  try {
    // First create all tags
    await createProjectTags()

    // Then update projects
    await updateProjectsWithImagesAndTags()

    console.log('\n✨ Updates completed successfully!')
    console.log('\nNote: Make sure the image files exist in public/images/projects/')
    console.log('You may need to create placeholder images for now.')

  } catch (error) {
    console.error('\n❌ Update failed:', error)
    process.exit(1)
  }
}

main()
