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
      branch_activity: {
        Row: {
          action: string
          branch_id: string
          id: string
          performed_at: string
          performed_by: string
        }
        Insert: {
          action: string
          branch_id: string
          id?: string
          performed_at?: string
          performed_by: string
        }
        Update: {
          action?: string
          branch_id?: string
          id?: string
          performed_at?: string
          performed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_activity_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_activity_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_inventory: {
        Row: {
          branch_id: string
          ingredient_id: string
          last_change: number
          last_checked: string | null
          on_hand_qty: number
          reorder_pt: number
        }
        Insert: {
          branch_id: string
          ingredient_id: string
          last_change?: number
          last_checked?: string | null
          on_hand_qty?: number
          reorder_pt?: number
        }
        Update: {
          branch_id?: string
          ingredient_id?: string
          last_change?: number
          last_checked?: string | null
          on_hand_qty?: number
          reorder_pt?: number
        }
        Relationships: [
          {
            foreignKeyName: "branch_inventory_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_inventory_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          is_open: boolean
          name: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          is_open?: boolean
          name: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          is_open?: boolean
          name?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      ingredient_cost_history: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          ingredient_id: string
          new_cost: number
          previous_cost: number | null
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: string
          ingredient_id: string
          new_cost: number
          previous_cost?: number | null
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          ingredient_id?: string
          new_cost?: number
          previous_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_cost_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_cost_history_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          branch_id: string | null
          category_id: string | null
          cost_per_unit: number | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          unit: string
        }
        Insert: {
          branch_id?: string | null
          category_id?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          unit: string
        }
        Update: {
          branch_id?: string | null
          category_id?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          branch_id: string | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          role: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          role?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      request_items: {
        Row: {
          created_at: string | null
          current_qty: number | null
          fulfilled: boolean | null
          id: string
          ingredient_id: string
          note: string | null
          quantity: number
          recommended_qty: number | null
          request_id: string
        }
        Insert: {
          created_at?: string | null
          current_qty?: number | null
          fulfilled?: boolean | null
          id?: string
          ingredient_id: string
          note?: string | null
          quantity: number
          recommended_qty?: number | null
          request_id: string
        }
        Update: {
          created_at?: string | null
          current_qty?: number | null
          fulfilled?: boolean | null
          id?: string
          ingredient_id?: string
          note?: string | null
          quantity?: number
          recommended_qty?: number | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          branch_id: string
          created_at: string | null
          id: string
          requested_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          id?: string
          requested_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          id?: string
          requested_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "store_staff"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      stock_check_items: {
        Row: {
          created_at: string | null
          id: string
          ingredient_id: string
          on_hand_qty: number
          stock_check_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ingredient_id: string
          on_hand_qty: number
          stock_check_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ingredient_id?: string
          on_hand_qty?: number
          stock_check_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_check_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_check_items_stock_check_id_fkey"
            columns: ["stock_check_id"]
            isOneToOne: false
            referencedRelation: "stock_checks"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_check_settings: {
        Row: {
          auto_reorder: boolean
          branch_id: string
          id: string
          show_stock_detail: boolean
          updated_at: string
        }
        Insert: {
          auto_reorder?: boolean
          branch_id: string
          id?: string
          show_stock_detail?: boolean
          updated_at?: string
        }
        Update: {
          auto_reorder?: boolean
          branch_id?: string
          id?: string
          show_stock_detail?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_check_settings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: true
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_checks: {
        Row: {
          branch_id: string
          checked_at: string | null
          created_at: string | null
          id: string
          user_id: string
          username: string | null
        }
        Insert: {
          branch_id: string
          checked_at?: string | null
          created_at?: string | null
          id?: string
          user_id: string
          username?: string | null
        }
        Update: {
          branch_id?: string
          checked_at?: string | null
          created_at?: string | null
          id?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_checks_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_checks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "store_staff"
            referencedColumns: ["id"]
          },
        ]
      }
      store_staff: {
        Row: {
          branch_id: string | null
          created_at: string | null
          id: string
          staff_name: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          staff_name: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          staff_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_staff_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_open: boolean
          name: string
          owner_id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_open?: boolean
          name: string
          owner_id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_open?: boolean
          name?: string
          owner_id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_ingredient_cost: {
        Args: { p_ingr_id: string; p_new_cost: number; p_user_id: string }
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
