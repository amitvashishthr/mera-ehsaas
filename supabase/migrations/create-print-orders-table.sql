-- ============================================
-- Migration: Create print_orders table for collection printing
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS public.print_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('book', 'poster', 'frame', 'canvas', 'mug', 'tshirt')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'printing', 'shipped', 'delivered', 'cancelled')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_print_orders_user ON public.print_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_print_orders_status ON public.print_orders(status);
CREATE INDEX IF NOT EXISTS idx_print_orders_created ON public.print_orders(created_at DESC);

-- Updated at trigger
CREATE TRIGGER update_print_orders_updated_at
  BEFORE UPDATE ON public.print_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable RLS
ALTER TABLE public.print_orders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own print orders"
  ON public.print_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all print orders"
  ON public.print_orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Authenticated users can create print orders"
  ON public.print_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update print orders"
  ON public.print_orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can cancel own pending orders"
  ON public.print_orders FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');
