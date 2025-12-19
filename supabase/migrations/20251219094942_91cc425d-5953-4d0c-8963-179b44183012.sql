-- Drop the overly permissive SELECT policy on chat_messages
DROP POLICY IF EXISTS "Authenticated users can view all chat messages" ON public.chat_messages;

-- Create a new policy that restricts users to only see their own messages
CREATE POLICY "Users can view their own chat messages"
  ON public.chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);