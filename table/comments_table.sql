-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]'::jsonb,
  document_urls JSONB DEFAULT '[]'::jsonb,
  youtube_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sponsored BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add sponsored column if it doesn't exist
ALTER TABLE posts ADD COLUMN IF NOT EXISTS sponsored BOOLEAN DEFAULT FALSE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_by ON posts(created_by);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_sponsored ON posts(sponsored);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for posts table
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts table (adjust based on your user authentication setup)
-- For now, allow authenticated users to do everything (you can modify this based on your users table)
CREATE POLICY "Authenticated users can manage posts" ON posts
  FOR ALL USING (auth.role() = 'authenticated');

-- Policy for reading published posts (if you want public access)
CREATE POLICY "Anyone can read published posts" ON posts
  FOR SELECT USING (status = 'published');

-- Create storage buckets for posts media and documents
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for posts bucket
-- Allow authenticated users to upload
CREATE POLICY "Users can upload posts media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'posts'
    AND auth.role() = 'authenticated'
  );

-- Allow public read access
CREATE POLICY "Anyone can view posts media" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete posts media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'posts'
    AND auth.role() = 'authenticated'
  );

-- Comments for documentation
COMMENT ON TABLE posts IS 'Stores admin-created posts with media, documents, and YouTube links';
COMMENT ON COLUMN posts.media_urls IS 'Array of media file URLs (images/videos)';
COMMENT ON COLUMN posts.document_urls IS 'Array of document file URLs';
COMMENT ON COLUMN posts.youtube_url IS 'Optional YouTube video URL';
COMMENT ON COLUMN posts.status IS 'Post status: draft, published, or archived';
COMMENT ON COLUMN posts.sponsored IS 'Whether this post is sponsored content';
