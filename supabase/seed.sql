-- ============================================
-- Seed Data for MeraEhsaas
-- Run after schema and RLS policies
-- ============================================

-- Insert default categories
INSERT INTO public.categories (name, slug) VALUES
  ('Poetry', 'poetry'),
  ('Story', 'story'),
  ('Thought', 'thought'),
  ('Quote', 'quote'),
  ('Shayari', 'shayari'),
  ('Motivation', 'motivation'),
  ('Love', 'love'),
  ('Sadness', 'sadness'),
  ('Life', 'life'),
  ('Friendship', 'friendship');

-- Insert default tags
INSERT INTO public.tags (name, slug) VALUES
  ('Hindi', 'hindi'),
  ('Urdu', 'urdu'),
  ('English', 'english'),
  ('Romantic', 'romantic'),
  ('Inspirational', 'inspirational'),
  ('Heartbreak', 'heartbreak'),
  ('Nature', 'nature'),
  ('Self-love', 'self-love'),
  ('Family', 'family'),
  ('Faith', 'faith');
