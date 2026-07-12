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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          billing_address: string | null
          business_name: string
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          email: string | null
          gst_number: string | null
          id: string
          industry: string | null
          logo_url: string | null
          notes: string | null
          pan_number: string | null
          phone: string | null
          shipping_address: string | null
          state: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          billing_address?: string | null
          business_name: string
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          notes?: string | null
          pan_number?: string | null
          phone?: string | null
          shipping_address?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          billing_address?: string | null
          business_name?: string
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          notes?: string | null
          pan_number?: string | null
          phone?: string | null
          shipping_address?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bank_details: Json | null
          company_address: string | null
          company_email: string | null
          company_logo_url: string | null
          company_name: string | null
          company_phone: string | null
          company_website: string | null
          created_at: string
          default_currency: string | null
          default_tax_rate: number | null
          default_terms: string | null
          email: string | null
          full_name: string | null
          gst_number: string | null
          id: string
          pan_number: string | null
          updated_at: string
          upi_id: string | null
        }
        Insert: {
          bank_details?: Json | null
          company_address?: string | null
          company_email?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_website?: string | null
          created_at?: string
          default_currency?: string | null
          default_tax_rate?: number | null
          default_terms?: string | null
          email?: string | null
          full_name?: string | null
          gst_number?: string | null
          id: string
          pan_number?: string | null
          updated_at?: string
          upi_id?: string | null
        }
        Update: {
          bank_details?: Json | null
          company_address?: string | null
          company_email?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_website?: string | null
          created_at?: string
          default_currency?: string | null
          default_tax_rate?: number | null
          default_terms?: string | null
          email?: string | null
          full_name?: string | null
          gst_number?: string | null
          id?: string
          pan_number?: string | null
          updated_at?: string
          upi_id?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          documentation: string | null
          end_date: string | null
          id: string
          name: string
          project_type: string | null
          start_date: string | null
          status: string | null
          technology: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          documentation?: string | null
          end_date?: string | null
          id?: string
          name: string
          project_type?: string | null
          start_date?: string | null
          status?: string | null
          technology?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          documentation?: string | null
          end_date?: string | null
          id?: string
          name?: string
          project_type?: string | null
          start_date?: string | null
          status?: string | null
          technology?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          client_id: string | null
          client_snapshot: Json | null
          company_snapshot: Json | null
          created_at: string
          currency: string
          discount_percent: number
          expiry_date: string | null
          features: Json
          id: string
          issue_date: string
          milestones: Json
          notes: string | null
          project_id: string | null
          quotation_number: string
          status: string
          subtotal: number
          tax_percent: number
          terms: string | null
          timeline: Json
          title: string | null
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          client_snapshot?: Json | null
          company_snapshot?: Json | null
          created_at?: string
          currency?: string
          discount_percent?: number
          expiry_date?: string | null
          features?: Json
          id?: string
          issue_date?: string
          milestones?: Json
          notes?: string | null
          project_id?: string | null
          quotation_number: string
          status?: string
          subtotal?: number
          tax_percent?: number
          terms?: string | null
          timeline?: Json
          title?: string | null
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          client_snapshot?: Json | null
          company_snapshot?: Json | null
          created_at?: string
          currency?: string
          discount_percent?: number
          expiry_date?: string | null
          features?: Json
          id?: string
          issue_date?: string
          milestones?: Json
          notes?: string | null
          project_id?: string | null
          quotation_number?: string
          status?: string
          subtotal?: number
          tax_percent?: number
          terms?: string | null
          timeline?: Json
          title?: string | null
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
