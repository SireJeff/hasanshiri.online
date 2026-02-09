'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get all skills with categories
 */
export async function getSkills({ categoryId = null, featured = false } = {}) {
  const supabase = await createClient()

  let query = supabase
    .from('skills')
    .select(`
      *,
      category:skill_categories(id, slug, name_en, name_fa, color, icon)
    `)
    .order('sort_order', { ascending: true })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (featured) {
    query = query.eq('is_featured', true)
  }

  const { data: skills, error } = await query

  if (error) {
    console.error('Error fetching skills:', error)
    return []
  }

  return skills || []
}

/**
 * Get skills grouped by category (for SkillsSection component)
 */
export async function getSkillsGroupedByCategory() {
  const skills = await getSkills()

  const grouped = skills.reduce((acc, skill) => {
    const categoryId = skill.category_id || 'uncategorized'
    const category = skill.category || {
      id: 'uncategorized',
      slug: 'uncategorized',
      name_en: 'Other',
      name_fa: 'سایر',
      color: '#6b7280'
    }

    if (!acc[categoryId]) {
      acc[categoryId] = {
        category,
        skills: []
      }
    }

    acc[categoryId].skills.push(skill)
    return acc
  }, {})

  // Convert to array and sort by category sort_order
  return Object.values(grouped).sort((a, b) =>
    (a.category.sort_order || 999) - (b.category.sort_order || 999)
  )
}

/**
 * Get skill by ID (for editing)
 */
export async function getSkillById(id) {
  const supabase = await createClient()

  const { data: skill, error } = await supabase
    .from('skills')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching skill:', error)
    return { skill: null, error: error.message }
  }

  return { skill }
}

/**
 * Get skill categories
 */
export async function getSkillCategories() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('skill_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching skill categories:', error)
    return []
  }

  return categories || []
}

/**
 * Get skill category by slug
 */
export async function getSkillCategoryBySlug(slug) {
  const supabase = await createClient()

  const { data: category, error } = await supabase
    .from('skill_categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching skill category:', error)
    return null
  }

  return category
}

// ============================================
// ADMIN OPERATIONS
// ============================================

/**
 * Get all skills for admin (with optional filtering)
 */
export async function getAdminSkills({ categoryId = null, search = null } = {}) {
  const supabase = await createClient()

  let query = supabase
    .from('skills')
    .select(`
      *,
      category:skill_categories(id, slug, name_en, name_fa, color)
    `)
    .order('sort_order', { ascending: true })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (search) {
    query = query.or(`name_en.ilike.%${search}%,name_fa.ilike.%${search}%`)
  }

  const { data: skills, error } = await query

  if (error) {
    console.error('Error fetching admin skills:', error)
    return { skills: [], error: error.message }
  }

  return { skills: skills || [] }
}

/**
 * Create skill
 */
export async function createSkill(formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Generate slug if not provided
  if (!formData.slug) {
    const baseSlug = formData.name_en
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    formData.slug = baseSlug
  }

  const { data: skill, error } = await supabase
    .from('skills')
    .insert(formData)
    .select()
    .single()

  if (error) {
    console.error('Error creating skill:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')
  revalidatePath('/admin/skills')

  return { skill }
}

/**
 * Update skill
 */
export async function updateSkill(id, formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: skill, error } = await supabase
    .from('skills')
    .update(formData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating skill:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')
  revalidatePath('/admin/skills')

  return { skill }
}

/**
 * Delete skill
 */
export async function deleteSkill(id) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting skill:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')
  revalidatePath('/admin/skills')

  return { success: true }
}

/**
 * Toggle skill featured status
 */
export async function toggleSkillFeatured(id, isFeatured) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('skills')
    .update({ is_featured: isFeatured })
    .eq('id', id)

  if (error) {
    console.error('Error toggling skill featured:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')

  return { success: true }
}

/**
 * Reorder skills (bulk update sort_order)
 */
export async function reorderSkills(skillOrders) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const updates = skillOrders.map(({ id, sort_order }) =>
    supabase.from('skills').update({ sort_order }).eq('id', id)
  )

  await Promise.all(updates)

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')
  revalidatePath('/admin/skills')

  return { success: true }
}

// ============================================
// CATEGORY OPERATIONS
// ============================================

/**
 * Create skill category
 */
export async function createSkillCategory(formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: category, error } = await supabase
    .from('skill_categories')
    .insert(formData)
    .select()
    .single()

  if (error) {
    console.error('Error creating skill category:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/skills')

  return { category }
}

/**
 * Update skill category
 */
export async function updateSkillCategory(id, formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: category, error } = await supabase
    .from('skill_categories')
    .update(formData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating skill category:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')
  revalidatePath('/admin/skills')

  return { category }
}

/**
 * Delete skill category
 */
export async function deleteSkillCategory(id) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('skill_categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting skill category:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')
  revalidatePath('/admin/skills')

  return { success: true }
}

/**
 * Generate unique slug for skill
 */
export async function generateSkillSlug(name) {
  const supabase = await createClient()

  let slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  // Check if exists
  const { data: existing } = await supabase
    .from('skills')
    .select('slug')
    .like('slug', `${slug}%`)

  if (existing?.length) {
    const slugs = existing.map(s => s.slug)
    let counter = 1
    let newSlug = slug
    while (slugs.includes(newSlug)) {
      newSlug = `${slug}-${counter}`
      counter++
    }
    slug = newSlug
  }

  return slug
}

/**
 * Migrate existing hardcoded skills to database
 * Run once during initial setup
 */
export async function migrateSkills() {
  const skillsToMigrate = [
    // Data Science
    { name: 'Python', level: 95, category: 'data-science' },
    { name: 'pandas', level: 60, category: 'data-science' },
    { name: 'NumPy', level: 60, category: 'data-science' },
    { name: 'Matplotlib', level: 60, category: 'data-science' },
    { name: 'Scikit-learn', level: 60, category: 'data-science' },
    { name: 'Power BI', level: 70, category: 'data-science' },
    { name: 'Advanced Excel', level: 85, category: 'data-science' },
    // Programming
    { name: 'C/C++', level: 65, category: 'programming' },
    { name: 'Java', level: 80, category: 'programming' },
    { name: 'FastAPI', level: 75, category: 'programming' },
    { name: 'Django', level: 40, category: 'programming' },
    { name: 'Web Scraping', level: 80, category: 'programming' },
    // Tools
    { name: 'Git/GitHub', level: 90, category: 'tools' },
    { name: 'Docker', level: 65, category: 'tools' },
    { name: 'Postman', level: 80, category: 'tools' },
    { name: 'Linux/Bash', level: 55, category: 'tools' },
    // Research
    { name: 'Complex Systems Modeling', level: 60, category: 'research' },
    { name: 'Econophysics', level: 55, category: 'research' },
    { name: 'Machine Learning', level: 70, category: 'research' },
    { name: 'Business Process Modeling', level: 85, category: 'research' },
    { name: 'Market Research', level: 85, category: 'research' },
    // Languages
    { name: 'Persian', level: 100, category: 'languages' },
    { name: 'English', level: 100, category: 'languages' },
    { name: 'French', level: 85, category: 'languages' },
    { name: 'Spanish', level: 75, category: 'languages' },
    { name: 'Russian', level: 40, category: 'languages' },
  ]

  const supabase = await createClient()

  // Get categories
  const { data: categories } = await supabase
    .from('skill_categories')
    .select('id, slug')

  const categoryMap = Object.fromEntries(
    categories?.map(c => [c.slug, c.id]) || []
  )

  let created = 0
  let updated = 0

  for (const skill of skillsToMigrate) {
    const categoryId = categoryMap[skill.category]

    // Check if exists
    const { data: existing } = await supabase
      .from('skills')
      .select('id')
      .eq('slug', skill.name.toLowerCase())
      .single()

    const skillData = {
      slug: skill.name.toLowerCase(),
      name_en: skill.name,
      name_fa: skill.name, // You can translate later
      proficiency_level: skill.level,
      category_id: categoryId,
      sort_order: created
    }

    if (existing) {
      await supabase.from('skills').update(skillData).eq('id', existing.id)
      updated++
    } else {
      await supabase.from('skills').insert(skillData)
      created++
    }
  }

  return { created, updated, total: skillsToMigrate.length }
}
