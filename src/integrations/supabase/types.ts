export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      book_list_assignments: {
        Row: {
          assigned_at: string
          book_id: string
          id: string
          list_id: string
        }
        Insert: {
          assigned_at?: string
          book_id: string
          id?: string
          list_id: string
        }
        Update: {
          assigned_at?: string
          book_id?: string
          id?: string
          list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_list_assignments_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_list_assignments_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "reading_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      book_shelf_assignments: {
        Row: {
          assigned_at: string
          book_id: string
          id: string
          shelf_id: string
        }
        Insert: {
          assigned_at?: string
          book_id: string
          id?: string
          shelf_id: string
        }
        Update: {
          assigned_at?: string
          book_id?: string
          id?: string
          shelf_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_shelf_assignments_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_shelf_assignments_shelf_id_fkey"
            columns: ["shelf_id"]
            isOneToOne: false
            referencedRelation: "custom_shelves"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          authors: string[] | null
          created_at: string
          custom_tags: string[] | null
          description: string | null
          edition: string | null
          finished_at: string | null
          gbooks_id: string | null
          genres: string[] | null
          id: string
          image_url: string | null
          is_favorite: boolean | null
          isbn: string | null
          language: string | null
          loan_date: string | null
          loan_return_date: string | null
          loan_to: string | null
          page_count: number | null
          pages: number | null
          personal_review: string | null
          publication_year: number | null
          publisher: string | null
          rating: number | null
          reading_context: string | null
          series_name: string | null
          series_order: number | null
          status: Database["public"]["Enums"]["book_status"]
          title: string
          user_id: string
        }
        Insert: {
          authors?: string[] | null
          created_at?: string
          custom_tags?: string[] | null
          description?: string | null
          edition?: string | null
          finished_at?: string | null
          gbooks_id?: string | null
          genres?: string[] | null
          id?: string
          image_url?: string | null
          is_favorite?: boolean | null
          isbn?: string | null
          language?: string | null
          loan_date?: string | null
          loan_return_date?: string | null
          loan_to?: string | null
          page_count?: number | null
          pages?: number | null
          personal_review?: string | null
          publication_year?: number | null
          publisher?: string | null
          rating?: number | null
          reading_context?: string | null
          series_name?: string | null
          series_order?: number | null
          status?: Database["public"]["Enums"]["book_status"]
          title: string
          user_id: string
        }
        Update: {
          authors?: string[] | null
          created_at?: string
          custom_tags?: string[] | null
          description?: string | null
          edition?: string | null
          finished_at?: string | null
          gbooks_id?: string | null
          genres?: string[] | null
          id?: string
          image_url?: string | null
          is_favorite?: boolean | null
          isbn?: string | null
          language?: string | null
          loan_date?: string | null
          loan_return_date?: string | null
          loan_to?: string | null
          page_count?: number | null
          pages?: number | null
          personal_review?: string | null
          publication_year?: number | null
          publisher?: string | null
          rating?: number | null
          reading_context?: string | null
          series_name?: string | null
          series_order?: number | null
          status?: Database["public"]["Enums"]["book_status"]
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_shelves: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      pending_rewards: {
        Row: {
          book_id: string
          book_pages: number
          book_title: string
          completed_at: string
          created_at: string | null
          id: string
          processed_at: string | null
          reward_amount: number
          status: string | null
          transaction_hash: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          book_id: string
          book_pages: number
          book_title: string
          completed_at: string
          created_at?: string | null
          id?: string
          processed_at?: string | null
          reward_amount: number
          status?: string | null
          transaction_hash?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          book_id?: string
          book_pages?: number
          book_title?: string
          completed_at?: string
          created_at?: string | null
          id?: string
          processed_at?: string | null
          reward_amount?: number
          status?: string | null
          transaction_hash?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_rewards_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_goals: {
        Row: {
          created_at: string
          id: string
          target_books: number
          target_pages: number | null
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          target_books: number
          target_pages?: number | null
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          target_books?: number
          target_pages?: number | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      reading_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_wishlist: boolean | null
          name: string
          priority: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_wishlist?: boolean | null
          name: string
          priority?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_wishlist?: boolean | null
          name?: string
          priority?: number | null
          user_id?: string
        }
        Relationships: []
      }
      reading_logs: {
        Row: {
          book_id: string
          created_at: string
          current_page: number
          date: string
          id: string
          notes: string | null
          reward_amount: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          current_page: number
          date?: string
          id?: string
          notes?: string | null
          reward_amount?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          current_page?: number
          date?: string
          id?: string
          notes?: string | null
          reward_amount?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_logs_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          wallet_address: string | null
          wallet_network: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
          wallet_network?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
          wallet_network?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_completed_rewards: {
        Args: { user_uuid: string }
        Returns: {
          total_completed: number
          total_amount: number
        }[]
      }
      get_user_pending_rewards: {
        Args: { user_uuid: string }
        Returns: {
          total_pending: number
          total_amount: number
        }[]
      }
      mark_reward_processed: {
        Args: { reward_id: string; transaction_hash?: string }
        Returns: boolean
      }
      verify_aura_coin_integrity: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          status: string
          details: string
        }[]
      }
    }
    Enums: {
      book_status: "to-read" | "reading" | "read"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      book_status: ["to-read", "reading", "read"],
    },
  },
} as const
