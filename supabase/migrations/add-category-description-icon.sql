-- ============================================
-- Migration: Add description and icon to categories
-- Run this in Supabase SQL Editor
-- ============================================

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '📝';

-- Update existing seed categories with descriptions and icons
UPDATE public.categories SET icon = '📜', description = 'Express your emotions through beautiful verses' WHERE slug = 'poetry';
UPDATE public.categories SET icon = '📖', description = 'Short stories and narratives that move the soul' WHERE slug = 'story';
UPDATE public.categories SET icon = '💭', description = 'Reflections, musings, and deep thoughts' WHERE slug = 'thought';
UPDATE public.categories SET icon = '✨', description = 'Powerful quotes to inspire and uplift' WHERE slug = 'quote';
UPDATE public.categories SET icon = '🌙', description = 'Urdu and Hindi shayari from the heart' WHERE slug = 'shayari';
UPDATE public.categories SET icon = '🔥', description = 'Words that ignite passion and drive' WHERE slug = 'motivation';
UPDATE public.categories SET icon = '💕', description = 'Writings about love, longing, and connection' WHERE slug = 'love';
UPDATE public.categories SET icon = '🌧️', description = 'Pouring out the sadness within' WHERE slug = 'sadness';
UPDATE public.categories SET icon = '🌿', description = 'Reflections on life, growth, and meaning' WHERE slug = 'life';
UPDATE public.categories SET icon = '🤝', description = 'Celebrating bonds of friendship' WHERE slug = 'friendship';
