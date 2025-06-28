export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_info: {
        Row: {
          alias: string | null
          balance: number
          equity: number
          free_margin: number
          id: string
          leverage: number
          login: number
          margin: number
          timestamp: string
          user_id: string | null
        }
        Insert: {
          alias?: string | null
          balance: number
          equity: number
          free_margin: number
          id?: string
          leverage: number
          login: number
          margin: number
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          alias?: string | null
          balance?: number
          equity?: number
          free_margin?: number
          id?: string
          leverage?: number
          login?: number
          margin?: number
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_info_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_info: {
        Row: {
          active: boolean
          broker_name: string
          button_label: string
          created_at: string
          id: string
          link: string
          logo_url: string
          message_body: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          broker_name: string
          button_label?: string
          created_at?: string
          id?: string
          link: string
          logo_url: string
          message_body: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          broker_name?: string
          button_label?: string
          created_at?: string
          id?: string
          link?: string
          logo_url?: string
          message_body?: string
          updated_at?: string
        }
        Relationships: []
      }
      api_audit_logs: {
        Row: {
          endpoint: string
          id: string
          ip_address: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          endpoint: string
          id?: string
          ip_address: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          endpoint?: string
          id?: string
          ip_address?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_details: {
        Row: {
          account_number: string
          bank_name: string
          branch_code: string
          cardholder_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          account_number: string
          bank_name: string
          branch_code: string
          cardholder_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string
          bank_name?: string
          branch_code?: string
          cardholder_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      currency_pairs: {
        Row: {
          active: boolean
          created_at: string
          display_name: string | null
          id: string
          symbol: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_name?: string | null
          id?: string
          symbol: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_name?: string | null
          id?: string
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      economic_events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      growth_plan_trades: {
        Row: {
          actual_profit_loss: number
          created_at: string
          growth_plan_id: string
          hit_target: boolean
          id: string
          notes: string | null
          trade_date: string
        }
        Insert: {
          actual_profit_loss: number
          created_at?: string
          growth_plan_id: string
          hit_target: boolean
          id?: string
          notes?: string | null
          trade_date?: string
        }
        Update: {
          actual_profit_loss?: number
          created_at?: string
          growth_plan_id?: string
          hit_target?: boolean
          id?: string
          notes?: string | null
          trade_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "growth_plan_trades_growth_plan_id_fkey"
            columns: ["growth_plan_id"]
            isOneToOne: false
            referencedRelation: "growth_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_plans: {
        Row: {
          created_at: string
          current_balance: number
          estimated_trades: number
          id: string
          is_active: boolean
          profit_per_trade: number
          risk_level: string
          risk_per_trade: number
          risk_percentage: number
          starting_balance: number
          target_balance: number
          trades_completed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_balance: number
          estimated_trades: number
          id?: string
          is_active?: boolean
          profit_per_trade: number
          risk_level: string
          risk_per_trade: number
          risk_percentage: number
          starting_balance: number
          target_balance: number
          trades_completed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_balance?: number
          estimated_trades?: number
          id?: string
          is_active?: boolean
          profit_per_trade?: number
          risk_level?: string
          risk_per_trade?: number
          risk_percentage?: number
          starting_balance?: number
          target_balance?: number
          trades_completed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_checklists: {
        Row: {
          created_at: string | null
          description: string
          full_items: Json
          id: string
          is_active: boolean | null
          is_free: boolean
          preview_items: Json | null
          price: number
          screenshot_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          full_items: Json
          id?: string
          is_active?: boolean | null
          is_free?: boolean
          preview_items?: Json | null
          price?: number
          screenshot_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          full_items?: Json
          id?: string
          is_active?: boolean | null
          is_free?: boolean
          preview_items?: Json | null
          price?: number
          screenshot_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      payment_submissions: {
        Row: {
          id: string
          marketplace_checklist_id: string
          notes: string | null
          proof_file_url: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          user_email: string
          user_id: string
        }
        Insert: {
          id?: string
          marketplace_checklist_id: string
          notes?: string | null
          proof_file_url: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          user_email: string
          user_id: string
        }
        Update: {
          id?: string
          marketplace_checklist_id?: string
          notes?: string | null
          proof_file_url?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          user_email?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_submissions_marketplace_checklist_id_fkey"
            columns: ["marketplace_checklist_id"]
            isOneToOne: false
            referencedRelation: "marketplace_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          created_at: string
          event_id: string
          id: string
          month_year: string
          prediction_side: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          month_year?: string
          prediction_side: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          month_year?: string
          prediction_side?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "economic_events"
            referencedColumns: ["id"]
          },
        ]
      }
      strategies: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      strategy_checklist_items: {
        Row: {
          content: string
          created_at: string
          id: string
          is_checked: boolean
          position: number
          strategy_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_checked?: boolean
          position?: number
          strategy_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_checked?: boolean
          position?: number
          strategy_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_checklist_items_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_instructions: {
        Row: {
          created_at: string | null
          html_content: string | null
          id: string
          instruction_image_path: string | null
          instruction_text: string | null
          instruction_video_path: string | null
          marketplace_checklist_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          html_content?: string | null
          id?: string
          instruction_image_path?: string | null
          instruction_text?: string | null
          instruction_video_path?: string | null
          marketplace_checklist_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          html_content?: string | null
          id?: string
          instruction_image_path?: string | null
          instruction_text?: string | null
          instruction_video_path?: string | null
          marketplace_checklist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_instructions_marketplace_checklist_id_fkey"
            columns: ["marketplace_checklist_id"]
            isOneToOne: false
            referencedRelation: "marketplace_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_info: {
        Row: {
          account_alias: string | null
          current_price: number
          id: string
          open_price: number
          open_time: string
          profit: number
          symbol: string
          ticket: number
          timestamp: string
          type: number
          user_id: string | null
          volume: number
        }
        Insert: {
          account_alias?: string | null
          current_price: number
          id?: string
          open_price: number
          open_time: string
          profit: number
          symbol: string
          ticket: number
          timestamp?: string
          type: number
          user_id?: string | null
          volume: number
        }
        Update: {
          account_alias?: string | null
          current_price?: number
          id?: string
          open_price?: number
          open_time?: string
          profit?: number
          symbol?: string
          ticket?: number
          timestamp?: string
          type?: number
          user_id?: string | null
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "trade_info_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          account_id: string | null
          checklist_items_checked: Json | null
          checklist_used_id: string | null
          created_at: string
          direction: string
          entry_price: number | null
          entry_time: string | null
          exit_price: number | null
          exit_time: string | null
          holding_duration_minutes: number | null
          id: string
          is_break_even: boolean | null
          notes: string | null
          pair: string
          profit_loss: number
          result: string
          risk_reward_ratio: number | null
          screenshot_url: string | null
          strategy_id: string | null
          strategy_used: string | null
          trade_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          checklist_items_checked?: Json | null
          checklist_used_id?: string | null
          created_at?: string
          direction: string
          entry_price?: number | null
          entry_time?: string | null
          exit_price?: number | null
          exit_time?: string | null
          holding_duration_minutes?: number | null
          id?: string
          is_break_even?: boolean | null
          notes?: string | null
          pair: string
          profit_loss: number
          result: string
          risk_reward_ratio?: number | null
          screenshot_url?: string | null
          strategy_id?: string | null
          strategy_used?: string | null
          trade_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          checklist_items_checked?: Json | null
          checklist_used_id?: string | null
          created_at?: string
          direction?: string
          entry_price?: number | null
          entry_time?: string | null
          exit_price?: number | null
          exit_time?: string | null
          holding_duration_minutes?: number | null
          id?: string
          is_break_even?: boolean | null
          notes?: string | null
          pair?: string
          profit_loss?: number
          result?: string
          risk_reward_ratio?: number | null
          screenshot_url?: string | null
          strategy_id?: string | null
          strategy_used?: string | null
          trade_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_trades_strategy"
            columns: ["strategy_used"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          notification_id: string
          read: boolean
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_id: string
          read?: boolean
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_id?: string
          read?: boolean
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_performance_reports: {
        Row: {
          generated_at: string
          id: string
          performance_label: string
          report_data: Json
          trades_analyzed: number
          user_id: string
        }
        Insert: {
          generated_at?: string
          id?: string
          performance_label: string
          report_data: Json
          trades_analyzed?: number
          user_id: string
        }
        Update: {
          generated_at?: string
          id?: string
          performance_label?: string
          report_data?: Json
          trades_analyzed?: number
          user_id?: string
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          amount_paid: number
          approval_status: string | null
          id: string
          marketplace_checklist_id: string
          payment_submission_id: string | null
          purchase_date: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_paid: number
          approval_status?: string | null
          id?: string
          marketplace_checklist_id: string
          payment_submission_id?: string | null
          purchase_date?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          approval_status?: string | null
          id?: string
          marketplace_checklist_id?: string
          payment_submission_id?: string | null
          purchase_date?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_marketplace_checklist_id_fkey"
            columns: ["marketplace_checklist_id"]
            isOneToOne: false
            referencedRelation: "marketplace_checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_purchases_payment_submission_id_fkey"
            columns: ["payment_submission_id"]
            isOneToOne: false
            referencedRelation: "payment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          api_key: string | null
          api_key_expires_at: string | null
          created_at: string
          has_supported: boolean | null
          id: string
          is_active: boolean | null
        }
        Insert: {
          api_key?: string | null
          api_key_expires_at?: string | null
          created_at?: string
          has_supported?: boolean | null
          id: string
          is_active?: boolean | null
        }
        Update: {
          api_key?: string | null
          api_key_expires_at?: string | null
          created_at?: string
          has_supported?: boolean | null
          id?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_event_prediction_counts: {
        Args: { event_uuid: string; target_month?: string }
        Returns: {
          usd_strong_count: number
          usd_weak_count: number
        }[]
      }
      revoke_api_key: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
