-- Create letters table for persistent love letters
CREATE TABLE public.letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_name TEXT NOT NULL DEFAULT 'Your Love',
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on letters
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

-- Letters policies
CREATE POLICY "Authenticated users can view all letters"
  ON public.letters FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert letters"
  ON public.letters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own letters"
  ON public.letters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own letters"
  ON public.letters FOR DELETE
  USING (auth.uid() = user_id);

-- Create chat_messages table for real-time chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat messages policies - both users can see all messages
CREATE POLICY "Authenticated users can view all chat messages"
  ON public.chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Create story_events table for editable story timeline
CREATE TABLE public.story_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_date TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  milestone BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on story_events
ALTER TABLE public.story_events ENABLE ROW LEVEL SECURITY;

-- Story events policies
CREATE POLICY "Authenticated users can view all story events"
  ON public.story_events FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert story events"
  ON public.story_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own story events"
  ON public.story_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own story events"
  ON public.story_events FOR DELETE
  USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_letters_updated_at
  BEFORE UPDATE ON public.letters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_story_events_updated_at
  BEFORE UPDATE ON public.story_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;