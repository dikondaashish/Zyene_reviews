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
          average_rating: number
          brand_color: string | null
          category: string
          city: string | null
          country: string
          created_at: string
          custom_tags: string[] | null
          email: string | null
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
          rating_subtitle: string | null
          review_request_delay_minutes: number
          review_request_email_enabled: boolean
          review_request_frequency_cap_days: number
          review_request_min_amount_cents: number
          review_request_sms_enabled: boolean
          slug: string
          social_links: Json | null
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
          average_rating?: number
          brand_color?: string | null
          category?: string
          city?: string | null
          country?: string
          created_at?: string
          custom_tags?: string[] | null
          email?: string | null
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
          rating_subtitle?: string | null
          review_request_delay_minutes?: number
          review_request_email_enabled?: boolean
          review_request_frequency_cap_days?: number
          review_request_min_amount_cents?: number
          review_request_sms_enabled?: boolean
          slug: string
          social_links?: Json | null
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
          average_rating?: number
          brand_color?: string | null
          category?: string
          city?: string | null
          country?: string
          created_at?: string
          custom_tags?: string[] | null
          email?: string | null
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
          rating_subtitle?: string | null
          review_request_delay_minutes?: number
          review_request_email_enabled?: boolean
          review_request_frequency_cap_days?: number
          review_request_min_amount_cents?: number
          review_request_sms_enabled?: boolean
          slug?: string
          social_links?: Json | null
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
          last_name: string | null
          phone: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          tags?: string[] | null
          updated_at?: string
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
      notification_preferences: {
        Row: {
          business_id: string
          digest_enabled: boolean
          email_enabled: boolean
          id: string
          min_urgency_for_sms: number
          quiet_hours_end: string
          quiet_hours_start: string
          sms_enabled: boolean
          user_id: string
        }
        Insert: {
          business_id: string
          digest_enabled?: boolean
          email_enabled?: boolean
          id?: string
          min_urgency_for_sms?: number
          quiet_hours_end?: string
          quiet_hours_start?: string
          sms_enabled?: boolean
          user_id: string
        }
        Update: {
          business_id?: string
          digest_enabled?: boolean
          email_enabled?: boolean
          id?: string
          min_urgency_for_sms?: number
          quiet_hours_end?: string
          quiet_hours_start?: string
          sms_enabled?: boolean
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
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          support_email: string | null
          trial_ends_at: string | null
          type: string
          updated_at: string
        }
        Insert: {
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
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          support_email?: string | null
          trial_ends_at?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
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
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          support_email?: string | null
          trial_ends_at?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      private_feedback: {
        Row: {
          business_id: string
          content: string | null
          created_at: string
          id: string
          rating: number
          review_request_id: string | null
        }
        Insert: {
          business_id: string
          content?: string | null
          created_at?: string
          id?: string
          rating: number
          review_request_id?: string | null
        }
        Update: {
          business_id?: string
          content?: string | null
          created_at?: string
          id?: string
          rating?: number
          review_request_id?: string | null
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
      review_platforms: {
        Row: {
          access_token: string | null
          average_rating: number
          business_id: string
          created_at: string
          external_id: string | null
          external_url: string | null
          google_account_id: string | null
          google_location_id: string | null
          id: string
          last_synced_at: string | null
          platform: string
          refresh_token: string | null
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
          google_location_id?: string | null
          id?: string
          last_synced_at?: string | null
          platform: string
          refresh_token?: string | null
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
          google_location_id?: string | null
          id?: string
          last_synced_at?: string | null
          platform?: string
          refresh_token?: string | null
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
          error_message: string | null
          id: string
          opened_at: string | null
          rating_given: number | null
          review_left: boolean
          review_link: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string
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
          error_message?: string | null
          id?: string
          opened_at?: string | null
          rating_given?: number | null
          review_left?: boolean
          review_link?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
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
          error_message?: string | null
          id?: string
          opened_at?: string | null
          rating_given?: number | null
          review_left?: boolean
          review_link?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
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
          created_at: string
          external_id: string | null
          external_url: string | null
          id: string
          platform: string
          platform_id: string | null
          rating: number
          responded_at: string | null
          response_source: string | null
          response_status: string
          response_text: string | null
          review_date: string
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
          created_at?: string
          external_id?: string | null
          external_url?: string | null
          id?: string
          platform: string
          platform_id?: string | null
          rating: number
          responded_at?: string | null
          response_source?: string | null
          response_status?: string
          response_text?: string | null
          review_date: string
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
          created_at?: string
          external_id?: string | null
          external_url?: string | null
          id?: string
          platform?: string
          platform_id?: string | null
          rating?: number
          responded_at?: string | null
          response_source?: string | null
          response_status?: string
          response_text?: string | null
          review_date?: string
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
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          onboarding_completed: boolean
          phone: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          phone?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
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
      acquire_platform_lock: { Args: { p_id: string }; Returns: boolean }
      get_user_business_ids: { Args: never; Returns: string[] }
      get_user_org_ids: { Args: never; Returns: string[] }
      get_user_store_role: {
        Args: { lookup_business_id: string }
        Returns: string
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
