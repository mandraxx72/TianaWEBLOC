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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      external_blocked_dates: {
        Row: {
          calendar_id: string | null
          created_at: string
          end_date: string
          external_id: string | null
          id: string
          room_type: string
          source: string
          start_date: string
          synced_at: string
        }
        Insert: {
          calendar_id?: string | null
          created_at?: string
          end_date: string
          external_id?: string | null
          id?: string
          room_type: string
          source: string
          start_date: string
          synced_at?: string
        }
        Update: {
          calendar_id?: string | null
          created_at?: string
          end_date?: string
          external_id?: string | null
          id?: string
          room_type?: string
          source?: string
          start_date?: string
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_blocked_dates_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "external_calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      external_calendars: {
        Row: {
          calendar_url: string
          created_at: string
          id: string
          last_synced_at: string | null
          room_type: string
          source: string
          updated_at: string
        }
        Insert: {
          calendar_url: string
          created_at?: string
          id?: string
          last_synced_at?: string | null
          room_type: string
          source?: string
          updated_at?: string
        }
        Update: {
          calendar_url?: string
          created_at?: string
          id?: string
          last_synced_at?: string | null
          room_type?: string
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_logs: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          error_message: string | null
          event_type: string
          id: string
          payment_reference: string | null
          reservation_id: string | null
          sisp_response: Json | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          payment_reference?: string | null
          reservation_id?: string | null
          sisp_response?: Json | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payment_reference?: string | null
          reservation_id?: string | null
          sisp_response?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_logs_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          min_nights: number | null
          min_total: number | null
          name: string
          room_types: string[] | null
          updated_at: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_nights?: number | null
          min_total?: number | null
          name: string
          room_types?: string[] | null
          updated_at?: string
          valid_from: string
          valid_until: string
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_nights?: number | null
          min_total?: number | null
          name?: string
          room_types?: string[] | null
          updated_at?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          discount_amount: number | null
          guest_email: string
          guest_name: string
          guest_phone: string
          guests: number
          id: string
          nights: number
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          promotion_code: string | null
          promotion_id: string | null
          reservation_number: string
          room_name: string
          room_price: number
          room_type: string
          sisp_transaction_id: string | null
          special_requests: string | null
          status: string
          total_price: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          discount_amount?: number | null
          guest_email: string
          guest_name: string
          guest_phone: string
          guests?: number
          id?: string
          nights: number
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          promotion_code?: string | null
          promotion_id?: string | null
          reservation_number: string
          room_name: string
          room_price: number
          room_type: string
          sisp_transaction_id?: string | null
          special_requests?: string | null
          status?: string
          total_price: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          discount_amount?: number | null
          guest_email?: string
          guest_name?: string
          guest_phone?: string
          guests?: number
          id?: string
          nights?: number
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          promotion_code?: string | null
          promotion_id?: string | null
          reservation_number?: string
          room_name?: string
          room_price?: number
          room_type?: string
          sisp_transaction_id?: string | null
          special_requests?: string | null
          status?: string
          total_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_occupied_dates: {
        Args: { p_room_type?: string }
        Returns: {
          check_in: string
          check_out: string
          room_type: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
      discount_type: "percentage" | "fixed"
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
    Enums: {
      app_role: ["admin", "staff", "user"],
      discount_type: ["percentage", "fixed"],
    },
  },
} as const
