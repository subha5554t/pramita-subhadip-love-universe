export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bouquets: {
        Row: {
          created_at: string
          flowers: Json
          id: string
          message: string | null
          room_code: string
          sender_id: string
          sender_name: string
        }
        Insert: {
          created_at?: string
          flowers?: Json
          id?: string
          message?: string | null
          room_code: string
          sender_id: string
          sender_name: string
        }
        Update: {
          created_at?: string
          flowers?: Json
          id?: string
          message?: string | null
          room_code?: string
          sender_id?: string
          sender_name?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          room_code: string
          sender_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          room_code?: string
          sender_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          room_code?: string
          sender_name?: string
          user_id?: string
        }
        Relationships: []
      }
      letters: {
        Row: {
          content: string
          created_at: string
          from_name: string
          id: string
          read: boolean
          room_code: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          from_name?: string
          id?: string
          read?: boolean
          room_code?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          from_name?: string
          id?: string
          read?: boolean
          room_code?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memories: {
        Row: {
          created_at: string
          emotion: string
          id: string
          image_url: string | null
          memory_date: string
          note: string | null
          place: string | null
          room_code: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emotion: string
          id?: string
          image_url?: string | null
          memory_date: string
          note?: string | null
          place?: string | null
          room_code?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emotion?: string
          id?: string
          image_url?: string | null
          memory_date?: string
          note?: string | null
          place?: string | null
          room_code?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      story_events: {
        Row: {
          created_at: string
          description: string
          event_date: string
          id: string
          milestone: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          event_date: string
          id?: string
          milestone?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          event_date?: string
          id?: string
          milestone?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tictactoe_games: {
        Row: {
          board_state: string[]
          created_at: string
          current_turn: string
          id: string
          player_o_id: string | null
          player_o_name: string | null
          player_x_id: string
          player_x_name: string
          room_code: string
          status: string
          updated_at: string
          winner: string | null
        }
        Insert: {
          board_state?: string[]
          created_at?: string
          current_turn?: string
          id?: string
          player_o_id?: string | null
          player_o_name?: string | null
          player_x_id: string
          player_x_name?: string
          room_code: string
          status?: string
          updated_at?: string
          winner?: string | null
        }
        Update: {
          board_state?: string[]
          created_at?: string
          current_turn?: string
          id?: string
          player_o_id?: string | null
          player_o_name?: string | null
          player_x_id?: string
          player_x_name?: string
          room_code?: string
          status?: string
          updated_at?: string
          winner?: string | null
        }
        Relationships: []
      }
      tictactoe_history: {
        Row: {
          id: string
          played_at: string
          player_o_name: string
          player_x_name: string
          result: string
          room_code: string
          winner_name: string | null
        }
        Insert: {
          id?: string
          played_at?: string
          player_o_name: string
          player_x_name: string
          result: string
          room_code: string
          winner_name?: string | null
        }
        Update: {
          id?: string
          played_at?: string
          player_o_name?: string
          player_x_name?: string
          result?: string
          room_code?: string
          winner_name?: string | null
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          category: string
          completed: boolean
          completed_at: string | null
          created_at: string
          created_by_name: string
          id: string
          note: string | null
          room_code: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          created_by_name: string
          id?: string
          note?: string | null
          room_code: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          created_by_name?: string
          id?: string
          note?: string | null
          room_code?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
