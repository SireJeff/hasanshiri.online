/**
 * Seed Tags and Categories for hasanshiri.online Dashboard
 *
 * This script populates the database with pre-defined tags and categories
 * for articles and projects. It uses upsert operations to ensure idempotency.
 *
 * Usage:
 *   node scripts/seed-tags-categories.js [type] [options]
 *
 * Types:
 *   all            Seed everything (default)
 *   categories     Seed article categories only
 *   article-tags   Seed article tags only
 *   project-tags   Seed project tags only
 *
 * Options:
 *   --dry-run      Validate data without inserting
 *   --help         Show this help message
 *
 * Examples:
 *   node scripts/seed-tags-categories.js              # Seed everything
 *   node scripts/seed-tags-categories.js categories   # Categories only
 *   node scripts/seed-tags-categories.js --dry-run    # Validate only
 *   npm run seed                                      # Via npm script
 *
 * @author hasanshiri.online
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('   Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================
// DATA LOADING
// ============================================

function loadJsonData(filename) {
  try {
    const filePath = join(__dirname, '../lib/data/seed-data', filename)
    const content = readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`❌ Failed to load ${filename}:`, error.message)
    return null
  }
}

// ============================================
// VALIDATION
// ============================================

function validateCategories(data) {
  const required = ['slug', 'name_en', 'name_fa', 'color', 'sort_order']
  for (const item of data) {
    for (const field of required) {
      if (!item[field]) {
        console.error(`   ❌ Missing '${field}' in category: ${JSON.stringify(item)}`)
        return false
      }
    }
  }
  return true
}

function validateTags(data) {
  const required = ['slug', 'name_en', 'name_fa']
  for (const item of data) {
    for (const field of required) {
      if (!item[field]) {
        console.error(`   ❌ Missing '${field}' in tag: ${JSON.stringify(item)}`)
        return false
      }
    }
  }
  return true
}

// ============================================
// SEED FUNCTIONS
// ============================================

/**
 * Seed article categories
 * Adds 4 new categories (tutorials, projects, career, research)
 * Existing categories (technology, data-science, physics, thoughts) are preserved
 */
async function seedArticleCategories(dryRun = false) {
  console.log('\n📁 Seeding Article Categories...')

  const categories = loadJsonData('article-categories.json')
  if (!categories) return { success: false, count: 0 }

  // Validate
  if (!validateCategories(categories)) {
    return { success: false, count: 0 }
  }

  console.log(`   📋 Found ${categories.length} categories to seed`)

  if (dryRun) {
    console.log('   📋 DRY RUN - Would insert:')
    categories.forEach(c => console.log(`      - ${c.slug}: ${c.name_en} / ${c.name_fa}`))
    return { success: true, count: categories.length, dryRun: true }
  }

  // Remove category field if present (not in DB schema)
  const dataToInsert = categories.map(({ category, ...rest }) => rest)

  const { data, error } = await supabase
    .from('categories')
    .upsert(dataToInsert, { onConflict: 'slug' })
    .select()

  if (error) {
    console.error('   ❌ Error seeding categories:', error.message)
    return { success: false, count: 0, error }
  }

  console.log(`   ✅ Seeded ${data.length} article categories`)
  return { success: true, count: data.length }
}

/**
 * Seed article tags
 * Adds 35 tags for blog articles
 */
async function seedArticleTags(dryRun = false) {
  console.log('\n🏷️ Seeding Article Tags...')

  const tags = loadJsonData('article-tags.json')
  if (!tags) return { success: false, count: 0 }

  // Validate
  if (!validateTags(tags)) {
    return { success: false, count: 0 }
  }

  console.log(`   📋 Found ${tags.length} tags to seed`)

  if (dryRun) {
    console.log('   📋 DRY RUN - Would insert:')
    const byCategory = tags.reduce((acc, t) => {
      const cat = t.category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(t)
      return acc
    }, {})
    Object.entries(byCategory).forEach(([cat, items]) => {
      console.log(`      ${cat}: ${items.map(t => t.slug).join(', ')}`)
    })
    return { success: true, count: tags.length, dryRun: true }
  }

  // Extract only fields that exist in tags table
  const dataToInsert = tags.map(({ slug, name_en, name_fa }) => ({
    slug,
    name_en,
    name_fa
  }))

  const { data, error } = await supabase
    .from('tags')
    .upsert(dataToInsert, { onConflict: 'slug' })
    .select()

  if (error) {
    console.error('   ❌ Error seeding article tags:', error.message)
    return { success: false, count: 0, error }
  }

  console.log(`   ✅ Seeded ${data.length} article tags`)
  return { success: true, count: data.length }
}

/**
 * Seed project tags
 * Adds 10 additional tags for portfolio projects
 */
async function seedProjectTags(dryRun = false) {
  console.log('\n🔧 Seeding Project Tags...')

  const tags = loadJsonData('project-tags.json')
  if (!tags) return { success: false, count: 0 }

  // Validate
  if (!validateTags(tags)) {
    return { success: false, count: 0 }
  }

  console.log(`   📋 Found ${tags.length} tags to seed`)

  if (dryRun) {
    console.log('   📋 DRY RUN - Would insert:')
    tags.forEach(t => console.log(`      - ${t.slug}: ${t.name_en} / ${t.name_fa}`))
    return { success: true, count: tags.length, dryRun: true }
  }

  const { data, error } = await supabase
    .from('project_tags')
    .upsert(tags, { onConflict: 'slug' })
    .select()

  if (error) {
    console.error('   ❌ Error seeding project tags:', error.message)
    return { success: false, count: 0, error }
  }

  console.log(`   ✅ Seeded ${data.length} project tags`)
  return { success: true, count: data.length }
}

// ============================================
// HELP & USAGE
// ============================================

function showHelp() {
  console.log(`
🌱 Tags & Categories Seed Script
================================

Usage:
  node scripts/seed-tags-categories.js [type] [options]

Types:
  all            Seed everything (default)
  categories     Seed article categories only
  article-tags   Seed article tags only
  project-tags   Seed project tags only

Options:
  --dry-run      Validate data without inserting
  --help         Show this help message

Examples:
  node scripts/seed-tags-categories.js              # Seed everything
  node scripts/seed-tags-categories.js categories   # Categories only
  node scripts/seed-tags-categories.js --dry-run    # Validate only
  npm run seed                                      # Via npm script

Data Files:
  lib/data/seed-data/article-categories.json  # 4 categories
  lib/data/seed-data/article-tags.json        # 35 tags
  lib/data/seed-data/project-tags.json        # 10 tags

Database Tables:
  categories     -> Article categories
  tags           -> Article tags
  project_tags   -> Project tags
`)
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  const args = process.argv.slice(2)

  // Help
  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    process.exit(0)
  }

  const dryRun = args.includes('--dry-run')
  const seedType = args.find(a => !a.startsWith('--')) || 'all'

  console.log('🌱 Tags & Categories Seed Script')
  console.log('================================')
  console.log(`📅 Date: ${new Date().toISOString().split('T')[0]}`)
  console.log(`🎯 Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will modify database)'}`)
  console.log(`📦 Type: ${seedType}`)

  const results = {
    categories: { success: true, count: 0 },
    articleTags: { success: true, count: 0 },
    projectTags: { success: true, count: 0 }
  }

  try {
    // Execute based on type
    if (seedType === 'all' || seedType === 'categories') {
      results.categories = await seedArticleCategories(dryRun)
    }

    if (seedType === 'all' || seedType === 'article-tags') {
      results.articleTags = await seedArticleTags(dryRun)
    }

    if (seedType === 'all' || seedType === 'project-tags') {
      results.projectTags = await seedProjectTags(dryRun)
    }

    // Summary
    console.log('\n📊 Summary')
    console.log('==========')

    const totalCount = results.categories.count + results.articleTags.count + results.projectTags.count
    const allSuccess = results.categories.success && results.articleTags.success && results.projectTags.success

    if (results.categories.count > 0) {
      console.log(`   📁 Categories: ${results.categories.count}`)
    }
    if (results.articleTags.count > 0) {
      console.log(`   🏷️ Article Tags: ${results.articleTags.count}`)
    }
    if (results.projectTags.count > 0) {
      console.log(`   🔧 Project Tags: ${results.projectTags.count}`)
    }
    console.log(`   📈 Total: ${totalCount}`)

    if (dryRun) {
      console.log('\n📋 DRY RUN COMPLETE - No database changes made')
      console.log('   Run without --dry-run to apply changes')
    } else if (allSuccess) {
      console.log('\n✨ Seeding complete!')
    } else {
      console.log('\n⚠️ Seeding completed with some errors')
      process.exit(1)
    }

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()
