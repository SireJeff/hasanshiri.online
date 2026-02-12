-- =====================================================
-- User AI Presets Table Migration
-- Stores user's OpenRouter preset slug preferences
-- =====================================================

-- Create user_ai_presets table
CREATE TABLE IF NOT EXISTS user_ai_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  presets JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_ai_presets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only select their own presets
CREATE POLICY user_presets_select ON user_ai_presets
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own presets (with valid user_id)
CREATE POLICY user_presets_insert ON user_ai_presets
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND user_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM profiles WHERE id = user_id)
  );

-- Policy: Users can update their own presets
CREATE POLICY user_presets_update ON user_ai_presets
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own presets
CREATE POLICY user_presets_delete ON user_ai_presets
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_ai_presets_user_id ON user_ai_presets(user_id);

-- Add comment for documentation
COMMENT ON TABLE user_ai_presets IS 'Stores user-specific OpenRouter AI preset slugs configured via OpenRouter web dashboard';
COMMENT ON COLUMN user_ai_presets.presets IS 'JSON object containing preset slugs (e.g., {"translateFast": "@preset/translate-fast", "generate": "@preset/article-generator"})';
