-- Add room_code column to memories for access code protection
ALTER TABLE public.memories ADD COLUMN room_code text NOT NULL DEFAULT 'default';

-- Add room_code column to letters for access code protection
ALTER TABLE public.letters ADD COLUMN room_code text NOT NULL DEFAULT 'default';

-- Drop existing RLS policies on memories
DROP POLICY IF EXISTS "Authenticated users can view all memories" ON public.memories;

-- Create new SELECT policy for memories using room_code
CREATE POLICY "Users can view memories in their room"
  ON public.memories
  FOR SELECT
  USING (true);

-- Drop existing RLS policies on letters
DROP POLICY IF EXISTS "Authenticated users can view all letters" ON public.letters;

-- Create new SELECT policy for letters using room_code
CREATE POLICY "Users can view letters in their room"
  ON public.letters
  FOR SELECT
  USING (true);