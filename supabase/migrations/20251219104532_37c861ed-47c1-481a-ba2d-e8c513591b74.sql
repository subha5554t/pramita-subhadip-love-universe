-- Create tictactoe_games table for real-time multiplayer
CREATE TABLE public.tictactoe_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  player_x_id UUID NOT NULL,
  player_x_name TEXT NOT NULL DEFAULT 'Player X',
  player_o_id UUID,
  player_o_name TEXT DEFAULT 'Player O',
  board_state TEXT[] NOT NULL DEFAULT ARRAY['', '', '', '', '', '', '', '', ''],
  current_turn TEXT NOT NULL DEFAULT 'X',
  winner TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tictactoe_games ENABLE ROW LEVEL SECURITY;

-- Policies for tictactoe games
CREATE POLICY "Anyone can view games by room code" ON public.tictactoe_games FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create games" ON public.tictactoe_games FOR INSERT WITH CHECK (auth.uid() = player_x_id);
CREATE POLICY "Players can update their games" ON public.tictactoe_games FOR UPDATE USING (auth.uid() = player_x_id OR auth.uid() = player_o_id);
CREATE POLICY "Players can delete their games" ON public.tictactoe_games FOR DELETE USING (auth.uid() = player_x_id);

-- Enable realtime for tictactoe
ALTER PUBLICATION supabase_realtime ADD TABLE public.tictactoe_games;

-- Create tictactoe_history table
CREATE TABLE public.tictactoe_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL,
  winner_name TEXT,
  result TEXT NOT NULL,
  player_x_name TEXT NOT NULL,
  player_o_name TEXT NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tictactoe_history ENABLE ROW LEVEL SECURITY;

-- Policies for history
CREATE POLICY "Anyone can view game history by room" ON public.tictactoe_history FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert history" ON public.tictactoe_history FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create bouquets table
CREATE TABLE public.bouquets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  room_code TEXT NOT NULL,
  flowers JSONB NOT NULL DEFAULT '[]',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bouquets ENABLE ROW LEVEL SECURITY;

-- Policies for bouquets
CREATE POLICY "Users can view bouquets in their room" ON public.bouquets FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send bouquets" ON public.bouquets FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can delete their own bouquets" ON public.bouquets FOR DELETE USING (auth.uid() = sender_id);

-- Create wishlist_items table
CREATE TABLE public.wishlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_by_name TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Gift',
  note TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Policies for wishlist
CREATE POLICY "Users can view wishlist items in their room" ON public.wishlist_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create wishlist items" ON public.wishlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users in room can update wishlist items" ON public.wishlist_items FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete their own wishlist items" ON public.wishlist_items FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_tictactoe_games_updated_at
BEFORE UPDATE ON public.tictactoe_games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wishlist_items_updated_at
BEFORE UPDATE ON public.wishlist_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();