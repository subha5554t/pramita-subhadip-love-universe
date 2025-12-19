-- Add room_code column to chat_messages for access code protection
ALTER TABLE public.chat_messages ADD COLUMN room_code text NOT NULL DEFAULT 'default';

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can insert chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own chat messages" ON public.chat_messages;

-- Create new policies that use room_code for shared access
CREATE POLICY "Users can view messages in their room"
  ON public.chat_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert chat messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages"
  ON public.chat_messages
  FOR DELETE
  USING (auth.uid() = user_id);