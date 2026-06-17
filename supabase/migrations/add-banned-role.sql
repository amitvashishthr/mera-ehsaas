-- ============================================
-- Migration: Allow 'banned' as a profile role
-- Run this in Supabase SQL Editor
-- ============================================

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'banned'));
