-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  unique_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pastes table
CREATE TABLE IF NOT EXISTS pastes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'plaintext',
  is_public BOOLEAN NOT NULL DEFAULT true,
  password TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_unique_code ON users(unique_code);
CREATE INDEX IF NOT EXISTS idx_pastes_user_id ON pastes(user_id);
CREATE INDEX IF NOT EXISTS idx_pastes_slug ON pastes(slug);
CREATE INDEX IF NOT EXISTS idx_pastes_created_at ON pastes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastes ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for pastes table
CREATE POLICY "Users can view their own pastes" ON pastes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public pastes" ON pastes
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create pastes" ON pastes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pastes" ON pastes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pastes" ON pastes
  FOR DELETE USING (auth.uid() = user_id);
