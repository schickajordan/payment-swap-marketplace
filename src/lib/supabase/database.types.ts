export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "buyer" | "seller" | "admin";
          full_name: string | null;
          company_name: string | null;
          phone: string | null;
          is_identity_verified: boolean;
          is_business_verified: boolean;
          notify_email_transactions: boolean;
          notify_email_messages: boolean;
          notify_email_marketing: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: "buyer" | "seller" | "admin";
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          is_identity_verified?: boolean;
          is_business_verified?: boolean;
          notify_email_transactions?: boolean;
          notify_email_messages?: boolean;
          notify_email_marketing?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          seller_id: string;
          title: string;
          description: string;
          category: string;
          make: string | null;
          model: string | null;
          model_year: number | null;
          serial_or_vin: string;
          location_city: string | null;
          location_state: string | null;
          monthly_payment_cents: number;
          deposit_cents: number;
          buyout_price_cents: number | null;
          remaining_term_months: number | null;
          condition_rating: string | null;
          deal_template: "assumption" | "payment_swap_private" | "lease_to_own";
          collateral_is_titled: boolean;
          status:
            | "draft"
            | "pending_review"
            | "active"
            | "paused"
            | "closed"
            | "flagged";
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          title: string;
          description: string;
          category: string;
          make?: string | null;
          model?: string | null;
          model_year?: number | null;
          serial_or_vin: string;
          location_city?: string | null;
          location_state?: string | null;
          monthly_payment_cents: number;
          deposit_cents?: number;
          buyout_price_cents?: number | null;
          remaining_term_months?: number | null;
          condition_rating?: string | null;
          deal_template?: "assumption" | "payment_swap_private" | "lease_to_own";
          collateral_is_titled?: boolean;
          status?:
            | "draft"
            | "pending_review"
            | "active"
            | "paused"
            | "closed"
            | "flagged";
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
        Relationships: [];
      };
      listing_assets: {
        Row: {
          id: string;
          listing_id: string;
          owner_id: string;
          asset_type: "image" | "video";
          storage_path: string;
          public_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          owner_id: string;
          asset_type: "image" | "video";
          storage_path: string;
          public_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listing_assets"]["Insert"]>;
        Relationships: [];
      };
      listing_reviews: {
        Row: {
          id: string;
          listing_id: string;
          reviewer_id: string;
          reviewer_display_name: string;
          reviewer_company: string | null;
          rating: number;
          headline: string | null;
          body: string;
          is_verified_trade: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          reviewer_id: string;
          reviewer_display_name: string;
          reviewer_company?: string | null;
          rating: number;
          headline?: string | null;
          body: string;
          is_verified_trade?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listing_reviews"]["Insert"]>;
        Relationships: [];
      };
      user_addresses: {
        Row: {
          id: string;
          profile_id: string;
          label: string;
          line1: string;
          line2: string | null;
          city: string | null;
          region: string | null;
          postal_code: string | null;
          country_code: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          label?: string;
          line1: string;
          line2?: string | null;
          city?: string | null;
          region?: string | null;
          postal_code?: string | null;
          country_code?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_addresses"]["Insert"]>;
        Relationships: [];
      };
      payment_agreements: {
        Row: {
          id: string;
          listing_id: string;
          seller_id: string;
          buyer_id: string;
          status: "draft" | "signed" | "active" | "defaulted" | "completed" | "cancelled";
          contract_status: "draft" | "uploaded" | "executed";
          contract_version: string | null;
          contract_uploaded_at: string | null;
          contract_executed_at: string | null;
          deal_checkpoint:
            | "intake"
            | "buyer_qualified"
            | "lender_workflow"
            | "permissibility_documented"
            | "lender_cleared"
            | "insurance_gate"
            | "handoff_complete"
            | "servicing_active"
            | "payoff_title"
            | "completed";
          start_date: string | null;
          end_date: string | null;
          monthly_payment_cents: number;
          escrow_enabled: boolean;
          signed_contract_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          seller_id: string;
          buyer_id: string;
          status?: "draft" | "signed" | "active" | "defaulted" | "completed" | "cancelled";
          contract_status?: "draft" | "uploaded" | "executed";
          contract_version?: string | null;
          contract_uploaded_at?: string | null;
          contract_executed_at?: string | null;
          deal_checkpoint?:
            | "intake"
            | "buyer_qualified"
            | "lender_workflow"
            | "permissibility_documented"
            | "lender_cleared"
            | "insurance_gate"
            | "handoff_complete"
            | "servicing_active"
            | "payoff_title"
            | "completed";
          start_date?: string | null;
          end_date?: string | null;
          monthly_payment_cents: number;
          escrow_enabled?: boolean;
          signed_contract_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payment_agreements"]["Insert"]>;
        Relationships: [];
      };
      legal_acceptances: {
        Row: {
          id: string;
          profile_id: string;
          doc_type: "terms" | "privacy";
          document_version: string;
          accepted_at: string;
          source: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          doc_type: "terms" | "privacy";
          document_version: string;
          accepted_at?: string;
          source?: string;
        };
        Update: Partial<Database["public"]["Tables"]["legal_acceptances"]["Insert"]>;
        Relationships: [];
      };
      agreement_payments: {
        Row: {
          id: string;
          agreement_id: string;
          due_date: string;
          amount_cents: number;
          purpose: "deposit" | "installment";
          status: "scheduled" | "processing" | "paid" | "late" | "failed";
          paid_at: string | null;
          stripe_payment_intent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          agreement_id: string;
          due_date: string;
          amount_cents: number;
          purpose?: "deposit" | "installment";
          status?: "scheduled" | "processing" | "paid" | "late" | "failed";
          paid_at?: string | null;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agreement_payments"]["Insert"]>;
        Relationships: [];
      };
      agreement_events: {
        Row: {
          id: string;
          agreement_id: string;
          actor_id: string | null;
          event_type: string;
          message: string;
          metadata: Json;
          is_internal: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          agreement_id: string;
          actor_id?: string | null;
          event_type: string;
          message: string;
          metadata?: Json;
          is_internal?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agreement_events"]["Insert"]>;
        Relationships: [];
      };
      agreement_contract_artifacts: {
        Row: {
          id: string;
          agreement_id: string;
          storage_path: string;
          original_filename: string;
          content_type: string;
          label: string | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          agreement_id: string;
          storage_path: string;
          original_filename: string;
          content_type: string;
          label?: string | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agreement_contract_artifacts"]["Insert"]>;
        Relationships: [];
      };
      message_threads: {
        Row: {
          id: string;
          agreement_id: string | null;
          listing_id: string | null;
          inquiry_buyer_id: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          agreement_id?: string | null;
          listing_id?: string | null;
          inquiry_buyer_id?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["message_threads"]["Insert"]>;
        Relationships: [];
      };
      thread_messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          sender_id: string;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["thread_messages"]["Insert"]>;
        Relationships: [];
      };
      seller_payout_accounts: {
        Row: {
          id: string;
          seller_id: string;
          stripe_account_id: string | null;
          onboarding_complete: boolean;
          charges_enabled: boolean;
          payouts_enabled: boolean;
          details_submitted: boolean;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          stripe_account_id?: string | null;
          onboarding_complete?: boolean;
          charges_enabled?: boolean;
          payouts_enabled?: boolean;
          details_submitted?: boolean;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["seller_payout_accounts"]["Insert"]>;
        Relationships: [];
      };
      stripe_webhook_events: {
        Row: {
          stripe_event_id: string;
          event_type: string;
          livemode: boolean;
          received_at: string;
          processed_at: string | null;
          processing_error: string | null;
        };
        Insert: {
          stripe_event_id: string;
          event_type: string;
          livemode?: boolean;
          received_at?: string;
          processed_at?: string | null;
          processing_error?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["stripe_webhook_events"]["Insert"]>;
        Relationships: [];
      };
      liquidity_milestones: {
        Row: {
          id: string;
          event_type: string;
          liquidity_cell: string;
          listing_id: string | null;
          agreement_id: string | null;
          agreement_payment_id: string | null;
          metadata: Json;
          dedupe_key: string;
          actor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          liquidity_cell: string;
          listing_id?: string | null;
          agreement_id?: string | null;
          agreement_payment_id?: string | null;
          metadata?: Json;
          dedupe_key: string;
          actor_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["liquidity_milestones"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
