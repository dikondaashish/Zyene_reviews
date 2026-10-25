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
      aeo_alert_channels: {
        Row: {
          business_id: string | null
          channel_type: string
          created_at: string
          enabled: boolean
          endpoint_ciphertext: string
          id: string
          last_delivery_at: string | null
          last_delivery_status: string | null
          name: string
          organization_id: string
          signing_secret_ciphertext: string | null
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          channel_type: string
          created_at?: string
          enabled?: boolean
          endpoint_ciphertext: string
          id?: string
          last_delivery_at?: string | null
          last_delivery_status?: string | null
          name: string
          organization_id: string
          signing_secret_ciphertext?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          channel_type?: string
          created_at?: string
          enabled?: boolean
          endpoint_ciphertext?: string
          id?: string
          last_delivery_at?: string | null
          last_delivery_status?: string | null
          name?: string
          organization_id?: string
          signing_secret_ciphertext?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_alert_channels_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_alert_channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
          page_url: string | null
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
          page_url?: string | null
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
          page_url?: string | null
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
      aeo_anomaly_evaluations: {
        Row: {
          anomalous: boolean
          baseline_median: number | null
          business_id: string
          created_at: string
          current_value: number | null
          direction: string | null
          eligible: boolean
          evaluated_date: string
          history_days: number
          id: string
          median_absolute_deviation: number | null
          metric: string
          robust_z_score: number | null
        }
        Insert: {
          anomalous?: boolean
          baseline_median?: number | null
          business_id: string
          created_at?: string
          current_value?: number | null
          direction?: string | null
          eligible: boolean
          evaluated_date: string
          history_days: number
          id?: string
          median_absolute_deviation?: number | null
          metric: string
          robust_z_score?: number | null
        }
        Update: {
          anomalous?: boolean
          baseline_median?: number | null
          business_id?: string
          created_at?: string
          current_value?: number | null
          direction?: string | null
          eligible?: boolean
          evaluated_date?: string
          history_days?: number
          id?: string
          median_absolute_deviation?: number | null
          metric?: string
          robust_z_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "aeo_anomaly_evaluations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_answer_volatility: {
        Row: {
          answer_volatility: number
          business_id: string
          calculated_at: string
          citation_volatility: number
          engine_id: string
          id: string
          observation_count: number
          prompt_id: string
          window_end: string
          window_start: string
        }
        Insert: {
          answer_volatility: number
          business_id: string
          calculated_at?: string
          citation_volatility: number
          engine_id: string
          id?: string
          observation_count: number
          prompt_id: string
          window_end: string
          window_start: string
        }
        Update: {
          answer_volatility?: number
          business_id?: string
          calculated_at?: string
          citation_volatility?: number
          engine_id?: string
          id?: string
          observation_count?: number
          prompt_id?: string
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_answer_volatility_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_answer_volatility_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "aeo_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_bigquery_export_runs: {
        Row: {
          business_id: string | null
          error_message: string | null
          exported_at: string
          id: string
          integration_id: string
          organization_id: string
          row_count: number
          status: string
        }
        Insert: {
          business_id?: string | null
          error_message?: string | null
          exported_at?: string
          id?: string
          integration_id: string
          organization_id: string
          row_count: number
          status: string
        }
        Update: {
          business_id?: string | null
          error_message?: string | null
          exported_at?: string
          id?: string
          integration_id?: string
          organization_id?: string
          row_count?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_bigquery_export_runs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_bigquery_export_runs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "aeo_bigquery_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_bigquery_export_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_bigquery_integrations: {
        Row: {
          business_id: string | null
          created_at: string
          credentials_ciphertext: string
          dataset_id: string
          enabled: boolean
          id: string
          last_export_at: string | null
          last_export_status: string | null
          organization_id: string
          project_id: string
          table_id: string
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          credentials_ciphertext: string
          dataset_id: string
          enabled?: boolean
          id?: string
          last_export_at?: string | null
          last_export_status?: string | null
          organization_id: string
          project_id: string
          table_id: string
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          credentials_ciphertext?: string
          dataset_id?: string
          enabled?: boolean
          id?: string
          last_export_at?: string | null
          last_export_status?: string | null
          organization_id?: string
          project_id?: string
          table_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_bigquery_integrations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_bigquery_integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_brand_mentions: {
        Row: {
          attributes: Json
          brand_kind: string
          brand_label: string
          business_id: string
          cited_only: boolean
          competitor_id: string | null
          created_at: string
          extraction_model_id: string
          id: string
          mention_ordinal: number | null
          prominence_score: number | null
          sample_id: string
          sentiment: string | null
          sentiment_rationale: string | null
        }
        Insert: {
          attributes?: Json
          brand_kind: string
          brand_label: string
          business_id: string
          cited_only?: boolean
          competitor_id?: string | null
          created_at?: string
          extraction_model_id: string
          id?: string
          mention_ordinal?: number | null
          prominence_score?: number | null
          sample_id: string
          sentiment?: string | null
          sentiment_rationale?: string | null
        }
        Update: {
          attributes?: Json
          brand_kind?: string
          brand_label?: string
          business_id?: string
          cited_only?: boolean
          competitor_id?: string | null
          created_at?: string
          extraction_model_id?: string
          id?: string
          mention_ordinal?: number | null
          prominence_score?: number | null
          sample_id?: string
          sentiment?: string | null
          sentiment_rationale?: string | null
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
      aeo_citation_changes: {
        Row: {
          business_id: string
          change_type: string
          current_ordinal: number | null
          current_sample_id: string | null
          detected_at: string
          engine_id: string
          id: string
          normalized_url: string
          previous_ordinal: number | null
          previous_sample_id: string | null
          prompt_id: string | null
        }
        Insert: {
          business_id: string
          change_type: string
          current_ordinal?: number | null
          current_sample_id?: string | null
          detected_at?: string
          engine_id: string
          id?: string
          normalized_url: string
          previous_ordinal?: number | null
          previous_sample_id?: string | null
          prompt_id?: string | null
        }
        Update: {
          business_id?: string
          change_type?: string
          current_ordinal?: number | null
          current_sample_id?: string | null
          detected_at?: string
          engine_id?: string
          id?: string
          normalized_url?: string
          previous_ordinal?: number | null
          previous_sample_id?: string | null
          prompt_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aeo_citation_changes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_citation_changes_current_sample_id_fkey"
            columns: ["current_sample_id"]
            isOneToOne: false
            referencedRelation: "aeo_samples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_citation_changes_previous_sample_id_fkey"
            columns: ["previous_sample_id"]
            isOneToOne: false
            referencedRelation: "aeo_samples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_citation_changes_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "aeo_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_citation_traffic_correlations: {
        Row: {
          business_id: string
          calculated_at: string
          correlation: number | null
          eligible: boolean
          id: string
          interpretation: string
          normalized_url: string
          observation_days: number
          window_end: string
          window_start: string
        }
        Insert: {
          business_id: string
          calculated_at?: string
          correlation?: number | null
          eligible: boolean
          id?: string
          interpretation: string
          normalized_url: string
          observation_days: number
          window_end: string
          window_start: string
        }
        Update: {
          business_id?: string
          calculated_at?: string
          correlation?: number | null
          eligible?: boolean
          id?: string
          interpretation?: string
          normalized_url?: string
          observation_days?: number
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_citation_traffic_correlations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
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
      aeo_competitor_page_changes: {
        Row: {
          business_id: string
          change_type: string
          competitor_id: string | null
          current_citation_count: number
          current_hash: string
          detected_at: string
          id: string
          normalized_url: string
          previous_citation_count: number | null
          previous_hash: string | null
        }
        Insert: {
          business_id: string
          change_type: string
          competitor_id?: string | null
          current_citation_count: number
          current_hash: string
          detected_at?: string
          id?: string
          normalized_url: string
          previous_citation_count?: number | null
          previous_hash?: string | null
        }
        Update: {
          business_id?: string
          change_type?: string
          competitor_id?: string | null
          current_citation_count?: number
          current_hash?: string
          detected_at?: string
          id?: string
          normalized_url?: string
          previous_citation_count?: number | null
          previous_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aeo_competitor_page_changes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_competitor_page_changes_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_competitor_page_snapshots: {
        Row: {
          business_id: string
          checked_at: string
          citation_count: number
          competitor_id: string | null
          content_hash: string
          first_seen_at: string
          id: string
          normalized_url: string
          title: string | null
        }
        Insert: {
          business_id: string
          checked_at?: string
          citation_count?: number
          competitor_id?: string | null
          content_hash: string
          first_seen_at?: string
          id?: string
          normalized_url: string
          title?: string | null
        }
        Update: {
          business_id?: string
          checked_at?: string
          citation_count?: number
          competitor_id?: string | null
          content_hash?: string
          first_seen_at?: string
          id?: string
          normalized_url?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aeo_competitor_page_snapshots_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_competitor_page_snapshots_competitor_id_fkey"
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
          review_insights: Json
          rewrite_after: string | null
          rewrite_before: string | null
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
          review_insights?: Json
          rewrite_after?: string | null
          rewrite_before?: string | null
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
          review_insights?: Json
          rewrite_after?: string | null
          rewrite_before?: string | null
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
      aeo_crawler_access_logs: {
        Row: {
          business_id: string
          crawler: string
          created_at: string
          id: string
          method: string
          occurred_at: string
          path: string
          request_id: string | null
          source: string
          status_code: number | null
          user_agent: string
        }
        Insert: {
          business_id: string
          crawler: string
          created_at?: string
          id?: string
          method: string
          occurred_at: string
          path: string
          request_id?: string | null
          source: string
          status_code?: number | null
          user_agent: string
        }
        Update: {
          business_id?: string
          crawler?: string
          created_at?: string
          id?: string
          method?: string
          occurred_at?: string
          path?: string
          request_id?: string | null
          source?: string
          status_code?: number | null
          user_agent?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_crawler_access_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_crawler_log_sources: {
        Row: {
          business_id: string
          created_at: string
          enabled: boolean
          id: string
          key_hash: string
          key_prefix: string
          last_received_at: string | null
          name: string
          organization_id: string
          source: string
        }
        Insert: {
          business_id: string
          created_at?: string
          enabled?: boolean
          id?: string
          key_hash: string
          key_prefix: string
          last_received_at?: string | null
          name: string
          organization_id: string
          source: string
        }
        Update: {
          business_id?: string
          created_at?: string
          enabled?: boolean
          id?: string
          key_hash?: string
          key_prefix?: string
          last_received_at?: string | null
          name?: string
          organization_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_crawler_log_sources_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_crawler_log_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          purchased_balance_micro_usd: number
          updated_at: string
        }
        Insert: {
          balance_micro_usd: number
          cycle_reset_at: string
          granted_micro_usd: number
          organization_id: string
          purchased_balance_micro_usd?: number
          updated_at?: string
        }
        Update: {
          balance_micro_usd?: number
          cycle_reset_at?: string
          granted_micro_usd?: number
          organization_id?: string
          purchased_balance_micro_usd?: number
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
          stripe_checkout_session_id: string | null
          stripe_invoice_item_id: string | null
        }
        Insert: {
          amount_micro_usd: number
          created_at?: string
          id?: string
          kind: string
          organization_id: string
          sample_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_invoice_item_id?: string | null
        }
        Update: {
          amount_micro_usd?: number
          created_at?: string
          id?: string
          kind?: string
          organization_id?: string
          sample_id?: string | null
          stripe_checkout_session_id?: string | null
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
          error_message: string | null
          grid_col: number
          grid_row: number
          id: string
          lat: number
          lng: number
          place_id_found: string | null
          rank_position: number | null
          run_id: string
          search_status: string
          top_competitors: Json
        }
        Insert: {
          business_id: string
          created_at?: string
          error_message?: string | null
          grid_col: number
          grid_row: number
          id?: string
          lat: number
          lng: number
          place_id_found?: string | null
          rank_position?: number | null
          run_id: string
          search_status?: string
          top_competitors?: Json
        }
        Update: {
          business_id?: string
          created_at?: string
          error_message?: string | null
          grid_col?: number
          grid_row?: number
          id?: string
          lat?: number
          lng?: number
          place_id_found?: string | null
          rank_position?: number | null
          run_id?: string
          search_status?: string
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
          actual_cost_micro_usd: number | null
          billed_units: number
          business_id: string
          center_lat: number
          center_lng: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          estimated_cost_micro_usd: number
          grid_size: number
          id: string
          is_estimated: boolean
          keyword: string
          requested_units: number
          spacing_meters: number
          status: string
        }
        Insert: {
          actual_cost_micro_usd?: number | null
          billed_units?: number
          business_id: string
          center_lat: number
          center_lng: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_cost_micro_usd?: number
          grid_size: number
          id?: string
          is_estimated?: boolean
          keyword: string
          requested_units?: number
          spacing_meters: number
          status?: string
        }
        Update: {
          actual_cost_micro_usd?: number | null
          billed_units?: number
          business_id?: string
          center_lat?: number
          center_lng?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_cost_micro_usd?: number
          grid_size?: number
          id?: string
          is_estimated?: boolean
          keyword?: string
          requested_units?: number
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
      aeo_llms_txt_audits: {
        Row: {
          business_id: string
          checked_at: string
          content_hash: string | null
          http_status: number | null
          id: string
          issues: Json
          present: boolean
          url: string
          valid: boolean
        }
        Insert: {
          business_id: string
          checked_at?: string
          content_hash?: string | null
          http_status?: number | null
          id?: string
          issues?: Json
          present: boolean
          url: string
          valid: boolean
        }
        Update: {
          business_id?: string
          checked_at?: string
          content_hash?: string | null
          http_status?: number | null
          id?: string
          issues?: Json
          present?: boolean
          url?: string
          valid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "aeo_llms_txt_audits_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_nap_observations: {
        Row: {
          address_matches: boolean | null
          business_id: string
          checked_at: string
          id: string
          name_matches: boolean | null
          observed_address: string | null
          observed_name: string | null
          observed_phone: string | null
          phone_matches: boolean | null
          provenance: string
          source_name: string
          source_url: string | null
        }
        Insert: {
          address_matches?: boolean | null
          business_id: string
          checked_at?: string
          id?: string
          name_matches?: boolean | null
          observed_address?: string | null
          observed_name?: string | null
          observed_phone?: string | null
          phone_matches?: boolean | null
          provenance: string
          source_name: string
          source_url?: string | null
        }
        Update: {
          address_matches?: boolean | null
          business_id?: string
          checked_at?: string
          id?: string
          name_matches?: boolean | null
          observed_address?: string | null
          observed_name?: string | null
          observed_phone?: string | null
          phone_matches?: boolean | null
          provenance?: string
          source_name?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aeo_nap_observations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_page_diagnostics: {
        Row: {
          business_id: string
          checked_at: string
          cls: number | null
          crawl_page_id: string | null
          id: string
          index_status: string | null
          index_verdict: string | null
          inp_ms: number | null
          js_delta_ratio: number | null
          js_only_word_count: number | null
          lcp_ms: number | null
          performance_score: number | null
          raw_text_hash: string | null
          rendered_text_hash: string | null
          source_payload: Json
          url: string
        }
        Insert: {
          business_id: string
          checked_at?: string
          cls?: number | null
          crawl_page_id?: string | null
          id?: string
          index_status?: string | null
          index_verdict?: string | null
          inp_ms?: number | null
          js_delta_ratio?: number | null
          js_only_word_count?: number | null
          lcp_ms?: number | null
          performance_score?: number | null
          raw_text_hash?: string | null
          rendered_text_hash?: string | null
          source_payload?: Json
          url: string
        }
        Update: {
          business_id?: string
          checked_at?: string
          cls?: number | null
          crawl_page_id?: string | null
          id?: string
          index_status?: string | null
          index_verdict?: string | null
          inp_ms?: number | null
          js_delta_ratio?: number | null
          js_only_word_count?: number | null
          lcp_ms?: number | null
          performance_score?: number | null
          raw_text_hash?: string | null
          rendered_text_hash?: string | null
          source_payload?: Json
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_page_diagnostics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_page_diagnostics_crawl_page_id_fkey"
            columns: ["crawl_page_id"]
            isOneToOne: false
            referencedRelation: "crawl_pages"
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
      aeo_prompt_demand_estimates: {
        Row: {
          business_id: string
          id: string
          language_code: string
          location_name: string
          measured_at: string
          monthly_search_volume: number | null
          prompt_id: string
          provider: string
          provider_cost_micro_usd: number
          source_month: string | null
        }
        Insert: {
          business_id: string
          id?: string
          language_code: string
          location_name: string
          measured_at?: string
          monthly_search_volume?: number | null
          prompt_id: string
          provider: string
          provider_cost_micro_usd: number
          source_month?: string | null
        }
        Update: {
          business_id?: string
          id?: string
          language_code?: string
          location_name?: string
          measured_at?: string
          monthly_search_volume?: number | null
          prompt_id?: string
          provider?: string
          provider_cost_micro_usd?: number
          source_month?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aeo_prompt_demand_estimates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_prompt_demand_estimates_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "aeo_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_prompts: {
        Row: {
          business_id: string
          cluster_id: string | null
          created_at: string
          discovery_score: number | null
          funnel_stage: string | null
          id: string
          intent: string | null
          is_active: boolean
          locale_city: string | null
          locale_country: string
          locale_language: string
          prompt_text: string
          source: string
          source_query: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          cluster_id?: string | null
          created_at?: string
          discovery_score?: number | null
          funnel_stage?: string | null
          id?: string
          intent?: string | null
          is_active?: boolean
          locale_city?: string | null
          locale_country?: string
          locale_language?: string
          prompt_text: string
          source?: string
          source_query?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          cluster_id?: string | null
          created_at?: string
          discovery_score?: number | null
          funnel_stage?: string | null
          id?: string
          intent?: string | null
          is_active?: boolean
          locale_city?: string | null
          locale_country?: string
          locale_language?: string
          prompt_text?: string
          source?: string
          source_query?: string | null
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
      aeo_public_api_keys: {
        Row: {
          business_id: string | null
          created_at: string
          created_by_user_id: string | null
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_id: string
          rate_limit_per_minute: number
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by_user_id: string | null
          rotated_from_id: string | null
          scopes: string[]
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          organization_id: string
          rate_limit_per_minute?: number
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by_user_id?: string | null
          rotated_from_id?: string | null
          scopes: string[]
        }
        Update: {
          business_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          rate_limit_per_minute?: number
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by_user_id?: string | null
          rotated_from_id?: string | null
          scopes?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "aeo_public_api_keys_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_public_api_keys_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_public_api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_public_api_keys_revoked_by_user_id_fkey"
            columns: ["revoked_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_public_api_keys_rotated_from_id_fkey"
            columns: ["rotated_from_id"]
            isOneToOne: false
            referencedRelation: "aeo_public_api_keys"
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
      aeo_recommendations: {
        Row: {
          applied_at: string | null
          baseline: Json
          business_id: string
          content_brief_id: string | null
          created_at: string
          detail: Json
          id: string
          latest_impact: Json
          prompt_id: string | null
          recommendation_type: string
          status: string
          target_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          applied_at?: string | null
          baseline?: Json
          business_id: string
          content_brief_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          latest_impact?: Json
          prompt_id?: string | null
          recommendation_type: string
          status?: string
          target_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          applied_at?: string | null
          baseline?: Json
          business_id?: string
          content_brief_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          latest_impact?: Json
          prompt_id?: string | null
          recommendation_type?: string
          status?: string
          target_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_recommendations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_recommendations_content_brief_id_fkey"
            columns: ["content_brief_id"]
            isOneToOne: false
            referencedRelation: "aeo_content_briefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_recommendations_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "aeo_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_report_schedules: {
        Row: {
          business_id: string | null
          cadence: string
          created_at: string
          enabled: boolean
          id: string
          last_sent_at: string | null
          next_send_at: string
          organization_id: string
          recipients: string[]
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          cadence: string
          created_at?: string
          enabled?: boolean
          id?: string
          last_sent_at?: string | null
          next_send_at: string
          organization_id: string
          recipients: string[]
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          cadence?: string
          created_at?: string
          enabled?: boolean
          id?: string
          last_sent_at?: string | null
          next_send_at?: string
          organization_id?: string
          recipients?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_report_schedules_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_report_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_reports: {
        Row: {
          business_id: string | null
          created_at: string
          delivery_status: string
          error_message: string | null
          format: string
          html: string | null
          id: string
          organization_id: string
          period_end: string
          period_start: string
          recipients: string[]
          schedule_id: string | null
          sent_at: string | null
          storage_path: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          delivery_status?: string
          error_message?: string | null
          format: string
          html?: string | null
          id?: string
          organization_id: string
          period_end: string
          period_start: string
          recipients?: string[]
          schedule_id?: string | null
          sent_at?: string | null
          storage_path?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          delivery_status?: string
          error_message?: string | null
          format?: string
          html?: string | null
          id?: string
          organization_id?: string
          period_end?: string
          period_start?: string
          recipients?: string[]
          schedule_id?: string | null
          sent_at?: string | null
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aeo_reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_reports_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "aeo_report_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_review_citation_matches: {
        Row: {
          answer_excerpt: string
          business_id: string
          confidence: number
          created_at: string
          extraction_model_id: string
          id: string
          match_kind: string
          review_excerpt: string
          review_id: string
          sample_id: string
        }
        Insert: {
          answer_excerpt: string
          business_id: string
          confidence: number
          created_at?: string
          extraction_model_id: string
          id?: string
          match_kind: string
          review_excerpt: string
          review_id: string
          sample_id: string
        }
        Update: {
          answer_excerpt?: string
          business_id?: string
          confidence?: number
          created_at?: string
          extraction_model_id?: string
          id?: string
          match_kind?: string
          review_excerpt?: string
          review_id?: string
          sample_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_review_citation_matches_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_review_citation_matches_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_review_citation_matches_sample_id_fkey"
            columns: ["sample_id"]
            isOneToOne: false
            referencedRelation: "aeo_samples"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_runs: {
        Row: {
          business_id: string
          completed_at: string | null
          completed_samples: number
          created_at: string
          error_message: string | null
          expected_samples: number
          id: string
          scheduled_for: string | null
          status: string
          trigger: string
        }
        Insert: {
          business_id: string
          completed_at?: string | null
          completed_samples?: number
          created_at?: string
          error_message?: string | null
          expected_samples?: number
          id?: string
          scheduled_for?: string | null
          status?: string
          trigger?: string
        }
        Update: {
          business_id?: string
          completed_at?: string | null
          completed_samples?: number
          created_at?: string
          error_message?: string | null
          expected_samples?: number
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
      aeo_webhook_deliveries: {
        Row: {
          attempt_count: number
          business_id: string | null
          created_at: string
          delivered_at: string | null
          endpoint_id: string
          error_message: string | null
          event_type: string
          id: string
          organization_id: string
          response_status: number | null
          source_id: string
          status: string
        }
        Insert: {
          attempt_count?: number
          business_id?: string | null
          created_at?: string
          delivered_at?: string | null
          endpoint_id: string
          error_message?: string | null
          event_type: string
          id?: string
          organization_id: string
          response_status?: number | null
          source_id: string
          status: string
        }
        Update: {
          attempt_count?: number
          business_id?: string | null
          created_at?: string
          delivered_at?: string | null
          endpoint_id?: string
          error_message?: string | null
          event_type?: string
          id?: string
          organization_id?: string
          response_status?: number | null
          source_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_webhook_deliveries_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_webhook_deliveries_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "aeo_webhook_endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_webhook_deliveries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      aeo_webhook_endpoints: {
        Row: {
          business_id: string | null
          created_at: string
          enabled: boolean
          endpoint_ciphertext: string
          event_types: string[]
          id: string
          last_delivery_at: string | null
          last_delivery_status: string | null
          name: string
          organization_id: string
          signing_secret_ciphertext: string
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          enabled?: boolean
          endpoint_ciphertext: string
          event_types: string[]
          id?: string
          last_delivery_at?: string | null
          last_delivery_status?: string | null
          name: string
          organization_id: string
          signing_secret_ciphertext: string
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          enabled?: boolean
          endpoint_ciphertext?: string
          event_types?: string[]
          id?: string
          last_delivery_at?: string | null
          last_delivery_status?: string | null
          name?: string
          organization_id?: string
          signing_secret_ciphertext?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_webhook_endpoints_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeo_webhook_endpoints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      business_inbound_addresses: {
        Row: {
          address_token: string
          allowed_senders: string[]
          business_id: string
          campaign_id: string | null
          created_at: string
          enabled: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address_token: string
          allowed_senders?: string[]
          business_id: string
          campaign_id?: string | null
          created_at?: string
          enabled?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address_token?: string
          allowed_senders?: string[]
          business_id?: string
          campaign_id?: string | null
          created_at?: string
          enabled?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_inbound_addresses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_inbound_addresses_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
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
          role_label: string | null
          status: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          role: string
          role_label?: string | null
          status?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          role?: string
          role_label?: string | null
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
      business_milestones: {
        Row: {
          business_id: string
          created_at: string
          last_milestone_reached: number
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          last_milestone_reached?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          last_milestone_reached?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_milestones_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
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
          average_sale_cents: number | null
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
          reply_rules_enabled: boolean
          reply_rules_enabled_at: string | null
          review_page_background_color: string
          review_request_delay_minutes: number
          review_request_email_enabled: boolean
          review_request_frequency_cap_days: number
          review_request_min_amount_cents: number
          review_request_quiet_end: string
          review_request_quiet_hours_enabled: boolean
          review_request_quiet_start: string
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
          average_sale_cents?: number | null
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
          reply_rules_enabled?: boolean
          reply_rules_enabled_at?: string | null
          review_page_background_color?: string
          review_request_delay_minutes?: number
          review_request_email_enabled?: boolean
          review_request_frequency_cap_days?: number
          review_request_min_amount_cents?: number
          review_request_quiet_end?: string
          review_request_quiet_hours_enabled?: boolean
          review_request_quiet_start?: string
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
          average_sale_cents?: number | null
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
          reply_rules_enabled?: boolean
          reply_rules_enabled_at?: string | null
          review_page_background_color?: string
          review_request_delay_minutes?: number
          review_request_email_enabled?: boolean
          review_request_frequency_cap_days?: number
          review_request_min_amount_cents?: number
          review_request_quiet_end?: string
          review_request_quiet_hours_enabled?: boolean
          review_request_quiet_start?: string
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
          stop_on_click: boolean
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
          stop_on_click?: boolean
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
          stop_on_click?: boolean
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
      cron_job_runs: {
        Row: {
          attempt_count: number
          completed_at: string | null
          created_at: string
          failed_at: string | null
          failure_code: string | null
          id: string
          job_name: string
          lease_expires_at: string
          lease_token: string
          occurrence_key: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          completed_at?: string | null
          created_at?: string
          failed_at?: string | null
          failure_code?: string | null
          id?: string
          job_name: string
          lease_expires_at: string
          lease_token?: string
          occurrence_key: string
          started_at?: string
          status: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          completed_at?: string | null
          created_at?: string
          failed_at?: string | null
          failure_code?: string | null
          id?: string
          job_name?: string
          lease_expires_at?: string
          lease_token?: string
          occurrence_key?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
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
          normalized_email: string | null
          normalized_phone: string | null
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
          normalized_email?: string | null
          normalized_phone?: string | null
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
          normalized_email?: string | null
          normalized_phone?: string | null
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
      enrollment_import_rows: {
        Row: {
          business_id: string
          created_at: string
          customer_name: string | null
          email: string | null
          id: string
          identity_key: string | null
          import_id: string
          phone: string | null
          processed_at: string | null
          reason: string | null
          review_request_id: string | null
          row_number: number
          status: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_name?: string | null
          email?: string | null
          id?: string
          identity_key?: string | null
          import_id: string
          phone?: string | null
          processed_at?: string | null
          reason?: string | null
          review_request_id?: string | null
          row_number: number
          status?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_name?: string | null
          email?: string | null
          id?: string
          identity_key?: string | null
          import_id?: string
          phone?: string | null
          processed_at?: string | null
          reason?: string | null
          review_request_id?: string | null
          row_number?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_import_rows_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_import_rows_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "enrollment_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_import_rows_review_request_id_fkey"
            columns: ["review_request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_imports: {
        Row: {
          business_id: string
          campaign_id: string
          consent_confirmed_at: string | null
          consent_confirmed_by: string | null
          created_at: string
          created_by: string | null
          daily_limit: number
          duplicate_rows: number
          enrolled_rows: number
          file_name: string | null
          id: string
          invalid_rows: number
          last_run_at: string | null
          source: string
          status: string
          total_rows: number
          updated_at: string
          valid_rows: number
        }
        Insert: {
          business_id: string
          campaign_id: string
          consent_confirmed_at?: string | null
          consent_confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          daily_limit?: number
          duplicate_rows?: number
          enrolled_rows?: number
          file_name?: string | null
          id?: string
          invalid_rows?: number
          last_run_at?: string | null
          source?: string
          status?: string
          total_rows?: number
          updated_at?: string
          valid_rows?: number
        }
        Update: {
          business_id?: string
          campaign_id?: string
          consent_confirmed_at?: string | null
          consent_confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          daily_limit?: number
          duplicate_rows?: number
          enrolled_rows?: number
          file_name?: string | null
          id?: string
          invalid_rows?: number
          last_run_at?: string | null
          source?: string
          status?: string
          total_rows?: number
          updated_at?: string
          valid_rows?: number
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_imports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_imports_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
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
      inbound_email_events: {
        Row: {
          business_id: string | null
          candidates: number
          enrolled: number
          from_address: string | null
          id: string
          provider_event_id: string
          reason: string | null
          received_at: string
          status: string
        }
        Insert: {
          business_id?: string | null
          candidates?: number
          enrolled?: number
          from_address?: string | null
          id?: string
          provider_event_id: string
          reason?: string | null
          received_at?: string
          status: string
        }
        Update: {
          business_id?: string | null
          candidates?: number
          enrolled?: number
          from_address?: string | null
          id?: string
          provider_event_id?: string
          reason?: string | null
          received_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "inbound_email_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
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
          invited_by: string | null
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
          invited_by?: string | null
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
          invited_by?: string | null
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
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
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
      marketing_newsletter_deliveries: {
        Row: {
          attempt_count: number
          created_at: string
          edition_key: string
          id: string
          resend_email_id: string | null
          status: string
          subscriber_id: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          edition_key: string
          id?: string
          resend_email_id?: string | null
          status?: string
          subscriber_id: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          edition_key?: string
          id?: string
          resend_email_id?: string | null
          status?: string
          subscriber_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_newsletter_deliveries_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "marketing_subscribers"
            referencedColumns: ["id"]
          },
        ]
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
      nfc_orders: {
        Row: {
          amount_total_cents: number
          business_id: string
          created_at: string
          customer_email: string | null
          customer_name: string | null
          id: string
          organization_id: string
          quantity: number
          shipping_address: Json | null
          shipping_cents: number
          shipping_id: string
          shipping_name: string | null
          status: string
          stripe_checkout_session_id: string
          user_id: string
        }
        Insert: {
          amount_total_cents: number
          business_id: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          organization_id: string
          quantity: number
          shipping_address?: Json | null
          shipping_cents: number
          shipping_id: string
          shipping_name?: string | null
          status?: string
          stripe_checkout_session_id: string
          user_id: string
        }
        Update: {
          amount_total_cents?: number
          business_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          organization_id?: string
          quantity?: number
          shipping_address?: Json | null
          shipping_cents?: number
          shipping_id?: string
          shipping_name?: string | null
          status?: string
          stripe_checkout_session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nfc_orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nfc_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          role_label: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          role_label?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          role_label?: string | null
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
          aeo_sender_domain: string | null
          aeo_sender_domain_checked_at: string | null
          aeo_sender_domain_status: string
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
          stripe_subscription_observed_at: string | null
          support_email: string | null
          trial_ends_at: string | null
          type: string
          updated_at: string
        }
        Insert: {
          aeo_sender_domain?: string | null
          aeo_sender_domain_checked_at?: string | null
          aeo_sender_domain_status?: string
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
          stripe_subscription_observed_at?: string | null
          support_email?: string | null
          trial_ends_at?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          aeo_sender_domain?: string | null
          aeo_sender_domain_checked_at?: string | null
          aeo_sender_domain_status?: string
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
          stripe_subscription_observed_at?: string | null
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
          reward_cents: number | null
          reward_claim_token: string | null
          reward_customer_id: string | null
          reward_key: string | null
          reward_lease_until: string | null
          reward_started_at: string | null
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
          reward_cents?: number | null
          reward_claim_token?: string | null
          reward_customer_id?: string | null
          reward_key?: string | null
          reward_lease_until?: string | null
          reward_started_at?: string | null
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
          reward_cents?: number | null
          reward_claim_token?: string | null
          reward_customer_id?: string | null
          reward_key?: string | null
          reward_lease_until?: string | null
          reward_started_at?: string | null
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
      review_reply_approvers: {
        Row: {
          business_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reply_approvers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      review_reply_drafts: {
        Row: {
          business_id: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          draft_text: string
          error: string | null
          id: string
          posted_at: string | null
          rating: number | null
          review_id: string
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          draft_text: string
          error?: string | null
          id?: string
          posted_at?: string | null
          rating?: number | null
          review_id: string
          source: string
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          draft_text?: string
          error?: string | null
          id?: string
          posted_at?: string | null
          rating?: number | null
          review_id?: string
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reply_drafts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reply_drafts_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_reply_rules: {
        Row: {
          action: string
          business_id: string
          rating: number
          template_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          action?: string
          business_id: string
          rating: number
          template_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          action?: string
          business_id?: string
          rating?: number
          template_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_reply_rules_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reply_rules_business_id_template_id_fkey"
            columns: ["business_id", "template_id"]
            isOneToOne: false
            referencedRelation: "review_reply_templates"
            referencedColumns: ["business_id", "id"]
          },
        ]
      }
      review_reply_templates: {
        Row: {
          body: string
          business_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          body: string
          business_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          body?: string
          business_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reply_templates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      review_request_email_unsubscribes: {
        Row: {
          business_id: string
          created_at: string
          email: string
          id: string
          source: string
        }
        Insert: {
          business_id: string
          created_at?: string
          email: string
          id?: string
          source: string
        }
        Update: {
          business_id?: string
          created_at?: string
          email?: string
          id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_request_email_unsubscribes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      review_request_messages: {
        Row: {
          business_id: string
          channel: string
          created_at: string
          delivered_at: string | null
          failed_at: string | null
          id: string
          last_event_at: string | null
          provider_message_id: string | null
          reason: string | null
          review_request_id: string
          sent_at: string | null
          status: string
          status_rank: number
          step: number
          updated_at: string
        }
        Insert: {
          business_id: string
          channel: string
          created_at?: string
          delivered_at?: string | null
          failed_at?: string | null
          id?: string
          last_event_at?: string | null
          provider_message_id?: string | null
          reason?: string | null
          review_request_id: string
          sent_at?: string | null
          status?: string
          status_rank?: number
          step?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          channel?: string
          created_at?: string
          delivered_at?: string | null
          failed_at?: string | null
          id?: string
          last_event_at?: string | null
          provider_message_id?: string | null
          reason?: string | null
          review_request_id?: string
          sent_at?: string | null
          status?: string
          status_rank?: number
          step?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_request_messages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_request_messages_review_request_id_fkey"
            columns: ["review_request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
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
          deferred_reason: string | null
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
          review_confirmation_source: string | null
          review_confirmed_at: string | null
          review_confirmed_by: string | null
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
          deferred_reason?: string | null
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
          review_confirmation_source?: string | null
          review_confirmed_at?: string | null
          review_confirmed_by?: string | null
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
          deferred_reason?: string | null
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
          review_confirmation_source?: string | null
          review_confirmed_at?: string | null
          review_confirmed_by?: string | null
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
          {
            foreignKeyName: "reviews_platform_tenant_fk"
            columns: ["business_id", "platform_id"]
            isOneToOne: false
            referencedRelation: "review_platforms"
            referencedColumns: ["business_id", "id"]
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
      stripe_credit_grant_receipts: {
        Row: {
          created_at: string
          organization_id: string
          period_end: string
          receipt_id: string
          subscription_id: string
        }
        Insert: {
          created_at?: string
          organization_id: string
          period_end: string
          receipt_id: string
          subscription_id: string
        }
        Update: {
          created_at?: string
          organization_id?: string
          period_end?: string
          receipt_id?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_credit_grant_receipts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          claim_token: string | null
          claimed_at: string | null
          event_id: string
          processed_at: string | null
          received_at: string
          status: string
        }
        Insert: {
          claim_token?: string | null
          claimed_at?: string | null
          event_id: string
          processed_at?: string | null
          received_at?: string
          status?: string
        }
        Update: {
          claim_token?: string | null
          claimed_at?: string | null
          event_id?: string
          processed_at?: string | null
          received_at?: string
          status?: string
        }
        Relationships: []
      }
      support_chat_conversations: {
        Row: {
          created_at: string
          first_page_path: string | null
          human_agent_name: string | null
          human_takeover_until: string | null
          id: string
          last_message_at: string
          lead_email: string | null
          lead_name: string | null
          session_id: string
          slack_channel_id: string | null
          slack_thread_ts: string | null
        }
        Insert: {
          created_at?: string
          first_page_path?: string | null
          human_agent_name?: string | null
          human_takeover_until?: string | null
          id?: string
          last_message_at?: string
          lead_email?: string | null
          lead_name?: string | null
          session_id: string
          slack_channel_id?: string | null
          slack_thread_ts?: string | null
        }
        Update: {
          created_at?: string
          first_page_path?: string | null
          human_agent_name?: string | null
          human_takeover_until?: string | null
          id?: string
          last_message_at?: string
          lead_email?: string | null
          lead_name?: string | null
          session_id?: string
          slack_channel_id?: string | null
          slack_thread_ts?: string | null
        }
        Relationships: []
      }
      support_chat_leads: {
        Row: {
          business_type: string | null
          conversation_id: string | null
          created_at: string
          email: string
          id: string
          name: string
          page_path: string | null
          phone: string | null
          reason: string
        }
        Insert: {
          business_type?: string | null
          conversation_id?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          page_path?: string | null
          phone?: string | null
          reason: string
        }
        Update: {
          business_type?: string | null
          conversation_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          page_path?: string | null
          phone?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_chat_leads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_chat_messages: {
        Row: {
          agent_name: string | null
          answered: boolean | null
          content: string
          conversation_id: string
          created_at: string
          feedback: number | null
          feedback_at: string | null
          id: string
          intent: string | null
          role: string
        }
        Insert: {
          agent_name?: string | null
          answered?: boolean | null
          content: string
          conversation_id: string
          created_at?: string
          feedback?: number | null
          feedback_at?: string | null
          id?: string
          intent?: string | null
          role: string
        }
        Update: {
          agent_name?: string | null
          answered?: boolean | null
          content?: string
          conversation_id?: string
          created_at?: string
          feedback?: number | null
          feedback_at?: string | null
          id?: string
          intent?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_chat_conversations"
            referencedColumns: ["id"]
          },
        ]
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
      accept_business_invitation: {
        Args: {
          p_invitation_id: string
          p_user_id: string
          p_verified_email: string
        }
        Returns: string
      }
      acquire_competitor_watch_lock: { Args: never; Returns: boolean }
      acquire_platform_lock: {
        Args: { p_id: string; p_lock_duration?: string }
        Returns: boolean
      }
      aeo_apply_credit_topup: {
        Args: {
          p_amount_micro_usd: number
          p_checkout_session_id: string
          p_organization_id: string
        }
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
      apply_aeo_quota_ledger_delta: {
        Args: {
          p_billable_delta: number
          p_cost_delta: number
          p_engine_id: string
          p_organization_id: string
          p_overage_override: boolean
          p_sampled_delta: number
          p_usage_date: string
        }
        Returns: undefined
      }
      apply_stripe_credit_grant: {
        Args: {
          p_customer_id: string
          p_granted_micro_usd: number
          p_organization_id: string
          p_period_end: string
          p_plan_id: string
          p_receipt_id: string
          p_subscription_id: string
        }
        Returns: boolean
      }
      apply_stripe_subscription_projection: {
        Args: {
          p_bind_organization_id?: string
          p_clear?: boolean
          p_customer_id: string
          p_expected_subscription_id?: string
          p_observed_at?: string
          p_projection: Json
          p_subscription_id: string
        }
        Returns: string
      }
      authorized_business_ids: {
        Args: { p_manage?: boolean; p_write?: boolean }
        Returns: string[]
      }
      bulk_add_customer_tags: {
        Args: { customer_ids: string[]; new_tags: string[] }
        Returns: undefined
      }
      bulk_remove_customer_tags: {
        Args: { customer_ids: string[]; tags_to_remove: string[] }
        Returns: undefined
      }
      can_delete_developer: {
        Args: { target_org: string; target_user: string }
        Returns: boolean
      }
      can_write_business_logo: {
        Args: { object_name: string }
        Returns: boolean
      }
      claim_cron_job_run: {
        Args: {
          p_allow_retry?: boolean
          p_job_name: string
          p_lease_seconds?: number
          p_max_attempts?: number
          p_occurrence_key: string
        }
        Returns: {
          action: string
          attempt_count: number
          lease_token: string
        }[]
      }
      claim_referral_conversion_reward: {
        Args: { p_referee_id: string; p_reward_cents: number }
        Returns: Json
      }
      claim_review_milestone: {
        Args: { p_business_id: string }
        Returns: number
      }
      claim_stripe_webhook_event: {
        Args: { p_claim_token: string; p_event_id: string }
        Returns: string
      }
      complete_cron_job_run: {
        Args: {
          p_job_name: string
          p_lease_token: string
          p_occurrence_key: string
        }
        Returns: boolean
      }
      decrypt_token: { Args: { ciphertext: string }; Returns: string }
      delete_organization_developer: {
        Args: { target_business: string; target_member: string }
        Returns: undefined
      }
      encrypt_token: { Args: { plaintext: string }; Returns: string }
      fail_cron_job_run: {
        Args: {
          p_failure_code: string
          p_job_name: string
          p_lease_token: string
          p_occurrence_key: string
        }
        Returns: boolean
      }
      finish_referral_conversion_reward: {
        Args: { p_claim_token: string; p_referee_id: string }
        Returns: boolean
      }
      finish_stripe_webhook_event: {
        Args: {
          p_claim_token: string
          p_event_id: string
          p_succeeded: boolean
        }
        Returns: boolean
      }
      get_user_business_ids: { Args: never; Returns: string[] }
      get_user_org_ids: { Args: never; Returns: string[] }
      get_user_store_role: {
        Args: { lookup_business_id: string }
        Returns: string
      }
      import_customers_by_identity: {
        Args: { p_business_id: string; p_customers: Json }
        Returns: number
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
      merge_customers: {
        Args: {
          p_business_id: string
          p_duplicate_customer_id: string
          p_primary_customer_id: string
        }
        Returns: {
          business_id: string
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_opted_out: boolean
          last_name: string | null
          last_request_sent_at: string | null
          last_visit_at: string | null
          normalized_email: string | null
          normalized_phone: string | null
          notes: string | null
          phone: string | null
          tags: string[] | null
          total_requests_sent: number | null
          total_spend_cents: number | null
          updated_at: string
          visit_count: number | null
        }
        SetofOptions: {
          from: "*"
          to: "customers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mute_aeo_alert: { Args: { p_alert_id: string }; Returns: undefined }
      normalize_customer_email: { Args: { value: string }; Returns: string }
      normalize_customer_phone: { Args: { value: string }; Returns: string }
      refresh_campaign_stats: {
        Args: { p_campaign_id: string }
        Returns: undefined
      }
      release_competitor_watch_lock: { Args: never; Returns: undefined }
      rotate_oauth_encryption_key: { Args: never; Returns: undefined }
      upsert_customer_by_identity: {
        Args: {
          p_business_id: string
          p_customer_id?: string
          p_email?: string
          p_first_name?: string
          p_increment_requests?: number
          p_last_name?: string
          p_last_request_sent_at?: string
          p_notes?: string
          p_phone?: string
          p_tags?: string[]
        }
        Returns: {
          business_id: string
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_opted_out: boolean
          last_name: string | null
          last_request_sent_at: string | null
          last_visit_at: string | null
          normalized_email: string | null
          normalized_phone: string | null
          notes: string | null
          phone: string | null
          tags: string[] | null
          total_requests_sent: number | null
          total_spend_cents: number | null
          updated_at: string
          visit_count: number | null
        }
        SetofOptions: {
          from: "*"
          to: "customers"
          isOneToOne: true
          isSetofReturn: false
        }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
