-- ============================================
-- Supabase Storage RLS Policies
-- ============================================
-- Run this in your Supabase SQL Editor
-- This fixes the "new row violates row-level security policy" error
-- ============================================

-- Remove all existing storage policies first
DROP POLICY IF EXISTS "Public articles bucket is viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to articles bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from articles bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update articles bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public avatars bucket is viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- ============================================
-- SIMPLIFIED POLICIES
-- Since we use service role key on server (bypasses RLS),
-- these policies just need to allow basic operations
-- ============================================

-- Allow public read for all storage objects
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (true);

-- Allow authenticated admins to insert
CREATE POLICY "Allow authenticated admin insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Allow authenticated admins to delete
CREATE POLICY "Allow authenticated admin delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Allow authenticated admins to update
CREATE POLICY "Allow authenticated admin update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================
-- VERIFICATION
-- ============================================

-- View all storage policies
-- SELECT * FROM storage.policies;
