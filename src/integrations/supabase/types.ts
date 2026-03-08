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
      abandoned_leads: {
        Row: {
          commune: string
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
          product_id: string | null
          product_title: string
          status: string
          wilaya: string
        }
        Insert: {
          commune?: string
          created_at?: string
          customer_name?: string
          customer_phone: string
          id?: string
          product_id?: string | null
          product_title: string
          status?: string
          wilaya?: string
        }
        Update: {
          commune?: string
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          product_id?: string | null
          product_title?: string
          status?: string
          wilaya?: string
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_leads_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_items: {
        Row: {
          bundle_id: string
          id: string
          product_id: string
        }
        Insert: {
          bundle_id: string
          id?: string
          product_id: string
        }
        Update: {
          bundle_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      bundles: {
        Row: {
          bundle_price: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          bundle_price: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          bundle_price?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      exit_intent_popups: {
        Row: {
          created_at: string
          cta_text: string
          discount_code: string | null
          discount_percent: number | null
          id: string
          is_active: boolean
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_text?: string
          discount_code?: string | null
          discount_percent?: number | null
          id?: string
          is_active?: boolean
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_text?: string
          discount_code?: string | null
          discount_percent?: number | null
          id?: string
          is_active?: boolean
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      landing_page_sections: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_visible: boolean
          landing_page_id: string
          position: number
          section_type: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          landing_page_id: string
          position?: number
          section_type: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          landing_page_id?: string
          position?: number
          section_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_page_sections_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          product_id: string
          slug: string
          template: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          product_id: string
          slug: string
          template?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          product_id?: string
          slug?: string
          template?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_upsell_tracking: {
        Row: {
          accepted: boolean
          created_at: string
          discount_percent: number
          id: string
          order_id: string
          upsell_price: number
          upsell_product_id: string
          upsell_product_title: string
        }
        Insert: {
          accepted: boolean
          created_at?: string
          discount_percent: number
          id?: string
          order_id: string
          upsell_price: number
          upsell_product_id: string
          upsell_product_title: string
        }
        Update: {
          accepted?: boolean
          created_at?: string
          discount_percent?: number
          id?: string
          order_id?: string
          upsell_price?: number
          upsell_product_id?: string
          upsell_product_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_upsell_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_upsell_tracking_upsell_product_id_fkey"
            columns: ["upsell_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          commune: string
          created_at: string
          customer_name: string
          customer_phone: string
          delivery_type: string
          id: string
          product_id: string | null
          product_price: number
          product_title: string
          quantity: number
          shipping_price: number
          status: string
          total_price: number
          updated_at: string
          wilaya: string
        }
        Insert: {
          commune: string
          created_at?: string
          customer_name: string
          customer_phone: string
          delivery_type: string
          id?: string
          product_id?: string | null
          product_price: number
          product_title: string
          quantity?: number
          shipping_price?: number
          status?: string
          total_price: number
          updated_at?: string
          wilaya: string
        }
        Update: {
          commune?: string
          created_at?: string
          customer_name?: string
          customer_phone?: string
          delivery_type?: string
          id?: string
          product_id?: string | null
          product_price?: number
          product_title?: string
          quantity?: number
          shipping_price?: number
          status?: string
          total_price?: number
          updated_at?: string
          wilaya?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      post_order_upsells: {
        Row: {
          accept_text: string
          created_at: string
          decline_text: string
          discount_percent: number
          headline: string
          id: string
          is_active: boolean
          source_product_id: string
          upsell_product_id: string
        }
        Insert: {
          accept_text?: string
          created_at?: string
          decline_text?: string
          discount_percent?: number
          headline?: string
          id?: string
          is_active?: boolean
          source_product_id: string
          upsell_product_id: string
        }
        Update: {
          accept_text?: string
          created_at?: string
          decline_text?: string
          discount_percent?: number
          headline?: string
          id?: string
          is_active?: boolean
          source_product_id?: string
          upsell_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_order_upsells_source_product_id_fkey"
            columns: ["source_product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_order_upsells_upsell_product_id_fkey"
            columns: ["upsell_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sections: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_visible: boolean
          position: number
          product_id: string
          section_type: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          position?: number
          product_id: string
          section_type: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          position?: number
          product_id?: string
          section_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          compare_at_price: number | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          inventory_quantity: number
          is_active: boolean
          price: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          inventory_quantity?: number
          is_active?: boolean
          price?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          inventory_quantity?: number
          is_active?: boolean
          price?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      quantity_discounts: {
        Row: {
          discount_percent: number
          id: string
          min_quantity: number
          product_id: string
        }
        Insert: {
          discount_percent: number
          id?: string
          min_quantity: number
          product_id: string
        }
        Update: {
          discount_percent?: number
          id?: string
          min_quantity?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quantity_discounts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      quantity_offers: {
        Row: {
          created_at: string
          free_delivery: boolean
          id: string
          is_best_offer: boolean
          label: string
          position: number
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          free_delivery?: boolean
          id?: string
          is_best_offer?: boolean
          label?: string
          position?: number
          price: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          free_delivery?: boolean
          id?: string
          is_best_offer?: boolean
          label?: string
          position?: number
          price?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "quantity_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      tracking_pixels: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string | null
          pixel_id: string
          platform: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string | null
          pixel_id: string
          platform: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string | null
          pixel_id?: string
          platform?: string
          updated_at?: string
        }
        Relationships: []
      }
      upsells: {
        Row: {
          discount_percent: number
          id: string
          is_active: boolean
          source_product_id: string
          upsell_product_id: string
        }
        Insert: {
          discount_percent?: number
          id?: string
          is_active?: boolean
          source_product_id: string
          upsell_product_id: string
        }
        Update: {
          discount_percent?: number
          id?: string
          is_active?: boolean
          source_product_id?: string
          upsell_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upsells_source_product_id_fkey"
            columns: ["source_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upsells_upsell_product_id_fkey"
            columns: ["upsell_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      capture_abandoned_lead: {
        Args: {
          p_commune: string
          p_customer_name: string
          p_customer_phone: string
          p_product_id: string
          p_product_title: string
          p_wilaya: string
        }
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
