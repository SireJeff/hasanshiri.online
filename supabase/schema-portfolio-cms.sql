-- ============================================
-- PORTFOLIO CMS DATABASE SCHEMA
-- Pragmatic Balance Approach
-- Run in Supabase SQL Editor
-- ============================================

-- ============================================
-- SKILL CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_fa TEXT NOT NULL,
    description_en TEXT,
    description_fa TEXT,
    icon TEXT,
    color TEXT DEFAULT '#3b82f6',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skill categories are viewable by everyone"
    ON public.skill_categories FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage skill categories"
    ON public.skill_categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- SKILLS
-- ============================================
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,

    -- Bilingual content
    name_en TEXT NOT NULL,
    name_fa TEXT NOT NULL,
    description_en TEXT,
    description_fa TEXT,

    -- Categorization
    category_id UUID REFERENCES public.skill_categories(id) ON DELETE SET NULL,

    -- Skill level
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 0 AND 100),
    years_of_experience DECIMAL(3, 1),

    -- Metadata
    icon TEXT,
    url TEXT, -- Link to documentation/certification

    -- Display control
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_skills_category ON public.skills(category_id);
CREATE INDEX idx_skills_featured ON public.skills(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_skills_sort ON public.skills(sort_order);

-- Enable RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skills are viewable by everyone"
    ON public.skills FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage skills"
    ON public.skills FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,

    -- Bilingual content
    title_en TEXT NOT NULL,
    title_fa TEXT NOT NULL,
    description_en TEXT,
    description_fa TEXT,
    long_description_en TEXT, -- Rich text (TipTap JSON)
    long_description_fa TEXT,

    -- URLs
    demo_url TEXT,
    github_url TEXT,
    docs_url TEXT,

    -- GitHub Integration
    github_repo_name TEXT, -- e.g., "username/repo"
    github_repo_id BIGINT,
    github_stars INTEGER DEFAULT 0,
    github_forks INTEGER DEFAULT 0,
    github_language TEXT,
    github_description TEXT,
    github_last_commit_at TIMESTAMPTZ,
    github_last_sync_at TIMESTAMPTZ,
    is_github_synced BOOLEAN DEFAULT FALSE,
    auto_sync BOOLEAN DEFAULT FALSE, -- Enable daily sync

    -- Media
    featured_image TEXT,
    gallery TEXT[], -- Array of screenshot URLs

    -- Metadata
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
    start_date DATE,
    end_date DATE,

    -- Display control
    is_featured BOOLEAN DEFAULT FALSE,
    featured_order INTEGER,
    sort_order INTEGER DEFAULT 0,

    -- SEO
    meta_title_en TEXT,
    meta_title_fa TEXT,
    meta_description_en TEXT,
    meta_description_fa TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_slug ON public.projects(slug);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_featured ON public.projects(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_projects_github ON public.projects(github_repo_id) WHERE github_repo_id IS NOT NULL;
CREATE INDEX idx_projects_auto_sync ON public.projects(auto_sync) WHERE auto_sync = TRUE;

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published projects are viewable by everyone"
    ON public.projects FOR SELECT
    USING (
        status = 'active' OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can manage projects"
    ON public.projects FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- PROJECT TAGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_fa TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table
CREATE TABLE IF NOT EXISTS public.project_tag_relations (
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.project_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, tag_id)
);

-- RLS for project tags
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tag_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project tags are viewable by everyone"
    ON public.project_tags FOR SELECT USING (true);

CREATE POLICY "Project tag relations are viewable by everyone"
    ON public.project_tag_relations FOR SELECT USING (true);

CREATE POLICY "Only admins can manage project tags"
    ON public.project_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can manage project tag relations"
    ON public.project_tag_relations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- SITE SETTINGS (Key-Value Pattern)
-- ============================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value_en TEXT,
    value_fa TEXT,
    value_json JSONB,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'richtext', 'url', 'email', 'phone', 'json', 'number')),
    category TEXT DEFAULT 'general',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default settings
INSERT INTO public.site_settings (key, value_en, value_fa, type, category) VALUES
    -- Contact Info
    ('contact_email', 'sandmanshiri@gmail.com', 'sandmanshiri@gmail.com', 'email', 'contact'),
    ('contact_phone', '+98 920 995 4805', '+98 920 995 4805', 'phone', 'contact'),
    ('contact_location', 'Tehran, Iran', 'تهران، ایران', 'text', 'contact'),

    -- Social Links
    ('social_github', 'https://github.com/SireJeff', 'https://github.com/SireJeff', 'url', 'social'),
    ('social_linkedin', 'https://linkedin.com/in/mohammadhasanshiri', 'https://linkedin.com/in/mohammadhasanshiri', 'url', 'social'),
    ('social_twitter', 'https://x.com/MHasanshiri', 'https://x.com/MHasanshiri', 'url', 'social'),
    ('social_youtube', 'https://www.youtube.com/@sire_jeff', 'https://www.youtube.com/@sire_jeff', 'url', 'social'),
    ('social_telegram', 'https://t.me/Mhasanshiri', 'https://t.me/Mhasanshiri', 'url', 'social'),
    ('social_whatsapp', 'https://wa.me/989209954805', 'https://wa.me/989209954805', 'url', 'social'),
    ('social_instagram', 'https://www.instagram.com/mhasanshiri/', 'https://www.instagram.com/mhasanshiri/', 'url', 'social'),
    ('social_dockerhub', 'https://hub.docker.com/u/sandmanshiri', 'https://hub.docker.com/u/sandmanshiri', 'url', 'social'),
    ('social_virgool', 'https://virgool.io/@sandmanshiri', 'https://virgool.io/@sandmanshiri', 'url', 'social'),

    -- Resume/CV
    ('resume_en_url', '/Mhasanshiri_resume_en.pdf', '/Mhasanshiri_resume_en.pdf', 'url', 'general'),
    ('resume_fa_url', '/Mhasanshiri_resume_fa.pdf', '/Mhasanshiri_resume_fa.pdf', 'url', 'general'),

    -- GitHub Integration
    ('github_username', 'SireJeff', 'SireJeff', 'text', 'github'),
    ('github_sync_enabled', 'false', 'false', 'text', 'github'),
    ('github_sync_last_run', '', '', 'text', 'github'),

    -- External Links (Project section buttons)
    ('external_link_1_name_en', 'Check My Github', 'مشاهده گیت‌هاب من', 'text', 'external'),
    ('external_link_1_name_fa', 'Check My Github', 'مشاهده گیت‌هاب من', 'text', 'external'),
    ('external_link_1_url', 'https://github.com/SireJeff', 'https://github.com/SireJeff', 'url', 'external'),
    ('external_link_1_icon', 'github', 'github', 'text', 'external'),

    ('external_link_2_name_en', 'Watch My Videos', 'مشاهده ویدیوهای من', 'text', 'external'),
    ('external_link_2_name_fa', 'Watch My Videos', 'مشاهده ویدیوهای من', 'text', 'external'),
    ('external_link_2_url', 'https://www.youtube.com/@sire_jeff', 'https://www.youtube.com/@sire_jeff', 'url', 'external'),
    ('external_link_2_icon', 'youtube', 'youtube', 'text', 'external')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are viewable by everyone"
    ON public.site_settings FOR SELECT
    USING (true);

CREATE POLICY "Only admins can update site settings"
    ON public.site_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- PAGE CONTENT (Home/About sections)
-- ============================================
CREATE TABLE IF NOT EXISTS public.page_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Page identification
    page_slug TEXT NOT NULL, -- 'home', 'about'
    section_key TEXT NOT NULL, -- 'hero', 'about-intro', 'skills-preview', 'cta'

    -- Bilingual content
    title_en TEXT,
    title_fa TEXT,
    content_en TEXT, -- Rich text (TipTap JSON)
    content_fa TEXT,

    -- Structured fields (for specific sections)
    field_1_en TEXT,
    field_1_fa TEXT,
    field_2_en TEXT,
    field_2_fa TEXT,
    field_3_en TEXT,
    field_3_fa TEXT,

    -- Media
    image_url TEXT,

    -- Display
    is_enabled BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(page_slug, section_key)
);

-- Seed default sections
INSERT INTO public.page_content (page_slug, section_key, title_en, title_fa, field_1_en, field_1_fa) VALUES
    ('home', 'hero', 'Hero Section', 'بخش هیرو',
     'Hi, I''m', 'سلام، من'),
    ('home', 'about-intro', 'About Intro', 'معرفی',
     'Analytical Researcher | Complex Systems Enthusiast | Data Scientist',
     'پژوهشگر تحلیلی | علاقه‌مند به سیستم‌های پیچیده | دانشمند داده'),
    ('about', 'intro', 'About Introduction', 'معرفی',
     'About Me', 'درباره من'),
    ('about', 'subtitle', 'About Subtitle', 'زیرعنوان',
     'Analytical Researcher | Complex Systems Enthusiast | Data Scientist',
     'پژوهشگر تحلیلی | علاقه‌مند به سیستم‌های پیچیده | دانشمند داده')
ON CONFLICT (page_slug, section_key) DO NOTHING;

CREATE INDEX idx_page_content_page ON public.page_content(page_slug);
CREATE INDEX idx_page_content_enabled ON public.page_content(is_enabled) WHERE is_enabled = TRUE;

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page content is viewable by everyone"
    ON public.page_content FOR SELECT
    USING (
        is_enabled = TRUE OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can manage page content"
    ON public.page_content FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- GITHUB SYNC LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.github_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_type TEXT NOT NULL CHECK (sync_type IN ('repos', 'scheduled_publish')),
    status TEXT NOT NULL CHECK (status IN ('running', 'success', 'error')),
    items_processed INTEGER DEFAULT 0,
    items_created INTEGER DEFAULT 0,
    items_updated INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_github_sync_logs_type ON public.github_sync_logs(sync_type);
CREATE INDEX idx_github_sync_logs_started ON public.github_sync_logs(started_at DESC);

ALTER TABLE public.github_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view sync logs"
    ON public.github_sync_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only system can insert sync logs"
    ON public.github_sync_logs FOR INSERT
    WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_skill_categories_updated_at
    BEFORE UPDATE ON public.skill_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON public.skills
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_page_content_updated_at
    BEFORE UPDATE ON public.page_content
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- SEED DATA: Skill Categories
-- ============================================
INSERT INTO public.skill_categories (slug, name_en, name_fa, description_en, description_fa, color, sort_order) VALUES
    ('data-science', 'Data Science', 'علم داده',
     'Tools for data analysis and machine learning',
     'ابزارهای تحلیل داده و یادگیری ماشین',
     '#3b82f6', 1),

    ('programming', 'Programming', 'برنامه‌نویسی',
     'Programming languages and frameworks',
     'زبان‌ها و فریمورک‌های برنامه‌نویسی',
     '#10b981', 2),

    ('tools', 'Tools & DevOps', 'ابزارها و دواپس',
     'Development tools and DevOps technologies',
     'ابزارهای توسعه و عملیات',
     '#f59e0b', 3),

    ('research', 'Domain Knowledge', 'دانش تخصصی',
     'Academic and research expertise',
     'تخصص‌های آکادمیک و پژوهشی',
     '#8b5cf6', 4),

    ('languages', 'Languages', 'زبان‌ها',
     'Human languages',
     'زبان‌های انسانی',
     '#ec4899', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- STORAGE BUCKETS (Run in Supabase Dashboard)
-- ============================================
-- Note: These buckets use the existing 'articles' bucket with folders
-- No new buckets needed - we'll use folders:
-- - articles/skills/       - Skill icons
-- - articles/projects/     - Project images/screenshots
-- - articles/site-assets/  - Logo, favicon, profile picture
-- - articles/resume/       - Resume/CV files

-- ============================================
-- END OF SCHEMA
-- ============================================
