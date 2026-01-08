-- ============================================
-- Database Schema for hasanshiri.online Blog
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & PROFILES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'guest')),
    bio TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- CATEGORIES
-- ============================================

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_fa TEXT NOT NULL,
    description_en TEXT,
    description_fa TEXT,
    color TEXT DEFAULT '#3b82f6',
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
    ON public.categories FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage categories"
    ON public.categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- TAGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_fa TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Tags policies
CREATE POLICY "Tags are viewable by everyone"
    ON public.tags FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage tags"
    ON public.tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- ARTICLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,

    -- Bilingual content
    title_en TEXT NOT NULL,
    title_fa TEXT NOT NULL,
    excerpt_en TEXT,
    excerpt_fa TEXT,
    content_en TEXT,
    content_fa TEXT,

    -- Media
    featured_image TEXT,
    og_image TEXT,

    -- Relations
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,

    -- Status & scheduling
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,

    -- SEO
    meta_title_en TEXT,
    meta_title_fa TEXT,
    meta_description_en TEXT,
    meta_description_fa TEXT,

    -- Stats
    view_count INTEGER DEFAULT 0,
    reading_time_minutes INTEGER DEFAULT 5,

    -- Featured
    is_featured BOOLEAN DEFAULT FALSE,
    featured_order INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_articles_category ON public.articles(category_id);
CREATE INDEX idx_articles_author ON public.articles(author_id);

-- Enable RLS on articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Articles policies
CREATE POLICY "Published articles are viewable by everyone"
    ON public.articles FOR SELECT
    USING (status = 'published' OR auth.uid() IN (
        SELECT id FROM public.profiles WHERE role = 'admin'
    ));

CREATE POLICY "Only admins can manage articles"
    ON public.articles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- ARTICLE TAGS (Junction Table)
-- ============================================

CREATE TABLE IF NOT EXISTS public.article_tags (
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- Enable RLS on article_tags
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;

-- Article tags policies
CREATE POLICY "Article tags are viewable by everyone"
    ON public.article_tags FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage article tags"
    ON public.article_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- COMMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,

    -- User info (for registered users)
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Guest info (for non-registered users)
    guest_name TEXT,
    guest_email TEXT,

    -- Parent comment for threading
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,

    -- Content
    content TEXT NOT NULL,

    -- Moderation
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam', 'rejected')),

    -- Metadata
    ip_address INET,
    user_agent TEXT,

    -- Reactions
    likes_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for comments
CREATE INDEX idx_comments_article ON public.comments(article_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_id);
CREATE INDEX idx_comments_status ON public.comments(status);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Approved comments are viewable by everyone"
    ON public.comments FOR SELECT
    USING (
        status = 'approved'
        OR user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Authenticated users can create comments"
    ON public.comments FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        OR (guest_name IS NOT NULL AND guest_email IS NOT NULL)
    );

CREATE POLICY "Users can update their own comments"
    ON public.comments FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Only admins can delete comments"
    ON public.comments FOR DELETE
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- CHAT MESSAGES (Contact Form)
-- ============================================

CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Visitor info
    visitor_name TEXT,
    visitor_email TEXT,

    -- Session tracking
    session_token TEXT UNIQUE NOT NULL,

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_token ON public.chat_sessions(session_token);
CREATE INDEX idx_chat_sessions_status ON public.chat_sessions(status);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Chat sessions policies
CREATE POLICY "Users can view their own sessions"
    ON public.chat_sessions FOR SELECT
    USING (
        session_token = current_setting('app.session_token', true)
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Anyone can create chat sessions"
    ON public.chat_sessions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Only admins can manage all sessions"
    ON public.chat_sessions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,

    -- Sender
    sender_type TEXT NOT NULL CHECK (sender_type IN ('visitor', 'admin')),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Content
    message TEXT NOT NULL,

    -- Read status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat messages policies (similar to sessions)
CREATE POLICY "Users can view messages in their sessions"
    ON public.chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_sessions
            WHERE id = session_id
            AND (
                session_token = current_setting('app.session_token', true)
                OR EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Anyone can send messages to their session"
    ON public.chat_messages FOR INSERT
    WITH CHECK (true);

-- ============================================
-- VIEWS FOR STATISTICS
-- ============================================

-- Article view tracking
CREATE TABLE IF NOT EXISTS public.article_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_article_views_article ON public.article_views(article_id);
CREATE INDEX idx_article_views_date ON public.article_views(viewed_at);

-- Enable RLS
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

-- Article views policies
CREATE POLICY "Anyone can record views"
    ON public.article_views FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Only admins can view analytics"
    ON public.article_views FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to increment article view count
CREATE OR REPLACE FUNCTION public.increment_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.articles
    SET view_count = view_count + 1
    WHERE id = NEW.article_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_article_view
    AFTER INSERT ON public.article_views
    FOR EACH ROW EXECUTE FUNCTION public.increment_view_count();

-- Function to calculate reading time
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content TEXT)
RETURNS INTEGER AS $$
DECLARE
    word_count INTEGER;
    words_per_minute INTEGER := 200;
BEGIN
    -- Count words (rough estimate)
    word_count := array_length(regexp_split_to_array(content, '\s+'), 1);
    RETURN GREATEST(1, CEIL(word_count::FLOAT / words_per_minute));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (Optional - Default Categories)
-- ============================================

INSERT INTO public.categories (slug, name_en, name_fa, description_en, description_fa, color, sort_order)
VALUES
    ('technology', 'Technology', 'تکنولوژی', 'Articles about technology and software', 'مقالات درباره تکنولوژی و نرم‌افزار', '#3b82f6', 1),
    ('data-science', 'Data Science', 'علم داده', 'Data analysis and machine learning', 'تحلیل داده و یادگیری ماشین', '#10b981', 2),
    ('physics', 'Physics', 'فیزیک', 'Physics and complex systems', 'فیزیک و سیستم‌های پیچیده', '#8b5cf6', 3),
    ('thoughts', 'Thoughts', 'اندیشه‌ها', 'Personal thoughts and opinions', 'افکار و نظرات شخصی', '#f59e0b', 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- STORAGE BUCKETS (Run in Supabase Dashboard)
-- ============================================
-- Note: Create these buckets in the Supabase Dashboard > Storage
-- 1. 'articles' - for article images (public)
-- 2. 'avatars' - for user avatars (public)

-- Grant permissions (run after creating buckets):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('articles', 'articles', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- ============================================
-- END OF SCHEMA
-- ============================================
