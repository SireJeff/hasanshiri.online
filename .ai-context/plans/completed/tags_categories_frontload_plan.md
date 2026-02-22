# RPI Plan: Tags & Categories Frontloading

**Feature:** Tags and Categories Frontloading for Dashboard
**Date:** 2026-02-22
**Status:** ✅ COMPLETE
**Based On:** `.ai-context/research/active/tags_categories_frontload_research.md`

---

## Executive Summary

This plan creates a comprehensive seed system to frontload **49 entities** into the hasanshiri.online dashboard:
- **4 additional article categories** (total 8)
- **35 article tags** (from 0)
- **10 additional project tags** (from 14+ to 24+)

Implementation approach: **Node.js seed script** with JSON data files (following existing patterns in `scripts/`)

---

## Chunk Manifest

| Chunk ID | Domain | Status | Dependencies | Est. Complexity |
|----------|--------|--------|--------------|-----------------|
| CHUNK-P1 | Data Files | ✅ COMPLETE | None | Low |
| CHUNK-P2 | Article Categories Seed | ✅ COMPLETE | P1 | Low |
| CHUNK-P3 | Article Tags Seed | ✅ COMPLETE | P1 | Medium |
| CHUNK-P4 | Project Tags Seed | ✅ COMPLETE | P1 | Low |
| CHUNK-P5 | Main Seed Script | ✅ COMPLETE | P2, P3, P4 | Medium |
| CHUNK-P6 | Verification & Testing | ✅ COMPLETE | P5 | Low |

---

## CHUNK-P1: Data Files Creation

### Objective
Create JSON data source files containing all tags and categories with bilingual translations.

### Scope
**In Scope:**
- Create `lib/data/seed-data/` directory
- Create `article-categories.json`
- Create `article-tags.json`
- Create `project-tags.json`

**Out of Scope:**
- Database operations
- Script execution
- Admin UI changes

### Todo Items

#### TODO-P1.1: Create seed data directory
- **File:** `lib/data/seed-data/` (new directory)
- **Action:** Create directory structure
- **Test:** Directory exists

#### TODO-P1.2: Create article categories JSON
- **File:** `lib/data/seed-data/article-categories.json`
- **Action:** Create JSON with 4 new categories
- **Content:**
```json
[
  { "slug": "tutorials", "name_en": "Tutorials", "name_fa": "آموزش‌ها", "description_en": "Step-by-step guides and how-tos", "description_fa": "راهنماهای گام‌به‌گام و آموزش‌ها", "color": "#06b6d4", "sort_order": 5 },
  { "slug": "projects", "name_en": "Projects", "name_fa": "پروژه‌ها", "description_en": "Project showcases and case studies", "description_fa": "معرفی پروژه‌ها و مطالعات موردی", "color": "#84cc16", "sort_order": 6 },
  { "slug": "career", "name_en": "Career", "name_fa": "مسیر شغلی", "description_en": "Career development and professional growth", "description_fa": "توسعه شغلی و رشد حرفه‌ای", "color": "#f43f5e", "sort_order": 7 },
  { "slug": "research", "name_en": "Research", "name_fa": "پژوهش", "description_en": "Academic research and findings", "description_fa": "پژوهش‌های دانشگاهی و یافته‌ها", "color": "#6366f1", "sort_order": 8 }
]
```
- **Test:** Valid JSON, all fields present

#### TODO-P1.3: Create article tags JSON
- **File:** `lib/data/seed-data/article-tags.json`
- **Action:** Create JSON with 35 tags organized by category
- **Content:** (See full list in research document)
- **Test:** Valid JSON, 35 tags, all have slug/name_en/name_fa

#### TODO-P1.4: Create project tags JSON
- **File:** `lib/data/seed-data/project-tags.json`
- **Action:** Create JSON with 10 additional project tags
- **Content:**
```json
[
  { "slug": "supabase", "name_en": "Supabase", "name_fa": "سوپابیس" },
  { "slug": "api-integration", "name_en": "API Integration", "name_fa": "یکپارچه‌سازی API" },
  { "slug": "bot", "name_en": "Bot/Application", "name_fa": "ربات/اپلیکیشن" },
  { "slug": "portfolio", "name_en": "Portfolio", "name_fa": "پورتفولیو" },
  { "slug": "cms", "name_en": "CMS", "name_fa": "سیستم مدیریت محتوا" },
  { "slug": "authentication", "name_en": "Authentication", "name_fa": "احراز هویت" },
  { "slug": "realtime", "name_en": "Real-time", "name_fa": "بلادرنگ" },
  { "slug": "seo", "name_en": "SEO", "name_fa": "سئو" },
  { "slug": "open-source", "name_en": "Open Source", "name_fa": "متن‌باز" },
  { "slug": "tailwind", "name_en": "Tailwind CSS", "name_fa": "تیلویند" }
]
```
- **Test:** Valid JSON, 10 tags

### Rollback Plan
```bash
rm -rf lib/data/seed-data/
```

### Safe Commit Point
After all 4 todos complete: `git add lib/data/seed-data/ && git commit -m "feat(data): add seed data for tags and categories"`

---

## CHUNK-P2: Article Categories Seed Function

### Objective
Create the seed function for article categories with upsert logic.

### Scope
**In Scope:**
- Seed function in main script
- Upsert with `onConflict: 'slug'`
- Error handling and logging

**Out of Scope:**
- Other entity types
- Script execution

### Dependencies
- CHUNK-P1 (data files must exist)

### Todo Items

#### TODO-P2.1: Create seed categories function
- **File:** `scripts/seed-tags-categories.js` (new file)
- **Action:** Add `seedArticleCategories()` function
- **Code Pattern:**
```javascript
async function seedArticleCategories(supabase) {
  const categories = JSON.parse(
    readFileSync(join(__dirname, '../lib/data/seed-data/article-categories.json'), 'utf-8')
  )

  const { data, error } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'slug' })
    .select()

  if (error) throw error
  console.log(`✅ Seeded ${data.length} article categories`)
  return data
}
```
- **Test:** Function exists, handles errors

#### TODO-P2.2: Add conflict handling for existing categories
- **File:** `scripts/seed-tags-categories.js`
- **Action:** Ensure upsert doesn't overwrite existing 4 categories
- **Code:** Use `onConflict: 'slug'` with selective update
- **Test:** Existing categories preserved

### Rollback Plan
No database changes yet - safe to delete script

### Safe Commit Point
Can commit after function is complete but not executed

---

## CHUNK-P3: Article Tags Seed Function

### Objective
Create the seed function for 35 article tags with upsert logic.

### Scope
**In Scope:**
- Seed function in main script
- Upsert with `onConflict: 'slug'`
- Error handling and logging

**Out of Scope:**
- Article-tag relationships (done via admin UI when creating articles)

### Dependencies
- CHUNK-P1 (data files must exist)

### Todo Items

#### TODO-P3.1: Create seed article tags function
- **File:** `scripts/seed-tags-categories.js`
- **Action:** Add `seedArticleTags()` function
- **Code Pattern:**
```javascript
async function seedArticleTags(supabase) {
  const tags = JSON.parse(
    readFileSync(join(__dirname, '../lib/data/seed-data/article-tags.json'), 'utf-8')
  )

  const { data, error } = await supabase
    .from('tags')
    .upsert(tags, { onConflict: 'slug' })
    .select()

  if (error) throw error
  console.log(`✅ Seeded ${data.length} article tags`)
  return data
}
```
- **Test:** Function exists, handles errors

#### TODO-P3.2: Add duplicate detection logging
- **File:** `scripts/seed-tags-categories.js`
- **Action:** Log which tags are new vs existing
- **Code:** Check before upsert, log results
- **Test:** Accurate count of new vs existing

### Rollback Plan
SQL: `DELETE FROM tags WHERE slug IN ('python', 'javascript', ...)` or truncate

### Safe Commit Point
Commit after function is complete

---

## CHUNK-P4: Project Tags Seed Function

### Objective
Create the seed function for 10 additional project tags with upsert logic.

### Scope
**In Scope:**
- Seed function in main script
- Upsert to `project_tags` table
- Error handling and logging

**Out of Scope:**
- Project-tag relationships (handled separately)

### Dependencies
- CHUNK-P1 (data files must exist)

### Todo Items

#### TODO-P4.1: Create seed project tags function
- **File:** `scripts/seed-tags-categories.js`
- **Action:** Add `seedProjectTags()` function
- **Code Pattern:**
```javascript
async function seedProjectTags(supabase) {
  const tags = JSON.parse(
    readFileSync(join(__dirname, '../lib/data/seed-data/project-tags.json'), 'utf-8')
  )

  const { data, error } = await supabase
    .from('project_tags')
    .upsert(tags, { onConflict: 'slug' })
    .select()

  if (error) throw error
  console.log(`✅ Seeded ${data.length} project tags`)
  return data
}
```
- **Test:** Function exists, correct table name

### Rollback Plan
SQL: `DELETE FROM project_tags WHERE slug IN (...)`

### Safe Commit Point
Commit after function is complete

---

## CHUNK-P5: Main Seed Script Assembly

### Objective
Assemble the complete seed script with CLI interface and error handling.

### Scope
**In Scope:**
- Main execution function
- CLI argument parsing
- Dry-run mode
- Selective seeding options
- Comprehensive error handling
- Usage documentation

**Out of Scope:**
- Database verification (CHUNK-P6)

### Dependencies
- CHUNK-P2, P3, P4 (all seed functions must exist)

### Todo Items

#### TODO-P5.1: Create main execution function
- **File:** `scripts/seed-tags-categories.js`
- **Action:** Add `main()` function with argument parsing
- **Code Pattern:**
```javascript
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const seedType = args.find(a => !a.startsWith('--'))

  console.log('🌱 Tags & Categories Seed Script')
  console.log('================================')

  if (dryRun) {
    console.log('📋 DRY RUN - No database changes')
    // Load and validate data without inserting
    return
  }

  try {
    if (!seedType || seedType === 'all') {
      await seedArticleCategories(supabase)
      await seedArticleTags(supabase)
      await seedProjectTags(supabase)
    } else if (seedType === 'categories') {
      await seedArticleCategories(supabase)
    } else if (seedType === 'article-tags') {
      await seedArticleTags(supabase)
    } else if (seedType === 'project-tags') {
      await seedProjectTags(supabase)
    }

    console.log('\n✨ Seeding complete!')
  } catch (error) {
    console.error('❌ Seeding failed:', error.message)
    process.exit(1)
  }
}

main()
```
- **Test:** Script runs with --help, --dry-run

#### TODO-P5.2: Add dry-run validation
- **File:** `scripts/seed-tags-categories.js`
- **Action:** Validate all JSON files in dry-run mode
- **Code:** Check file existence, JSON validity, required fields
- **Test:** Dry-run catches invalid data

#### TODO-P5.3: Add script header documentation
- **File:** `scripts/seed-tags-categories.js`
- **Action:** Add comprehensive header comment
- **Code:**
```javascript
/**
 * Seed Tags and Categories for hasanshiri.online Dashboard
 *
 * This script populates the database with pre-defined tags and categories
 * for articles and projects.
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
 */
```
- **Test:** --help displays correctly

#### TODO-P5.4: Add package.json script alias
- **File:** `package.json`
- **Action:** Add npm script for easy execution
- **Code:**
```json
"scripts": {
  "seed": "node scripts/seed-tags-categories.js",
  "seed:dry": "node scripts/seed-tags-categories.js --dry-run"
}
```
- **Test:** `npm run seed:dry` works

### Rollback Plan
Delete script, remove package.json entries

### Safe Commit Point
`git commit -m "feat(scripts): add tags and categories seed script"`

---

## CHUNK-P6: Verification & Testing

### Objective
Verify seed data integrity and test the complete seeding process.

### Scope
**In Scope:**
- Manual testing of seed script
- Database verification queries
- Admin UI verification
- Documentation update

**Out of Scope:**
- Automated test suite (can be added later)

### Dependencies
- CHUNK-P5 (script must be complete)

### Todo Items

#### TODO-P6.1: Test dry-run mode
- **File:** N/A (CLI execution)
- **Action:** Run `npm run seed:dry`
- **Expected:** All data validated, no database changes
- **Test:** Console output shows validation results

#### TODO-P6.2: Execute full seed
- **File:** N/A (CLI execution)
- **Action:** Run `npm run seed`
- **Expected:** All entities inserted
- **Test:** Count matches expected (4 categories + 35 article tags + 10 project tags)

#### TODO-P6.3: Verify in database
- **File:** N/A (Supabase dashboard)
- **Action:** Query each table to confirm counts
- **SQL Verification:**
```sql
-- Article categories
SELECT COUNT(*) FROM categories; -- Should be 8 (4 existing + 4 new)

-- Article tags
SELECT COUNT(*) FROM tags; -- Should be 35

-- Project tags
SELECT COUNT(*) FROM project_tags; -- Should be 24+ (14 existing + 10 new)
```
- **Test:** Counts match expectations

#### TODO-P6.4: Verify in admin dashboard
- **File:** N/A (Browser)
- **Action:** Navigate to `/admin/categories` and `/admin/tags`
- **Expected:** All entities visible with correct bilingual names
- **Test:** UI displays correctly

#### TODO-P6.5: Update CLAUDE.md documentation
- **File:** `CLAUDE.md`
- **Action:** Add seed script to commands section
- **Code:**
```markdown
### Seeding
```bash
npm run seed             # Seed tags and categories
npm run seed:dry         # Validate seed data without inserting
```
```
- **Test:** Documentation updated

### Rollback Plan
Database: Delete seeded records, script rollback not needed

### Safe Commit Point
Final commit: `git commit -m "docs: add seed script documentation"`

---

## Chunk Dependency Graph

```
CHUNK-P1 (Data Files)
    ├── CHUNK-P2 (Categories Seed)
    ├── CHUNK-P3 (Article Tags Seed)
    └── CHUNK-P4 (Project Tags Seed)
            │
            └── CHUNK-P5 (Main Script)
                    │
                    └── CHUNK-P6 (Verification)
```

---

## Inter-Phase Contract

```
EXPECTED_CONSUMER: rpi-implement
CHUNK_PROCESSING_ORDER: dependency-ordered (P1 → P2/P3/P4 → P5 → P6)
MARK_AS_IMPLEMENTED_WHEN: all chunk todos complete and verified
UPDATE_RESEARCH_STATUS: true

EXECUTION_NOTES:
  - P2, P3, P4 can be parallelized (no interdependencies)
  - P5 requires P2, P3, P4 to be complete
  - P6 requires P5 to be complete (actual script execution)
  - Each chunk should be committed separately for safe rollback

ROLLBACK_STRATEGY:
  - Code rollback: git revert
  - Data rollback: SQL DELETE with slug filter
  - Full rollback: Supabase dashboard → Delete matching records
```

---

## Testing Strategy

### Per-Todo Tests
- JSON validation: `node -e "JSON.parse(require('fs').readFileSync('lib/data/seed-data/article-tags.json'))"`
- Function existence: Code review
- Script execution: `npm run seed:dry`

### Per-Chunk Tests
| Chunk | Test Command | Expected |
|-------|-------------|----------|
| P1 | JSON.parse validation | All files valid JSON |
| P2-P4 | Script syntax check | No errors |
| P5 | `npm run seed:dry` | Validation passes |
| P6 | `npm run seed` + DB check | 49 records created |

### Final Verification
```bash
# Full verification sequence
npm run seed:dry                    # Step 1: Validate
npm run seed                        # Step 2: Execute
npm run seed                        # Step 3: Re-run (idempotent)
# Check admin dashboard             # Step 4: UI verification
```

---

## Files to Create/Modify

| File | Action | Chunk |
|------|--------|-------|
| `lib/data/seed-data/` | CREATE directory | P1 |
| `lib/data/seed-data/article-categories.json` | CREATE | P1 |
| `lib/data/seed-data/article-tags.json` | CREATE | P1 |
| `lib/data/seed-data/project-tags.json` | CREATE | P1 |
| `scripts/seed-tags-categories.js` | CREATE | P2-P5 |
| `package.json` | MODIFY (add scripts) | P5 |
| `CLAUDE.md` | MODIFY (add docs) | P6 |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Duplicate slugs | Low | Medium | upsert with onConflict |
| Missing Persian translations | Low | Low | All translations provided |
| Database connection failure | Low | High | Error handling + dry-run |
| Existing data conflict | Low | Low | upsert preserves existing |

---

## Summary Statistics

- **Total Chunks:** 6
- **Total Todos:** 15
- **New Files:** 5
- **Modified Files:** 2
- **Entities to Seed:** 49
- **Estimated Time:** 30-45 minutes

---

**Plan Status: AWAITING APPROVAL**

To proceed with implementation:
```
/rpi-implement tags-categories-frontload
```
