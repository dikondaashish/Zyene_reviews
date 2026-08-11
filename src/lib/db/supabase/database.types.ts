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
      aeo_alerts: {
        Row: {
          alert_type: string
          business_id: string
          created_at: string
          detail: string
          digest_sent_at: string | null
          engine_id: string | null
          evidence: Json
          id: string
          muted_at: string | null
          organization_id: string
          prompt_id: string | null
          severity: string
          title: string
        }
        Insert: {
          alert_type: string
          business_id: string
          created_at?: string
          detail: string
          digest_sent_at?: string | null
          engine_id?: string | null
          evidence?: Json
          id?: string
          muted_at?: string | null
          organization_id: string
          prompt_id?: string | null
          severity: string
          title: string
        }
        Update: {
          alert_type?: string
          business_id?: string
          created_at?: string
          detail?: string
          digest_sent_at?: string | null
          engine_id?: string | null
          evidence?: Json
          id?: string
          muted_at?: string | null
          organization_id?: string
          prompt_id?: string | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_alerts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_alerts_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "aeo_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_brand_mentions: {
        Row: {
          brand_kind: string
          brand_label: string
          business_id: string
          cited_only: boolean
          competitor_id: string | null
          created_at: string
          extraction_model_id: string
          id: string
          mention_ordinal: number | null
          sample_id: string
          sentiment: string | null
        }
        Insert: {
          brand_kind: string
          brand_label: string
          business_id: string
          cited_only?: boolean
          competitor_id?: string | null
          created_at?: string
          extraction_model_id: string
          id?: string
          mention_ordinal?: number | null
          sample_id: string
          sentiment?: string | null
        }
        Update: {
          brand_kind?: string
          brand_label?: string
          business_id?: string
          cited_only?: boolean
          competitor_id?: string | null
          created_at?: string
          extraction_model_id?: string
          id?: string
          mention_ordinal?: number | null
          sample_id?: string
          sentiment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aeo_brand_mentions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_brand_mentions_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_brand_mentions_sample_id_fkey"
            columns: ["sample_id"]
            isOneToOne: false
            referencedRelation: "aeo_samples"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_citations: {
        Row: {
          business_id: string
          classification: string
          created_at: string
          domain: string
          id: string
          is_stale: boolean
          normalized_url: string
          ordinal: number
          sample_id: string
          title: string | null
          url: string
        }
        Insert: {
          business_id: string
          classification?: string
          created_at?: string
          domain: string
          id?: string
          is_stale?: boolean
          normalized_url: string
          ordinal: number
          sample_id: string
          title?: string | null
          url: string
        }
        Update: {
          business_id?: string
          classification?: string
          created_at?: string
          domain?: string
          id?: string
          is_stale?: boolean
          normalized_url?: string
          ordinal?: number
          sample_id?: string
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_citations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_citations_sample_id_fkey"
            columns: ["sample_id"]
            isOneToOne: false
            referencedRelation: "aeo_samples"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_competitor_aliases: {
        Row: {
          alias: string
          business_id: string
          competitor_id: string
          created_at: string
          id: string
        }
        Insert: {
          alias: string
          business_id: string
          competitor_id: string
          created_at?: string
          id?: string
        }
        Update: {
          alias?: string
          business_id?: string
          competitor_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_competitor_aliases_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_competitor_aliases_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_content_briefs: {
        Row: {
          business_id: string
          cited_source_count: number
          confidence: string
          created_at: string
          edit_items: Json
          faq_html: string
          faq_items: Json
          faq_json_ld: string
          has_owning_page: boolean
          id: string
          prompt_id: string | null
          schema_patch_has_placeholders: boolean
          schema_patch_json_ld: string
          target_page_url: string | null
        }
        Insert: {
          business_id: string
          cited_source_count?: number
          confidence: string
          created_at?: string
          edit_items?: Json
          faq_html: string
          faq_items?: Json
          faq_json_ld: string
          has_owning_page: boolean
          id?: string
          prompt_id?: string | null
          schema_patch_has_placeholders: boolean
          schema_patch_json_ld: string
          target_page_url?: string | null
        }
        Update: {
          business_id?: string
          cited_source_count?: number
          confidence?: string
          created_at?: string
          edit_items?: Json
          faq_html?: string
          faq_items?: Json
          faq_json_ld?: string
          has_owning_page?: boolean
          id?: string
          prompt_id?: string | null
          schema_patch_has_placeholders?: boolean
          schema_patch_json_ld?: string
          target_page_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aeo_content_briefs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_content_briefs_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "aeo_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_credit_balances: {
        Row: {
          balance_micro_usd: number
          cycle_reset_at: string
          granted_micro_usd: number
          organization_id: string
          updated_at: string
        }
        Insert: {
          balance_micro_usd: number
          cycle_reset_at: string
          granted_micro_usd: number
          organization_id: string
          updated_at?: string
        }
        Update: {
          balance_micro_usd?: number
          cycle_reset_at?: string
          granted_micro_usd?: number
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_credit_balances_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_credit_ledger_entries: {
        Row: {
          amount_micro_usd: number
          created_at: string
          id: string
          kind: string
          organization_id: string
          sample_id: string | null
          stripe_invoice_item_id: string | null
        }
        Insert: {
          amount_micro_usd: number
          created_at?: string
          id?: string
          kind: string
          organization_id: string
          sample_id?: string | null
          stripe_invoice_item_id?: string | null
        }
        Update: {
          amount_micro_usd?: number
          created_at?: string
          id?: string
          kind?: string
          organization_id?: string
          sample_id?: string | null
          stripe_invoice_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aeo_credit_ledger_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_credit_ledger_entries_sample_id_fkey"
            columns: ["sample_id"]
            isOneToOne: false
            referencedRelation: "aeo_samples"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_geo_grid_points: {
        Row: {
          business_id: string
          created_at: string
          grid_col: number
          grid_row: number
          id: string
          lat: number
          lng: number
          place_id_found: string | null
          rank_position: number | null
          run_id: string
          top_competitors: Json
        }
        Insert: {
          business_id: string
          created_at?: string
          grid_col: number
          grid_row: number
          id?: string
          lat: number
          lng: number
          place_id_found?: string | null
          rank_position?: number | null
          run_id: string
          top_competitors?: Json
        }
        Update: {
          business_id?: string
          created_at?: string
          grid_col?: number
          grid_row?: number
          id?: string
          lat?: number
          lng?: number
          place_id_found?: string | null
          rank_position?: number | null
          run_id?: string
          top_competitors?: Json
        }
        Relationships: [
          {
            foreignKeyName: "aeo_geo_grid_points_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_geo_grid_points_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "aeo_geo_grid_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_geo_grid_runs: {
        Row: {
          business_id: string
          center_lat: number
          center_lng: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          grid_size: number
          id: string
          is_estimated: boolean
          keyword: string
          spacing_meters: number
          status: string
        }
        Insert: {
          business_id: string
          center_lat: number
          center_lng: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          grid_size: number
          id?: string
          is_estimated?: boolean
          keyword: string
          spacing_meters: number
          status?: string
        }
        Update: {
          business_id?: string
          center_lat?: number
          center_lng?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          grid_size?: number
          id?: string
          is_estimated?: boolean
          keyword?: string
          spacing_meters?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_geo_grid_runs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_prompt_clusters: {
        Row: {
          business_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_prompt_clusters_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_prompts: {
        Row: {
          business_id: string
          cluster_id: string | null
          created_at: string
          id: string
          intent: string | null
          is_active: boolean
          locale_city: string | null
          locale_country: string
          locale_language: string
          prompt_text: string
          source: string
          updated_at: string
        }
        Insert: {
          business_id: string
          cluster_id?: string | null
          created_at?: string
          id?: string
          intent?: string | null
          is_active?: boolean
          locale_city?: string | null
          locale_country?: string
          locale_language?: string
          prompt_text: string
          source?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          cluster_id?: string | null
          created_at?: string
          id?: string
          intent?: string | null
          is_active?: boolean
          locale_city?: string | null
          locale_country?: string
          locale_language?: string
          prompt_text?: string
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_prompts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_prompts_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "aeo_prompt_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_quota_ledger: {
        Row: {
          billable_units: number
          cost_micro_usd: number
          created_at: string
          engine_id: string
          id: string
          organization_id: string
          overage_override: boolean
          sampled_units: number
          updated_at: string
          usage_date: string
        }
        Insert: {
          billable_units?: number
          cost_micro_usd?: number
          created_at?: string
          engine_id: string
          id?: string
          organization_id: string
          overage_override?: boolean
          sampled_units?: number
          updated_at?: string
          usage_date: string
        }
        Update: {
          billable_units?: number
          cost_micro_usd?: number
          created_at?: string
          engine_id?: string
          id?: string
          organization_id?: string
          overage_override?: boolean
          sampled_units?: number
          updated_at?: string
          usage_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_quota_ledger_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_quota_reservations: {
        Row: {
          billable_units: number
          cost_micro_usd: number
          created_at: string
          dispatch_attempts: number
          dispatched_at: string | null
          engine_id: string
          id: string
          idempotency_key: string
          organization_id: string
          overage_authorised: boolean
          overrun_units: number
          reserved_at: string
          reserved_units: number
          run_id: string | null
          settled_at: string | null
          settled_units: number
          state: string
          usage_date: string
        }
        Insert: {
          billable_units?: number
          cost_micro_usd?: number
          created_at?: string
          dispatch_attempts?: number
          dispatched_at?: string | null
          engine_id: string
          id?: string
          idempotency_key: string
          organization_id: string
          overage_authorised?: boolean
          overrun_units?: number
          reserved_at?: string
          reserved_units: number
          run_id?: string | null
          settled_at?: string | null
          settled_units?: number
          state?: string
          usage_date: string
        }
        Update: {
          billable_units?: number
          cost_micro_usd?: number
          created_at?: string
          dispatch_attempts?: number
          dispatched_at?: string | null
          engine_id?: string
          id?: string
          idempotency_key?: string
          organization_id?: string
          overage_authorised?: boolean
          overrun_units?: number
          reserved_at?: string
          reserved_units?: number
          run_id?: string | null
          settled_at?: string | null
          settled_units?: number
          state?: string
          usage_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_quota_reservations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_quota_reservations_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "aeo_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_runs: {
        Row: {
          business_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          scheduled_for: string | null
          status: string
          trigger: string
        }
        Insert: {
          business_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          scheduled_for?: string | null
          status?: string
          trigger?: string
        }
        Update: {
          business_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          scheduled_for?: string | null
          status?: string
          trigger?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_runs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_samples: {
        Row: {
          answer_storage_path: string | null
          attempt: number
          business_id: string
          citations_availability: string | null
          cost_micro_usd: number
          created_at: string
          engine_id: string
          error_kind: string | null
          id: string
          is_estimated: boolean
          latency_ms: number
          model_id: string | null
          no_answer_reason: string | null
          prompt_id: string | null
          run_id: string
          sampled_at: string
          status: string
        }
        Insert: {
          answer_storage_path?: string | null
          attempt?: number
          business_id: string
          citations_availability?: string | null
          cost_micro_usd?: number
          created_at?: string
          engine_id: string
          error_kind?: string | null
          id?: string
          is_estimated?: boolean
          latency_ms?: number
          model_id?: string | null
          no_answer_reason?: string | null
          prompt_id?: string | null
          run_id: string
          sampled_at?: string
          status: string
        }
        Update: {
          answer_storage_path?: string | null
          attempt?: number
          business_id?: string
          citations_availability?: string | null
          cost_micro_usd?: number
          created_at?: string
          engine_id?: string
          error_kind?: string | null
          id?: string
          is_estimated?: boolean
          latency_ms?: number
          model_id?: string | null
          no_answer_reason?: string | null
          prompt_id?: string | null
          run_id?: string
          sampled_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_samples_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_samples_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "aeo_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_samples_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "aeo_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      business_members: {
        Row: {
          business_id: string
          created_at: string
          id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          role: string
          status?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address_line1: string | null
          apology_message: string | null
          auto_reply_enabled: boolean
          auto_reply_enabled_at: string | null
          auto_reply_min_rating: number
          auto_reply_tone: string
          average_rating: number
          brand_color: string | null
          category: string
          city: string | null
          country: string
          created_at: string
          custom_tags: string[] | null
          email: string | null
          enable_staff_selection: boolean
          footer_company_name: string | null
          footer_link: string | null
          footer_logo_url: string | null
          footer_text: string | null
          google_button_text: string | null
          google_heading: string | null
          google_review_url: string | null
          google_subheading: string | null
          hide_branding: boolean | null
          id: string
          logo_url: string | null
          min_stars_for_google: number | null
          name: string
          negative_button_text: string | null
          negative_subheading: string | null
          negative_textarea_placeholder: string | null
          organization_id: string
          phone: string | null
          private_feedback_email_mode: string
          private_feedback_offer_message: string | null
          private_feedback_offer_mode: string
          private_feedback_phone_mode: string
          rating_style: string
          rating_subtitle: string | null
          review_page_background_color: string
          review_request_delay_minutes: number
          review_request_email_enabled: boolean
          review_request_frequency_cap_days: number
          review_request_min_amount_cents: number
          review_request_sms_enabled: boolean
          sender_name: string | null
          slug: string
          social_links: Json | null
          staff_names: string[]
          state: string | null
          status: string
          tags_heading: string | null
          tags_subheading: string | null
          thank_you_heading: string | null
          thank_you_message: string | null
          timezone: string
          total_reviews: number
          updated_at: string
          website: string | null
          welcome_message: string | null
          zip: string | null
        }
        Insert: {
          address_line1?: string | null
          apology_message?: string | null
          auto_reply_enabled?: boolean
          auto_reply_enabled_at?: string | null
          auto_reply_min_rating?: number
          auto_reply_tone?: string
          average_rating?: number
          brand_color?: string | null
          category?: string
          city?: string | null
          country?: string
          created_at?: string
          custom_tags?: string[] | null
          email?: string | null
          enable_staff_selection?: boolean
          footer_company_name?: string | null
          footer_link?: string | null
          footer_logo_url?: string | null
          footer_text?: string | null
          google_button_text?: string | null
          google_heading?: string | null
          google_review_url?: string | null
          google_subheading?: string | null
          hide_branding?: boolean | null
          id?: string
          logo_url?: string | null
          min_stars_for_google?: number | null
          name: string
          negative_button_text?: string | null
          negative_subheading?: string | null
          negative_textarea_placeholder?: string | null
          organization_id: string
          phone?: string | null
          private_feedback_email_mode?: string
          private_feedback_offer_message?: string | null
          private_feedback_offer_mode?: string
          private_feedback_phone_mode?: string
          rating_style?: string
          rating_subtitle?: string | null
          review_page_background_color?: string
          review_request_delay_minutes?: number
          review_request_email_enabled?: boolean
          review_request_frequency_cap_days?: number
          review_request_min_amount_cents?: number
          review_request_sms_enabled?: boolean
          sender_name?: string | null
          slug: string
          social_links?: Json | null
          staff_names?: string[]
          state?: string | null
          status?: string
          tags_heading?: string | null
          tags_subheading?: string | null
          thank_you_heading?: string | null
          thank_you_message?: string | null
          timezone?: string
          total_reviews?: number
          updated_at?: string
          website?: string | null
          welcome_message?: string | null
          zip?: string | null
        }
        Update: {
          address_line1?: string | null
          apology_message?: string | null
          auto_reply_enabled?: boolean
          auto_reply_enabled_at?: string | null
          auto_reply_min_rating?: number
          auto_reply_tone?: string
          average_rating?: number
          brand_color?: string | null
          category?: string
          city?: string | null
          country?: string
          created_at?: string
          custom_tags?: string[] | null
          email?: string | null
          enable_staff_selection?: boolean
          footer_company_name?: string | null
          footer_link?: string | null
          footer_logo_url?: string | null
          footer_text?: string | null
          google_button_text?: string | null
          google_heading?: string | null
          google_review_url?: string | null
          google_subheading?: string | null
          hide_branding?: boolean | null
          id?: string
          logo_url?: string | null
          min_stars_for_google?: number | null
          name?: string
          negative_button_text?: string | null
          negative_subheading?: string | null
          negative_textarea_placeholder?: string | null
          organization_id?: string
          phone?: string | null
          private_feedback_email_mode?: string
          private_feedback_offer_message?: string | null
          private_feedback_offer_mode?: string
          private_feedback_phone_mode?: string
          rating_style?: string
          rating_subtitle?: string | null
          review_page_background_color?: string
          review_request_delay_minutes?: number
          review_request_email_enabled?: boolean
          review_request_frequency_cap_days?: number
          review_request_min_amount_cents?: number
          review_request_sms_enabled?: boolean
          sender_name?: string | null
          slug?: string
          social_links?: Json | null
          staff_names?: string[]
          state?: string | null
          status?: string
          tags_heading?: string | null
          tags_subheading?: string | null
          thank_you_heading?: string | null
          thank_you_message?: string | null
          timezone?: string
          total_reviews?: number
          updated_at?: string
          website?: string | null
          welcome_message?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          business_id: string
          channel: string
          created_at: string
          delay_minutes: number
          drip_channel_alternate: boolean
          drip_step3_template: string | null
          email_subject: string | null
          email_template: string | null
          follow_up_delay_hours: number
          follow_up_enabled: boolean
          follow_up_template: string | null
          id: string
          name: string
          sms_template: string | null
          status: string
          total_clicked: number
          total_completed: number
          total_opened: number
          total_reviews_received: number
          total_sent: number
          trigger_type: string
          updated_at: string
        }
        Insert: {
          business_id: string
          channel?: string
          created_at?: string
          delay_minutes?: number
          drip_channel_alternate?: boolean
          drip_step3_template?: string | null
          email_subject?: string | null
          email_template?: string | null
          follow_up_delay_hours?: number
          follow_up_enabled?: boolean
          follow_up_template?: string | null
          id?: string
          name: string
          sms_template?: string | null
          status?: string
          total_clicked?: number
          total_completed?: number
          total_opened?: number
          total_reviews_received?: number
          total_sent?: number
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          channel?: string
          created_at?: string
          delay_minutes?: number
          drip_channel_alternate?: boolean
          drip_step3_template?: string | null
          email_subject?: string | null
          email_template?: string | null
          follow_up_delay_hours?: number
          follow_up_enabled?: boolean
          follow_up_template?: string | null
          id?: string
          name?: string
          sms_template?: string | null
          status?: string
          total_clicked?: number
          total_completed?: number
          total_opened?: number
          total_reviews_received?: number
          total_sent?: number
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      clover_connections: {
        Row: {
          access_token_encrypted: string
          access_token_expires_at: string | null
          auto_send_enabled: boolean
          business_id: string
          connected_at: string
          created_at: string
          disconnected_at: string | null
          environment: string
          id: string
          last_error: string | null
          merchant_id: string
          refresh_token_encrypted: string | null
          refresh_token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token_encrypted: string
          access_token_expires_at?: string | null
          auto_send_enabled?: boolean
          business_id: string
          connected_at?: string
          created_at?: string
          disconnected_at?: string | null
          environment?: string
          id?: string
          last_error?: string | null
          merchant_id: string
          refresh_token_encrypted?: string | null
          refresh_token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token_encrypted?: string
          access_token_expires_at?: string | null
          auto_send_enabled?: boolean
          business_id?: string
          connected_at?: string
          created_at?: string
          disconnected_at?: string | null
          environment?: string
          id?: string
          last_error?: string | null
          merchant_id?: string
          refresh_token_encrypted?: string | null
          refresh_token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clover_connections_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      clover_payment_events: {
        Row: {
          business_id: string
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          error_message: string | null
          event_type: string
          id: string
          merchant_id: string
          payment_id: string
          review_request_id: string | null
          status: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          merchant_id: string
          payment_id: string
          review_request_id?: string | null
          status: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          merchant_id?: string
          payment_id?: string
          review_request_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "clover_payment_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clover_payment_events_review_request_id_fkey"
            columns: ["review_request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_events: {
        Row: {
          business_id: string
          competitor_id: string
          created_at: string
          event_delta: number | null
          event_type: string
          event_value: number | null
          id: string
          metadata: Json
          summary: string | null
          title: string
        }
        Insert: {
          business_id: string
          competitor_id: string
          created_at?: string
          event_delta?: number | null
          event_type: string
          event_value?: number | null
          id?: string
          metadata?: Json
          summary?: string | null
          title: string
        }
        Update: {
          business_id?: string
          competitor_id?: string
          created_at?: string
          event_delta?: number | null
          event_type?: string
          event_value?: number | null
          id?: string
          metadata?: Json
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_events_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_insights: {
        Row: {
          actions: Json
          business_id: string
          competitor_id: string
          confidence: number | null
          created_at: string
          id: string
          model: string | null
          owner_suggestion: string | null
          priority: string
          range_key: string
          recommendations: Json
          summary: string
          why_it_matters: string | null
        }
        Insert: {
          actions?: Json
          business_id: string
          competitor_id: string
          confidence?: number | null
          created_at?: string
          id?: string
          model?: string | null
          owner_suggestion?: string | null
          priority?: string
          range_key?: string
          recommendations?: Json
          summary: string
          why_it_matters?: string | null
        }
        Update: {
          actions?: Json
          business_id?: string
          competitor_id?: string
          confidence?: number | null
          created_at?: string
          id?: string
          model?: string | null
          owner_suggestion?: string | null
          priority?: string
          range_key?: string
          recommendations?: Json
          summary?: string
          why_it_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_insights_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_insights_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_market_briefs: {
        Row: {
          business_id: string
          created_at: string
          data_limitations: string | null
          headline: string
          id: string
          model: string | null
          opportunity_actions: Json
          overview: string
          positioning_bullets: Json
        }
        Insert: {
          business_id: string
          created_at?: string
          data_limitations?: string | null
          headline: string
          id?: string
          model?: string | null
          opportunity_actions?: Json
          overview: string
          positioning_bullets?: Json
        }
        Update: {
          business_id?: string
          created_at?: string
          data_limitations?: string | null
          headline?: string
          id?: string
          model?: string | null
          opportunity_actions?: Json
          overview?: string
          positioning_bullets?: Json
        }
        Relationships: [
          {
            foreignKeyName: "competitor_market_briefs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_snapshots: {
        Row: {
          average_rating: number
          business_id: string
          captured_at: string
          competitor_id: string
          id: string
          metadata: Json
          source: string
          total_reviews: number
        }
        Insert: {
          average_rating?: number
          business_id: string
          captured_at?: string
          competitor_id: string
          id?: string
          metadata?: Json
          source?: string
          total_reviews?: number
        }
        Update: {
          average_rating?: number
          business_id?: string
          captured_at?: string
          competitor_id?: string
          id?: string
          metadata?: Json
          source?: string
          total_reviews?: number
        }
        Relationships: [
          {
            foreignKeyName: "competitor_snapshots_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_snapshots_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_watch_runs: {
        Row: {
          business_id: string
          created_at: string
          error_message: string | null
          events_created: number
          external_updates: number
          finished_at: string
          id: string
          insights_created: number
          run_id: string
          scanned: number
          snapshots_created: number
          started_at: string
          status: string
        }
        Insert: {
          business_id: string
          created_at?: string
          error_message?: string | null
          events_created?: number
          external_updates?: number
          finished_at: string
          id?: string
          insights_created?: number
          run_id: string
          scanned?: number
          snapshots_created?: number
          started_at: string
          status: string
        }
        Update: {
          business_id?: string
          created_at?: string
          error_message?: string | null
          events_created?: number
          external_updates?: number
          finished_at?: string
          id?: string
          insights_created?: number
          run_id?: string
          scanned?: number
          snapshots_created?: number
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_watch_runs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_watch_settings: {
        Row: {
          business_id: string
          created_at: string
          email_alerts_enabled: boolean
          id: string
          rating_alert_delta: number
          review_spike_threshold: number
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          email_alerts_enabled?: boolean
          id?: string
          rating_alert_delta?: number
          review_spike_threshold?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          email_alerts_enabled?: boolean
          id?: string
          rating_alert_delta?: number
          review_spike_threshold?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_watch_settings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          average_rating: number | null
          business_id: string
          created_at: string | null
          google_url: string | null
          id: string
          name: string
          total_reviews: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          business_id: string
          created_at?: string | null
          google_url?: string | null
          id?: string
          name: string
          total_reviews?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          business_id?: string
          created_at?: string | null
          google_url?: string | null
          id?: string
          name?: string
          total_reviews?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitors_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      crawl_findings: {
        Row: {
          business_id: string
          crawl_page_id: string | null
          crawl_run_id: string
          created_at: string
          evidence: string
          fix_instruction: string
          id: string
          page_url: string | null
          rule: string
          severity: string
        }
        Insert: {
          business_id: string
          crawl_page_id?: string | null
          crawl_run_id: string
          created_at?: string
          evidence: string
          fix_instruction: string
          id?: string
          page_url?: string | null
          rule: string
          severity: string
        }
        Update: {
          business_id?: string
          crawl_page_id?: string | null
          crawl_run_id?: string
          created_at?: string
          evidence?: string
          fix_instruction?: string
          id?: string
          page_url?: string | null
          rule?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "crawl_findings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crawl_findings_crawl_page_id_fkey"
            columns: ["crawl_page_id"]
            isOneToOne: false
            referencedRelation: "crawl_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crawl_findings_crawl_run_id_fkey"
            columns: ["crawl_run_id"]
            isOneToOne: false
            referencedRelation: "crawl_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      crawl_pages: {
        Row: {
          business_id: string
          canonical_url: string | null
          content_storage_path: string | null
          crawl_run_id: string
          fetch_error: string | null
          fetched_at: string
          h1_count: number | null
          http_status: number | null
          id: string
          meta_robots: string | null
          title: string | null
          url: string
          word_count: number | null
        }
        Insert: {
          business_id: string
          canonical_url?: string | null
          content_storage_path?: string | null
          crawl_run_id: string
          fetch_error?: string | null
          fetched_at?: string
          h1_count?: number | null
          http_status?: number | null
          id?: string
          meta_robots?: string | null
          title?: string | null
          url: string
          word_count?: number | null
        }
        Update: {
          business_id?: string
          canonical_url?: string | null
          content_storage_path?: string | null
          crawl_run_id?: string
          fetch_error?: string | null
          fetched_at?: string
          h1_count?: number | null
          http_status?: number | null
          id?: string
          meta_robots?: string | null
          title?: string | null
          url?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crawl_pages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crawl_pages_crawl_run_id_fkey"
            columns: ["crawl_run_id"]
            isOneToOne: false
            referencedRelation: "crawl_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      crawl_runs: {
        Row: {
          business_id: string
          completed_at: string | null
          error_message: string | null
          id: string
          origin: string
          page_cap: number
          pages_crawled: number
          pages_discovered: number
          started_at: string
          status: string
          trigger: string
        }
        Insert: {
          business_id: string
          completed_at?: string | null
          error_message?: string | null
          id?: string
          origin: string
          page_cap: number
          pages_crawled?: number
          pages_discovered?: number
          started_at?: string
          status: string
          trigger: string
        }
        Update: {
          business_id?: string
          completed_at?: string | null
          error_message?: string | null
          id?: string
          origin?: string
          page_cap?: number
          pages_crawled?: number
          pages_discovered?: number
          started_at?: string
          status?: string
          trigger?: string
        }
        Relationships: [
          {
            foreignKeyName: "crawl_runs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          business_id: string
          created_at: string
          email: string | null
          id: string
          last_request_sent_at: string | null
          name: string | null
          phone: string
          total_requests_sent: number
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          email?: string | null
          id?: string
          last_request_sent_at?: string | null
          name?: string | null
          phone: string
          total_requests_sent?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          email?: string | null
          id?: string
          last_request_sent_at?: string | null
          name?: string | null
          phone?: string
          total_requests_sent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          business_id: string
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_opted_out: boolean
          last_name: string | null
          last_request_sent_at: string | null
          last_visit_at: string | null
          notes: string | null
          phone: string | null
          tags: string[] | null
          total_requests_sent: number | null
          total_spend_cents: number | null
          updated_at: string
          visit_count: number | null
        }
        Insert: {
          business_id: string
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_opted_out?: boolean
          last_name?: string | null
          last_request_sent_at?: string | null
          last_visit_at?: string | null
          notes?: string | null
          phone?: string | null
          tags?: string[] | null
          total_requests_sent?: number | null
          total_spend_cents?: number | null
          updated_at?: string
          visit_count?: number | null
        }
        Update: {
          business_id?: string
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_opted_out?: boolean
          last_name?: string | null
          last_request_sent_at?: string | null
          last_visit_at?: string | null
          notes?: string | null
          phone?: string | null
          tags?: string[] | null
          total_requests_sent?: number | null
          total_spend_cents?: number | null
          updated_at?: string
          visit_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          business_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          metadata: Json
          organization_id: string
          user_id: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          metadata?: Json
          organization_id: string
          user_id?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          organization_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gbp_place_action_links: {
        Row: {
          business_id: string
          created_at: string
          google_link_name: string
          id: string
          is_broken: boolean
          is_preferred: boolean
          last_link_check_at: string | null
          place_action_type: string
          review_platform_id: string
          updated_at: string
          uri: string
        }
        Insert: {
          business_id: string
          created_at?: string
          google_link_name: string
          id?: string
          is_broken?: boolean
          is_preferred?: boolean
          last_link_check_at?: string | null
          place_action_type: string
          review_platform_id: string
          updated_at?: string
          uri: string
        }
        Update: {
          business_id?: string
          created_at?: string
          google_link_name?: string
          id?: string
          is_broken?: boolean
          is_preferred?: boolean
          last_link_check_at?: string | null
          place_action_type?: string
          review_platform_id?: string
          updated_at?: string
          uri?: string
        }
        Relationships: [
          {
            foreignKeyName: "gbp_place_action_links_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gbp_place_action_links_review_platform_id_fkey"
            columns: ["review_platform_id"]
            isOneToOne: false
            referencedRelation: "review_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      gbp_questions: {
        Row: {
          author_display_name: string | null
          author_type: string | null
          business_id: string
          created_at: string
          google_create_time: string | null
          google_question_name: string
          google_update_time: string | null
          has_merchant_answer: boolean
          id: string
          question_text: string
          review_platform_id: string
          top_answers: Json
          total_answer_count: number
          updated_at: string
          upvote_count: number
        }
        Insert: {
          author_display_name?: string | null
          author_type?: string | null
          business_id: string
          created_at?: string
          google_create_time?: string | null
          google_question_name: string
          google_update_time?: string | null
          has_merchant_answer?: boolean
          id?: string
          question_text: string
          review_platform_id: string
          top_answers?: Json
          total_answer_count?: number
          updated_at?: string
          upvote_count?: number
        }
        Update: {
          author_display_name?: string | null
          author_type?: string | null
          business_id?: string
          created_at?: string
          google_create_time?: string | null
          google_question_name?: string
          google_update_time?: string | null
          has_merchant_answer?: boolean
          id?: string
          question_text?: string
          review_platform_id?: string
          top_answers?: Json
          total_answer_count?: number
          updated_at?: string
          upvote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "gbp_questions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gbp_questions_review_platform_id_fkey"
            columns: ["review_platform_id"]
            isOneToOne: false
            referencedRelation: "review_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      google_performance_metrics: {
        Row: {
          business_id: string
          created_at: string
          dimension_key: string
          id: string
          metric_date: string
          metric_key: string
          review_platform_id: string
          value: number
        }
        Insert: {
          business_id: string
          created_at?: string
          dimension_key?: string
          id?: string
          metric_date: string
          metric_key: string
          review_platform_id: string
          value?: number
        }
        Update: {
          business_id?: string
          created_at?: string
          dimension_key?: string
          id?: string
          metric_date?: string
          metric_key?: string
          review_platform_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "google_performance_metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_performance_metrics_review_platform_id_fkey"
            columns: ["review_platform_id"]
            isOneToOne: false
            referencedRelation: "review_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      google_search_keyword_monthly: {
        Row: {
          business_id: string
          id: string
          impressions: number
          is_threshold: boolean
          keyword: string
          month_start: string
          review_platform_id: string
          synced_at: string
        }
        Insert: {
          business_id: string
          id?: string
          impressions?: number
          is_threshold?: boolean
          keyword: string
          month_start: string
          review_platform_id: string
          synced_at?: string
        }
        Update: {
          business_id?: string
          id?: string
          impressions?: number
          is_threshold?: boolean
          keyword?: string
          month_start?: string
          review_platform_id?: string
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_search_keyword_monthly_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_search_keyword_monthly_review_platform_id_fkey"
            columns: ["review_platform_id"]
            isOneToOne: false
            referencedRelation: "review_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      google_seo_ai_visibility_results: {
        Row: {
          business_id: string
          created_at: string
          found: boolean
          id: string
          is_estimated: boolean
          method: string
          model: string
          position: number | null
          run_id: string
          snippet: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          found?: boolean
          id?: string
          is_estimated?: boolean
          method?: string
          model: string
          position?: number | null
          run_id: string
          snippet?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          found?: boolean
          id?: string
          is_estimated?: boolean
          method?: string
          model?: string
          position?: number | null
          run_id?: string
          snippet?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_seo_ai_visibility_results_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_seo_ai_visibility_results_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "google_seo_ai_visibility_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      google_seo_ai_visibility_runs: {
        Row: {
          business_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          is_estimated: boolean
          method: string
          query: string
          status: string
        }
        Insert: {
          business_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          is_estimated?: boolean
          method?: string
          query: string
          status?: string
        }
        Update: {
          business_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          is_estimated?: boolean
          method?: string
          query?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_seo_ai_visibility_runs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      google_seo_heatmap_cells: {
        Row: {
          business_id: string
          cell_label: string
          created_at: string
          id: string
          is_estimated: boolean
          method: string
          rank_position: number | null
          run_id: string
          visibility_score: number
        }
        Insert: {
          business_id: string
          cell_label: string
          created_at?: string
          id?: string
          is_estimated?: boolean
          method?: string
          rank_position?: number | null
          run_id: string
          visibility_score?: number
        }
        Update: {
          business_id?: string
          cell_label?: string
          created_at?: string
          id?: string
          is_estimated?: boolean
          method?: string
          rank_position?: number | null
          run_id?: string
          visibility_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "google_seo_heatmap_cells_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_seo_heatmap_cells_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "google_seo_heatmap_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      google_seo_heatmap_runs: {
        Row: {
          business_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          is_estimated: boolean
          keyword: string
          method: string
          status: string
        }
        Insert: {
          business_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          is_estimated?: boolean
          keyword: string
          method?: string
          status?: string
        }
        Update: {
          business_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          is_estimated?: boolean
          keyword?: string
          method?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_seo_heatmap_runs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_email_runs: {
        Row: {
          completed_at: string | null
          id: string
          organization_id: string | null
          recipient_email: string
          sequence_key: string
          started_at: string
          status: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          organization_id?: string | null
          recipient_email: string
          sequence_key: string
          started_at?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          organization_id?: string | null
          recipient_email?: string
          sequence_key?: string
          started_at?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "growth_email_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          access_token: string | null
          api_key: string | null
          business_id: string
          created_at: string
          external_merchant_id: string | null
          id: string
          last_event_at: string | null
          platform: string
          refresh_token: string | null
          status: string
          webhook_secret: string | null
        }
        Insert: {
          access_token?: string | null
          api_key?: string | null
          business_id: string
          created_at?: string
          external_merchant_id?: string | null
          id?: string
          last_event_at?: string | null
          platform: string
          refresh_token?: string | null
          status?: string
          webhook_secret?: string | null
        }
        Update: {
          access_token?: string | null
          api_key?: string | null
          business_id?: string
          created_at?: string
          external_merchant_id?: string | null
          id?: string
          last_event_at?: string | null
          platform?: string
          refresh_token?: string | null
          status?: string
          webhook_secret?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          business_id: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          organization_id: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          business_id?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          organization_id: string
          role?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          business_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          organization_id?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string
          business_id: string
          city: string
          created_at: string | null
          google_place_id: string | null
          id: string
          is_primary: boolean | null
          name: string
          phone: string | null
          slug: string
          state: string
          updated_at: string | null
        }
        Insert: {
          address: string
          business_id: string
          city: string
          created_at?: string | null
          google_place_id?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          phone?: string | null
          slug: string
          state: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          business_id?: string
          city?: string
          created_at?: string | null
          google_place_id?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string | null
          slug?: string
          state?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json
          page_path: string | null
          source: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json
          page_path?: string | null
          source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json
          page_path?: string | null
          source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      marketing_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
          subscribed_at: string
          unsubscribed_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          business_id: string
          digest_enabled: boolean
          email_enabled: boolean
          email_frequency: string
          id: string
          min_rating_threshold: number
          min_urgency_for_sms: number
          quiet_hours_end: string
          quiet_hours_start: string
          sms_enabled: boolean
          sms_phone_number: string | null
          user_id: string
        }
        Insert: {
          business_id: string
          digest_enabled?: boolean
          email_enabled?: boolean
          email_frequency?: string
          id?: string
          min_rating_threshold?: number
          min_urgency_for_sms?: number
          quiet_hours_end?: string
          quiet_hours_start?: string
          sms_enabled?: boolean
          sms_phone_number?: string | null
          user_id: string
        }
        Update: {
          business_id?: string
          digest_enabled?: boolean
          email_enabled?: boolean
          email_frequency?: string
          id?: string
          min_rating_threshold?: number
          min_urgency_for_sms?: number
          quiet_hours_end?: string
          quiet_hours_start?: string
          sms_enabled?: boolean
          sms_phone_number?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      opt_outs: {
        Row: {
          id: string
          opted_out_at: string
          phone: string
          source: string | null
        }
        Insert: {
          id?: string
          opted_out_at?: string
          phone: string
          source?: string | null
        }
        Update: {
          id?: string
          opted_out_at?: string
          phone?: string
          source?: string | null
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          ai_replies_used_this_month: number
          created_at: string
          custom_domain: string | null
          hide_powered_by: boolean
          id: string
          logo_url: string | null
          max_ai_replies_per_month: number
          max_businesses: number
          max_email_requests_per_month: number | null
          max_link_requests_per_month: number | null
          max_review_requests_per_month: number
          max_sms_requests_per_month: number | null
          max_team_members: number
          name: string
          plan: string
          plan_status: string
          primary_color: string
          referred_by_user_id: string | null
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          support_email: string | null
          trial_ends_at: string | null
          type: string
          updated_at: string
        }
        Insert: {
          ai_replies_used_this_month?: number
          created_at?: string
          custom_domain?: string | null
          hide_powered_by?: boolean
          id?: string
          logo_url?: string | null
          max_ai_replies_per_month?: number
          max_businesses?: number
          max_email_requests_per_month?: number | null
          max_link_requests_per_month?: number | null
          max_review_requests_per_month?: number
          max_sms_requests_per_month?: number | null
          max_team_members?: number
          name: string
          plan?: string
          plan_status?: string
          primary_color?: string
          referred_by_user_id?: string | null
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          support_email?: string | null
          trial_ends_at?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          ai_replies_used_this_month?: number
          created_at?: string
          custom_domain?: string | null
          hide_powered_by?: boolean
          id?: string
          logo_url?: string | null
          max_ai_replies_per_month?: number
          max_businesses?: number
          max_email_requests_per_month?: number | null
          max_link_requests_per_month?: number | null
          max_review_requests_per_month?: number
          max_sms_requests_per_month?: number | null
          max_team_members?: number
          name?: string
          plan?: string
          plan_status?: string
          primary_color?: string
          referred_by_user_id?: string | null
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          support_email?: string | null
          trial_ends_at?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_referred_by_user_id_fkey"
            columns: ["referred_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      private_feedback: {
        Row: {
          business_id: string
          category: string | null
          content: string | null
          created_at: string
          customer_email: string | null
          customer_phone: string | null
          id: string
          rating: number
          review_request_id: string | null
          selected_staff: string[] | null
          status: string | null
        }
        Insert: {
          business_id: string
          category?: string | null
          content?: string | null
          created_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          id?: string
          rating: number
          review_request_id?: string | null
          selected_staff?: string[] | null
          status?: string | null
        }
        Update: {
          business_id?: string
          category?: string | null
          content?: string | null
          created_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          id?: string
          rating?: number
          review_request_id?: string | null
          selected_staff?: string[] | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "private_feedback_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_feedback_review_request_id_fkey"
            columns: ["review_request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_conversions: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          referee_organization_id: string
          referee_user_id: string | null
          referrer_user_id: string
          rewarded_at: string | null
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referee_organization_id: string
          referee_user_id?: string | null
          referrer_user_id: string
          rewarded_at?: string | null
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referee_organization_id?: string
          referee_user_id?: string | null
          referrer_user_id?: string
          rewarded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_conversions_referee_organization_id_fkey"
            columns: ["referee_organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_conversions_referee_user_id_fkey"
            columns: ["referee_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_conversions_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      review_platforms: {
        Row: {
          access_token: string | null
          average_rating: number
          business_id: string
          created_at: string
          external_id: string | null
          external_url: string | null
          google_account_id: string | null
          google_listing_synced_at: string | null
          google_location_id: string | null
          google_lodging_available: boolean | null
          google_lodging_health_score: number | null
          google_lodging_synced_at: string | null
          google_performance_synced_at: string | null
          google_place_actions_synced_at: string | null
          google_profile_health_score: number | null
          google_qa_synced_at: string | null
          google_qa_unavailable: boolean
          granted_scopes: string | null
          id: string
          last_review_update_time: string | null
          last_synced_at: string | null
          locked_until: string | null
          platform: string
          refresh_token: string | null
          sync_state: Json | null
          sync_status: string
          token_expires_at: string | null
          total_reviews: number
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          average_rating?: number
          business_id: string
          created_at?: string
          external_id?: string | null
          external_url?: string | null
          google_account_id?: string | null
          google_listing_synced_at?: string | null
          google_location_id?: string | null
          google_lodging_available?: boolean | null
          google_lodging_health_score?: number | null
          google_lodging_synced_at?: string | null
          google_performance_synced_at?: string | null
          google_place_actions_synced_at?: string | null
          google_profile_health_score?: number | null
          google_qa_synced_at?: string | null
          google_qa_unavailable?: boolean
          granted_scopes?: string | null
          id?: string
          last_review_update_time?: string | null
          last_synced_at?: string | null
          locked_until?: string | null
          platform: string
          refresh_token?: string | null
          sync_state?: Json | null
          sync_status?: string
          token_expires_at?: string | null
          total_reviews?: number
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          average_rating?: number
          business_id?: string
          created_at?: string
          external_id?: string | null
          external_url?: string | null
          google_account_id?: string | null
          google_listing_synced_at?: string | null
          google_location_id?: string | null
          google_lodging_available?: boolean | null
          google_lodging_health_score?: number | null
          google_lodging_synced_at?: string | null
          google_performance_synced_at?: string | null
          google_place_actions_synced_at?: string | null
          google_profile_health_score?: number | null
          google_qa_synced_at?: string | null
          google_qa_unavailable?: boolean
          granted_scopes?: string | null
          id?: string
          last_review_update_time?: string | null
          last_synced_at?: string | null
          locked_until?: string | null
          platform?: string
          refresh_token?: string | null
          sync_state?: Json | null
          sync_status?: string
          token_expires_at?: string | null
          total_reviews?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_platforms_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      review_requests: {
        Row: {
          ai_review_text: string | null
          business_id: string
          campaign_id: string | null
          channel: string
          clicked_at: string | null
          completed_at: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          drip_status: string
          drip_steps_sent: number
          drip_terminated_reason: string | null
          email_status: string | null
          error_message: string | null
          follow_up_sent_at: string | null
          id: string
          is_follow_up_sent: boolean | null
          last_drip_channel: string | null
          opened_at: string | null
          rating_given: number | null
          resend_email_id: string | null
          review_left: boolean
          review_link: string | null
          scheduled_for: string | null
          selected_staff: string[] | null
          sent_at: string | null
          sms_status: string | null
          status: string
          step2_sent_at: string | null
          step3_sent_at: string | null
          tags_selected: string[] | null
          trigger_source: string
        }
        Insert: {
          ai_review_text?: string | null
          business_id: string
          campaign_id?: string | null
          channel?: string
          clicked_at?: string | null
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          drip_status?: string
          drip_steps_sent?: number
          drip_terminated_reason?: string | null
          email_status?: string | null
          error_message?: string | null
          follow_up_sent_at?: string | null
          id?: string
          is_follow_up_sent?: boolean | null
          last_drip_channel?: string | null
          opened_at?: string | null
          rating_given?: number | null
          resend_email_id?: string | null
          review_left?: boolean
          review_link?: string | null
          scheduled_for?: string | null
          selected_staff?: string[] | null
          sent_at?: string | null
          sms_status?: string | null
          status?: string
          step2_sent_at?: string | null
          step3_sent_at?: string | null
          tags_selected?: string[] | null
          trigger_source?: string
        }
        Update: {
          ai_review_text?: string | null
          business_id?: string
          campaign_id?: string | null
          channel?: string
          clicked_at?: string | null
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          drip_status?: string
          drip_steps_sent?: number
          drip_terminated_reason?: string | null
          email_status?: string | null
          error_message?: string | null
          follow_up_sent_at?: string | null
          id?: string
          is_follow_up_sent?: boolean | null
          last_drip_channel?: string | null
          opened_at?: string | null
          rating_given?: number | null
          resend_email_id?: string | null
          review_left?: boolean
          review_link?: string | null
          scheduled_for?: string | null
          selected_staff?: string[] | null
          sent_at?: string | null
          sms_status?: string | null
          status?: string
          step2_sent_at?: string | null
          step3_sent_at?: string | null
          tags_selected?: string[] | null
          trigger_source?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          ai_summary: string | null
          alert_sent: boolean
          alert_sent_at: string | null
          author_avatar_url: string | null
          author_name: string | null
          business_id: string
          content_hash: string | null
          created_at: string
          external_id: string | null
          external_url: string | null
          google_attribute_chips: string[] | null
          google_place_context: string[] | null
          google_update_time: string | null
          id: string
          is_visible: boolean | null
          platform: string
          platform_id: string | null
          rating: number
          responded_at: string | null
          response_source: string | null
          response_status: string
          response_text: string | null
          review_date: string
          review_photo_urls: string[] | null
          selected_staff: string[] | null
          sentiment: string | null
          text: string | null
          themes: string[] | null
          urgency_score: number | null
        }
        Insert: {
          ai_summary?: string | null
          alert_sent?: boolean
          alert_sent_at?: string | null
          author_avatar_url?: string | null
          author_name?: string | null
          business_id: string
          content_hash?: string | null
          created_at?: string
          external_id?: string | null
          external_url?: string | null
          google_attribute_chips?: string[] | null
          google_place_context?: string[] | null
          google_update_time?: string | null
          id?: string
          is_visible?: boolean | null
          platform: string
          platform_id?: string | null
          rating: number
          responded_at?: string | null
          response_source?: string | null
          response_status?: string
          response_text?: string | null
          review_date: string
          review_photo_urls?: string[] | null
          selected_staff?: string[] | null
          sentiment?: string | null
          text?: string | null
          themes?: string[] | null
          urgency_score?: number | null
        }
        Update: {
          ai_summary?: string | null
          alert_sent?: boolean
          alert_sent_at?: string | null
          author_avatar_url?: string | null
          author_name?: string | null
          business_id?: string
          content_hash?: string | null
          created_at?: string
          external_id?: string | null
          external_url?: string | null
          google_attribute_chips?: string[] | null
          google_place_context?: string[] | null
          google_update_time?: string | null
          id?: string
          is_visible?: boolean | null
          platform?: string
          platform_id?: string | null
          rating?: number
          responded_at?: string | null
          response_source?: string | null
          response_status?: string
          response_text?: string | null
          review_date?: string
          review_photo_urls?: string[] | null
          selected_staff?: string[] | null
          sentiment?: string | null
          text?: string | null
          themes?: string[] | null
          urgency_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "review_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_opt_outs: {
        Row: {
          opted_out_at: string | null
          phone_number: string
        }
        Insert: {
          opted_out_at?: string | null
          phone_number: string
        }
        Update: {
          opted_out_at?: string | null
          phone_number?: string
        }
        Relationships: []
      }
      square_connections: {
        Row: {
          access_token_encrypted: string
          access_token_expires_at: string | null
          auto_send_enabled: boolean
          business_id: string
          connected_at: string
          created_at: string
          disconnected_at: string | null
          environment: string
          id: string
          last_error: string | null
          merchant_id: string
          refresh_token_encrypted: string | null
          updated_at: string
        }
        Insert: {
          access_token_encrypted: string
          access_token_expires_at?: string | null
          auto_send_enabled?: boolean
          business_id: string
          connected_at?: string
          created_at?: string
          disconnected_at?: string | null
          environment?: string
          id?: string
          last_error?: string | null
          merchant_id: string
          refresh_token_encrypted?: string | null
          updated_at?: string
        }
        Update: {
          access_token_encrypted?: string
          access_token_expires_at?: string | null
          auto_send_enabled?: boolean
          business_id?: string
          connected_at?: string
          created_at?: string
          disconnected_at?: string | null
          environment?: string
          id?: string
          last_error?: string | null
          merchant_id?: string
          refresh_token_encrypted?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "square_connections_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      square_payment_events: {
        Row: {
          business_id: string
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          error_message: string | null
          event_type: string
          id: string
          merchant_id: string
          payment_id: string
          review_request_id: string | null
          status: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          merchant_id: string
          payment_id: string
          review_request_id?: string | null
          status: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          merchant_id?: string
          payment_id?: string
          review_request_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "square_payment_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "square_payment_events_review_request_id_fkey"
            columns: ["review_request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          event_id: string
          received_at: string
        }
        Insert: {
          event_id: string
          received_at?: string
        }
        Update: {
          event_id?: string
          received_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          has_completed_tour: boolean
          id: string
          onboarding_completed: boolean
          onboarding_step: number
          phone: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          has_completed_tour?: boolean
          id: string
          onboarding_completed?: boolean
          onboarding_step?: number
          phone?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          has_completed_tour?: boolean
          id?: string
          onboarding_completed?: boolean
          onboarding_step?: number
          phone?: string | null
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
      acquire_competitor_watch_lock: { Args: never; Returns: boolean }
      acquire_platform_lock: {
        Args: { p_id: string; p_lock_duration?: string }
        Returns: boolean
      }
      aeo_consume_credit: {
        Args: {
          p_organization_id: string
          p_sample_id: string
          p_test_cost_micro_usd: number
        }
        Returns: {
          already_consumed: boolean
          debited_micro_usd: number
          overage_micro_usd: number
          remaining_balance_micro_usd: number
        }[]
      }
      aeo_mark_dispatched: {
        Args: { p_at: string; p_reservation_id: string }
        Returns: number
      }
      aeo_reserve_quota: {
        Args: {
          p_engine_id: string
          p_free_per_day: number
          p_idempotency_key: string
          p_organization_id: string
          p_overage_authorised: boolean
          p_requested_units: number
          p_run_id?: string
          p_usage_date: string
        }
        Returns: {
          billable_units: number
          deferred_units: number
          dispatch_attempts: number
          granted_units: number
          outcome: string
          reservation_id: string
        }[]
      }
      aeo_reset_credit_grant: {
        Args: { p_granted_micro_usd: number; p_organization_id: string }
        Returns: undefined
      }
      bulk_add_customer_tags: {
        Args: { customer_ids: string[]; new_tags: string[] }
        Returns: undefined
      }
      bulk_remove_customer_tags: {
        Args: { customer_ids: string[]; tags_to_remove: string[] }
        Returns: undefined
      }
      decrypt_token: { Args: { ciphertext: string }; Returns: string }
      encrypt_token: { Args: { plaintext: string }; Returns: string }
      get_user_business_ids: { Args: never; Returns: string[] }
      get_user_org_ids: { Args: never; Returns: string[] }
      get_user_store_role: {
        Args: { lookup_business_id: string }
        Returns: string
      }
      increment_ai_replies_used: {
        Args: { org_id: string }
        Returns: undefined
      }
      increment_customer_requests: {
        Args: {
          p_business_id: string
          p_first_name?: string
          p_last_name?: string
          p_phone: string
        }
        Returns: undefined
      }
      mute_aeo_alert: { Args: { p_alert_id: string }; Returns: undefined }
      release_competitor_watch_lock: { Args: never; Returns: undefined }
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
