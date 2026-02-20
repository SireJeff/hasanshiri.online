-- =====================================================
-- Add unique constraint to user_ai_presets.user_id
-- Ensures only one presets record per user
-- =====================================================

-- Add unique constraint on user_id
-- This allows upsert operations to work correctly
CREATE UNIQUE INDEX IF NOT EXISTS user_ai_presets_user_id_unique
ON user_ai_presets(user_id);
